"use client";

import { useActionState, useState } from "react";
import { createUser, deleteUser, resetPassword, setAttorney, updateRole, type UserActionState } from "./actions";

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor - pages, SEO, media, redirects" },
  { value: "reviewer", label: "Attorney reviewer - reads everything, signs off reviews" },
  { value: "admin", label: "Admin - everything, including users and settings" },
];

function Result({ state }: { state: UserActionState }) {
  if (!state) return null;
  if (state.error) return <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>;
  return (
    <div className="adm-alert adm-alert--ok" role="status">
      <p>{state.message}</p>
      {state.password && <code className="adm-secret">{state.password}</code>}
    </div>
  );
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);
  return (
    <form action={action} className="adm-form adm-form--grid">
      <label className="adm-field">
        <span>Email</span>
        <input type="email" name="email" required />
      </label>
      <label className="adm-field">
        <span>Full name</span>
        <input type="text" name="full_name" />
      </label>
      <label className="adm-field adm-field--wide">
        <span>Role</span>
        <select name="role" defaultValue="editor">
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </label>
      <div className="adm-field--wide">
        <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Creating…" : "Create account"}</button>
      </div>
      <div className="adm-field--wide"><Result state={state} /></div>
    </form>
  );
}

export function AttorneyLink({ id, value, attorneys }: { id: string; value: string | null; attorneys: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(setAttorney, undefined);
  return (
    <form action={action} className="adm-inline adm-attorney-link">
      <input type="hidden" name="id" value={id} />
      <select name="attorney_slug" defaultValue={value ?? ""} aria-label="Signs off reviews as">
        <option value="">Not linked</option>
        {attorneys.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
      </select>
      <button className="adm-btn adm-btn--sm" disabled={pending}>Link</button>
      <Result state={state} />
    </form>
  );
}

export function UserActions({ id, role, isSelf }: { id: string; role: string | null; isSelf: boolean }) {
  const [roleState, roleAction, rolePending] = useActionState(updateRole, undefined);
  const [resetState, resetAction, resetPending] = useActionState(resetPassword, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteUser, undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isSelf) return <span className="adm-muted">This is you</span>;
  return (
    <div className="adm-user-actions">
      <form action={roleAction} className="adm-inline">
        <input type="hidden" name="id" value={id} />
        <select name="role" defaultValue={role ?? ""} aria-label="Role">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="reviewer">Attorney reviewer</option>
          <option value="">No access</option>
        </select>
        <button className="adm-btn adm-btn--sm" disabled={rolePending}>Save</button>
      </form>
      <form action={resetAction}>
        <input type="hidden" name="id" value={id} />
        <button className="adm-btn adm-btn--sm adm-btn--ghost" disabled={resetPending}>Reset password</button>
      </form>
      {confirmDelete ? (
        <form action={deleteAction} className="adm-inline">
          <input type="hidden" name="id" value={id} />
          <button className="adm-btn adm-btn--sm adm-btn--danger" disabled={deletePending}>Confirm delete</button>
          <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
        </form>
      ) : (
        <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirmDelete(true)}>Delete</button>
      )}
      <Result state={roleState} />
      <Result state={resetState} />
      <Result state={deleteState} />
    </div>
  );
}
