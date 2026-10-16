"use client";

import { useActionState, useState, useTransition } from "react";
import type { Redirect } from "@/lib/admin/settings-model";
import { deleteRedirect, saveRedirect, type RedirectState } from "./actions";

export type PageOption = { path: string; name: string };

function Result({ state }: { state: RedirectState }) {
  if (state?.error) return <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>;
  if (state?.message) return <p className="adm-alert adm-alert--ok" role="status">{state.message}</p>;
  return null;
}

/** Add a redirect, or edit one when `value` is given. */
export function RedirectForm({ value, pages, onDone }: { value?: Redirect; pages: PageOption[]; onDone?: () => void }) {
  const [state, action, pending] = useActionState(async (prev: RedirectState, form: FormData) => {
    const r = await saveRedirect(prev, form);
    if (r?.message) onDone?.();
    return r;
  }, undefined);
  // After a failed save, show what was typed again (React resets forms after an action).
  const shown = state?.values ?? value;
  const listId = `pages-${value?.id ?? "new"}`;
  return (
    <form action={action} className="adm-form adm-form--grid" key={state?.values ? JSON.stringify(state.values) : state?.message ?? "form"}>
      {value?.id && <input type="hidden" name="id" value={value.id} />}
      <label className="adm-field">
        <span>Old URL</span>
        <input name="source" required defaultValue={shown?.source} placeholder="/old-page" />
      </label>
      <label className="adm-field">
        <span>Send visitors to</span>
        <input name="destination" required defaultValue={shown?.destination} placeholder="/new-page" list={listId} />
        <datalist id={listId}>{pages.map((p) => <option key={p.path} value={p.path}>{p.name}</option>)}</datalist>
      </label>
      <label className="adm-field adm-field--wide">
        <span>Type</span>
        <select name="permanent" defaultValue={shown?.permanent === false ? "temporary" : "permanent"}>
          <option value="permanent">Permanent - the page has moved for good (passes its search ranking on)</option>
          <option value="temporary">Temporary - the old URL will come back</option>
        </select>
      </label>
      <div className="adm-field--wide ed-add">
        <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Saving…" : value?.id ? "Save" : "Add redirect"}</button>
        {onDone && <button type="button" className="adm-btn adm-btn--ghost" onClick={onDone}>Cancel</button>}
      </div>
      <div className="adm-field--wide"><Result state={state} /></div>
    </form>
  );
}

export function RedirectRow({ r, pages, canEdit }: { r: Redirect; pages: PageOption[]; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState<RedirectState>(undefined);
  const [pending, start] = useTransition();
  if (editing) {
    return (
      <tr><td colSpan={4}><RedirectForm value={r} pages={pages} onDone={() => setEditing(false)} /></td></tr>
    );
  }
  return (
    <tr>
      <td><code>{r.source}</code></td>
      <td><a className="adm-path" href={r.destination} target="_blank" rel="noopener">{r.destination} ↗</a></td>
      <td>{r.permanent ? "Permanent" : "Temporary"}</td>
      <td>
        {canEdit && (
          <div className="adm-user-actions">
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(true)}>Edit</button>
            {confirm ? (
              <>
                <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" disabled={pending} onClick={() => start(async () => setState(await deleteRedirect(r.id!)))}>Confirm remove</button>
                <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirm(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirm(true)}>Remove</button>
            )}
            <Result state={state} />
          </div>
        )}
      </td>
    </tr>
  );
}
