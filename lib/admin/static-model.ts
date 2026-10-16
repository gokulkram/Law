// Editable text of the hand-built pages (home, about, legal pages, hubs): which fields each page has,
// how the editor shows them, and a structural check. The pages' layout, icons and code-dependent
// links stay in components/static-pages/. Pure - shared by the editor and its Server Actions.

export type StaticField =
  | { key: string; label: string; kind: "text" | "textarea" | "rich"; hint?: string; max?: number; optional?: boolean }
  /** A list of short items (bullets), each with inline formatting. */
  | { key: string; label: string; kind: "list"; hint?: string }
  /** Paragraphs with inline formatting. */
  | { key: string; label: string; kind: "paragraphs" }
  /** Headed sections of paragraphs / lists / callouts - the long-form body of a page. */
  | { key: string; label: string; kind: "sections" }
  /** A fixed number of items with the same fields (their icons or labels live in code). */
  | { key: string; label: string; kind: "items"; itemLabels: string[]; fields: StaticField[] }
  | { key: string; label: string; kind: "group"; fields: StaticField[] };

export type StaticPanel = { title: string; note?: string; fields: StaticField[] };

const hero = (note?: string): StaticPanel => ({
  title: "Top of the page",
  note,
  fields: [{ key: "hero", label: "", kind: "group", fields: [{ key: "title", label: "Main heading (H1)", kind: "text" }, { key: "text", label: "Text under the heading", kind: "textarea" }] }],
});
const cta: StaticPanel = {
  title: "Call-to-action band (bottom of the page)",
  fields: [{
    key: "cta", label: "", kind: "group",
    fields: [
      { key: "eyebrow", label: "Small heading", kind: "text" },
      { key: "title", label: "Heading", kind: "text" },
      { key: "text", label: "Text", kind: "textarea" },
      { key: "button", label: "Button text", kind: "text" },
    ],
  }],
};
const legalBody: StaticPanel = { title: "Page text", fields: [{ key: "body", label: "", kind: "sections" }] };

export const STATIC_MODELS: Record<string, StaticPanel[]> = {
  "/": [
    {
      title: "Top of the page",
      note: "The case-review form, phone number and background photo are part of the design.",
      fields: [{
        key: "hero", label: "", kind: "group",
        fields: [
          { key: "badge", label: "Badge above the heading", kind: "text" },
          { key: "titleStart", label: "Heading - start", kind: "text" },
          { key: "titleAccent", label: "Heading - highlighted part (gold)", kind: "text" },
          { key: "titleEnd", label: "Heading - end", kind: "text" },
          { key: "text", label: "Text under the heading", kind: "textarea" },
          { key: "button", label: "Button text", kind: "text" },
          { key: "formTitle", label: "Form heading", kind: "text" },
          { key: "formText", label: "Form text", kind: "text" },
        ],
      }],
    },
    { title: "“What we do” section", fields: [{ key: "intro", label: "", kind: "group", fields: [{ key: "eyebrow", label: "Small heading", kind: "text" }, { key: "title", label: "Heading", kind: "text" }, { key: "text", label: "Text", kind: "textarea" }] }] },
    {
      title: "Personal injury card",
      note: "The list of practice areas in this card links to fixed pages and is part of the design.",
      fields: [{ key: "injury", label: "", kind: "group", fields: [{ key: "title", label: "Heading", kind: "text" }, { key: "text", label: "Text", kind: "textarea" }, { key: "button", label: "Button text", kind: "text" }] }],
    },
    {
      title: "Wrongful death card",
      fields: [{
        key: "death", label: "", kind: "group",
        fields: [
          { key: "eyebrow", label: "Small heading", kind: "text" },
          { key: "title", label: "Heading", kind: "text" },
          { key: "text", label: "Text", kind: "textarea" },
          { key: "checklist", label: "Checklist", kind: "list" },
          { key: "promise", label: "Promise line", kind: "rich" },
          { key: "button", label: "Button text", kind: "text" },
        ],
      }],
    },
    {
      title: "“How it works” steps",
      fields: [{
        key: "process", label: "", kind: "group",
        fields: [
          { key: "eyebrow", label: "Small heading", kind: "text" },
          { key: "title", label: "Heading", kind: "text" },
          { key: "steps", label: "Steps", kind: "items", itemLabels: ["Step 1", "Step 2", "Step 3", "Step 4"], fields: [{ key: "title", label: "Title", kind: "text" }, { key: "text", label: "Text", kind: "textarea" }] },
        ],
      }],
    },
    cta,
  ],
  "/about": [
    hero(),
    {
      title: "Our story",
      fields: [{
        key: "story", label: "", kind: "group",
        fields: [
          { key: "eyebrow", label: "Small heading", kind: "text" },
          { key: "title", label: "Heading", kind: "text" },
          { key: "paragraphs", label: "Paragraphs", kind: "paragraphs" },
          { key: "tagStrong", label: "Photo tag - bold", kind: "text" },
          { key: "tagText", label: "Photo tag - text", kind: "text" },
        ],
      }],
    },
    {
      title: "Values",
      fields: [{
        key: "values", label: "", kind: "group",
        fields: [
          { key: "eyebrow", label: "Small heading", kind: "text" },
          { key: "title", label: "Heading", kind: "text" },
          { key: "items", label: "Values", kind: "items", itemLabels: ["Value 1", "Value 2", "Value 3"], fields: [{ key: "title", label: "Title", kind: "text" }, { key: "text", label: "Text", kind: "textarea" }] },
        ],
      }],
    },
    cta,
  ],
  "/contact": [
    hero(),
    { title: "Form", note: "The form itself and the office list are part of the design.", fields: [{ key: "form", label: "", kind: "group", fields: [{ key: "eyebrow", label: "Small heading", kind: "text" }, { key: "title", label: "Heading", kind: "text" }, { key: "text", label: "Text", kind: "textarea" }] }] },
    {
      title: "Sidebar",
      note: "The phone number and email address come from the firm details.",
      fields: [{
        key: "sidebar", label: "", kind: "group",
        fields: [
          { key: "title", label: "Heading", kind: "text" },
          { key: "text", label: "Text", kind: "textarea" },
          { key: "emailLabel", label: "Email label", kind: "text" },
          { key: "visitText", label: "Visits note", kind: "rich" },
        ],
      }],
    },
  ],
  "/privacy": [
    hero(),
    { title: "Policy", note: "A “Contact us” section with the firm’s email and phone is added at the end automatically.", fields: [{ key: "updated", label: "Last updated (as shown on the page)", kind: "text" }, { key: "body", label: "", kind: "sections" }] },
  ],
  "/disclaimer": [hero(), legalBody],
  "/wrongful-death": [
    hero(),
    {
      title: "Page text",
      note: "The lists of wrongful death pages and guides below the text are filled in automatically.",
      fields: [
        { key: "intro", label: "Opening paragraph", kind: "rich" },
        { key: "body", label: "", kind: "sections" },
        { key: "casesTitle", label: "Heading above the case types", kind: "text" },
        { key: "guidesTitle", label: "Heading above the guides", kind: "text" },
      ],
    },
    {
      title: "Sidebar",
      note: "The figures in the sidebar are edited with the firm’s statistics.",
      fields: [{
        key: "sidebar", label: "", kind: "group",
        fields: [
          { key: "title", label: "Heading", kind: "text" },
          { key: "text", label: "Text", kind: "textarea" },
          { key: "button", label: "Button text", kind: "text" },
          { key: "callText", label: "Text above the phone number", kind: "text" },
          { key: "statsTitle", label: "Heading above the figures", kind: "text" },
        ],
      }],
    },
    cta,
  ],
  "/practice-areas": [
    hero(),
    {
      title: "Practice-area groups",
      note: "The cards in each group are the practice-area pages themselves (their name and card summary).",
      fields: [
        { key: "groupIntros", label: "Group introductions", kind: "items", itemLabels: ["Wrongful Death", "Vehicle Accidents", "Serious Injuries", "Other Practice Areas"], fields: [{ key: "intro", label: "Introduction", kind: "textarea" }] },
        { key: "overviewSummary", label: "Card text for the Wrongful Death overview", kind: "textarea", max: 160 },
        { key: "moreLabel", label: "“Learn more” label on cards", kind: "text" },
        { key: "notListed", label: "", kind: "group", fields: [{ key: "title", label: "“Not listed” heading", kind: "text" }, { key: "text", label: "“Not listed” text", kind: "rich" }] },
      ],
    },
    cta,
  ],
  "/resources": [hero(), { title: "Guide cards", note: "The cards are the guides themselves.", fields: [{ key: "moreLabel", label: "“Read the guide” label on cards", kind: "text" }] }, cta],
  "/site-map": [hero("The list of pages is filled in automatically.")],
  "/attorneys": [hero("The attorney cards come from the attorney profiles."), cta],
};

export const hasStaticModel = (path: string) => path in STATIC_MODELS;

// ---------------------------------------------------------------- structure + text

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isBlock = (b: unknown) => isObj(b) && Object.keys(b).length === 1 && (isStr(b.p) || isStr(b.callout) || (Array.isArray(b.ul) && b.ul.every(isStr)) || (Array.isArray(b.ol) && b.ol.every(isStr)));

function checkField(f: StaticField, v: unknown, at: string, out: string[]) {
  const where = `${at}${f.key}`;
  switch (f.kind) {
    case "text": case "textarea": case "rich":
      if (v === undefined && f.optional) return;
      if (!isStr(v)) out.push(`“${where}” must be text.`);
      return;
    case "list": case "paragraphs":
      if (!Array.isArray(v) || !v.every(isStr)) out.push(`“${where}” must be a list of text.`);
      return;
    case "sections":
      if (!Array.isArray(v) || !v.every((s) => isObj(s) && isStr(s.heading) && Array.isArray(s.blocks) && s.blocks.every(isBlock))) out.push(`“${where}” must be a list of sections.`);
      return;
    case "items":
      if (!Array.isArray(v) || v.length !== f.itemLabels.length) { out.push(`“${where}” must have exactly ${f.itemLabels.length} items.`); return; }
      v.forEach((item, i) => (isObj(item) ? checkFields(f.fields, item, `${where}[${i}].`, out) : out.push(`“${where}[${i}]” must be an object.`)));
      return;
    case "group":
      if (!isObj(v)) { out.push(`“${where}” is missing.`); return; }
      checkFields(f.fields, v, `${where}.`, out);
  }
}
function checkFields(fields: StaticField[], obj: Obj, at: string, out: string[]) {
  for (const f of fields) checkField(f, obj[f.key], at, out);
  const known = new Set(fields.map((f) => f.key));
  for (const k of Object.keys(obj)) if (!known.has(k)) out.push(`Unknown field “${at}${k}”.`);
}

/** Structural problems with a main page's content (name + group + its text fields). */
export function staticShapeErrors(path: string, content: Obj): string[] {
  const out: string[] = [];
  if (!isStr(content.name)) out.push("“name” must be text.");
  if (!isStr(content.group)) out.push("“group” must be text.");
  const { name: _n, group: _g, ...text } = content;
  const fields = (STATIC_MODELS[path] ?? []).flatMap((p) => p.fields);
  checkFields(fields, text, "", out);
  return out;
}

/** Every piece of text on the page with where it is, for the content checks. Empty required text is reported. */
export function staticTexts(path: string, content: Obj): { texts: string[]; empty: string[] } {
  const texts: string[] = [];
  const empty: string[] = [];
  const walk = (fields: StaticField[], obj: Obj, at: string) => {
    for (const f of fields) {
      const v = obj?.[f.key];
      const label = [at, f.label].filter(Boolean).join(" › ");
      switch (f.kind) {
        case "text": case "textarea": case "rich":
          if (isStr(v) && v.trim()) texts.push(v);
          else if (!f.optional) empty.push(label);
          break;
        case "list": case "paragraphs":
          if (!Array.isArray(v) || !v.length) empty.push(label);
          else v.forEach((s, i) => (isStr(s) && s.trim() ? texts.push(s) : empty.push(`${label} ${i + 1}`)));
          break;
        case "sections":
          if (!Array.isArray(v) || !v.length) { empty.push(label || "Page text"); break; }
          v.forEach((s: { heading: string; blocks: Obj[] }, i: number) => {
            if (!s.heading?.trim()) empty.push(`Section ${i + 1} heading`);
            else texts.push(s.heading);
            const bt = s.blocks.flatMap((b) => [b.p ?? b.callout ?? "", ...((b.ul ?? b.ol ?? []) as string[])]).filter((t) => isStr(t) && t.trim()) as string[];
            if (!bt.length) empty.push(`Section ${i + 1} (“${s.heading || "untitled"}”) text`);
            texts.push(...bt);
          });
          break;
        case "items":
          (Array.isArray(v) ? v : []).forEach((item, i) => walk(f.fields, item as Obj, [label, f.itemLabels[i]].filter(Boolean).join(" › ")));
          break;
        case "group":
          walk(f.fields, (isObj(v) ? v : {}) as Obj, label);
      }
    }
  };
  walk((STATIC_MODELS[path] ?? []).flatMap((p) => p.fields), content, "");
  return { texts, empty };
}
