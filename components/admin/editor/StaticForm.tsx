"use client";

// Form for a main page's text, generated from its field model (lib/admin/static-model.ts).
import { STATIC_MODELS, type StaticField } from "@/lib/admin/static-model";
import { cleanBlocks, Field, INLINE_HINT, LinesField, RowTools, SectionsEditor, type Section } from "./fields";

type Obj = Record<string, unknown>;

function Paragraphs({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const set = (i: number, v: string) => onChange(value.map((p, k) => (k === i ? v : p)));
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ed-stack">
      {label && <span className="ed-label">{label}</span>}
      {value.map((p, i) => (
        <div className="ed-block" key={i}>
          <div className="ed-row">
            <small className="ed-hint">Paragraph {i + 1}</small>
            <RowTools i={i} count={value.length} label="paragraph" onMove={(by) => move(i, by)} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
          </div>
          <textarea rows={Math.max(3, Math.ceil(p.length / 110) + 1)} value={p} onChange={(e) => set(i, e.target.value)} aria-label={`Paragraph ${i + 1}`} />
        </div>
      ))}
      <small className="ed-hint">{INLINE_HINT}</small>
      <div><button type="button" className="adm-btn adm-btn--sm" onClick={() => onChange([...value, ""])}>+ Add paragraph</button></div>
    </div>
  );
}

function FieldInput({ f, value, onChange }: { f: StaticField; value: unknown; onChange: (v: unknown) => void }) {
  switch (f.kind) {
    case "text":
      return <Field label={f.label} value={(value as string) ?? ""} onChange={onChange} max={f.max} hint={f.hint} />;
    case "textarea":
      return <Field label={f.label} rows={3} value={(value as string) ?? ""} onChange={onChange} max={f.max} hint={f.hint} />;
    case "rich":
      return <Field label={f.label} rows={2} value={(value as string) ?? ""} onChange={onChange} max={f.max} hint={f.hint ?? INLINE_HINT} />;
    case "list":
      return <LinesField label={f.label} value={(value as string[]) ?? []} onChange={onChange} hint={INLINE_HINT} />;
    case "paragraphs":
      return <Paragraphs label={f.label} value={(value as string[]) ?? []} onChange={onChange} />;
    case "sections":
      return <SectionsEditor value={(value as Section[]) ?? []} onChange={onChange} />;
    case "items": {
      const items = (value as Obj[]) ?? [];
      return (
        <div className="ed-stack">
          {f.label && <span className="ed-label">{f.label}</span>}
          {f.itemLabels.map((itemLabel, i) => (
            <fieldset className="ed-group" key={i}>
              <legend>{itemLabel}</legend>
              <Fields fields={f.fields} value={items[i] ?? {}} onChange={(v) => onChange(f.itemLabels.map((_, k) => (k === i ? v : items[k] ?? {})))} />
            </fieldset>
          ))}
        </div>
      );
    }
    case "group":
      return f.label ? (
        <fieldset className="ed-group">
          <legend>{f.label}</legend>
          <Fields fields={f.fields} value={(value as Obj) ?? {}} onChange={onChange} />
        </fieldset>
      ) : (
        <Fields fields={f.fields} value={(value as Obj) ?? {}} onChange={onChange} />
      );
  }
}

function Fields({ fields, value, onChange }: { fields: StaticField[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="ed-stack">
      {fields.map((f) => <FieldInput key={f.key} f={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />)}
    </div>
  );
}

export default function StaticForm({ path, content, onChange }: { path: string; content: Obj; onChange: (v: Obj) => void }) {
  const panels = STATIC_MODELS[path] ?? [];
  return (
    <>
      {panels.map((panel) => (
        <section className="adm-card" key={panel.title}>
          <h2 className="adm-h2">{panel.title}</h2>
          {panel.note && <p className="adm-muted">{panel.note}</p>}
          <Fields fields={panel.fields} value={content} onChange={onChange} />
        </section>
      ))}
    </>
  );
}

/** Drop blank list items / paragraphs and blank lines inside list blocks before saving. */
export function cleanStatic(path: string, content: Obj): Obj {
  const walk = (fields: StaticField[], obj: Obj): Obj => {
    const out: Obj = { ...obj };
    for (const f of fields) {
      const v = obj[f.key];
      if ((f.kind === "list" || f.kind === "paragraphs") && Array.isArray(v)) out[f.key] = (v as string[]).map((s) => s.trim()).filter(Boolean);
      else if (f.kind === "sections" && Array.isArray(v)) out[f.key] = (v as Section[]).map((s) => ({ ...s, blocks: cleanBlocks(s.blocks) }));
      else if (f.kind === "items" && Array.isArray(v)) out[f.key] = (v as Obj[]).map((item) => walk(f.fields, item));
      else if (f.kind === "group" && v && typeof v === "object") out[f.key] = walk(f.fields, v as Obj);
    }
    return out;
  };
  return walk((STATIC_MODELS[path] ?? []).flatMap((p) => p.fields), content);
}
