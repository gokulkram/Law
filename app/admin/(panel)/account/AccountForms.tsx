"use client";

import { useActionState } from "react";
import { changePassword, updateName, type AccountState } from "./actions";
import { MIN_PASSWORD } from "@/lib/admin/password-rules";

function Result({ state }: { state: AccountState }) {
  if (state?.error) return <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>;
  if (state?.message) return <p className="adm-alert adm-alert--ok" role="status">{state.message}</p>;
  return null;
}

export function NameForm({ fullName }: { fullName: string }) {
  const [state, action, pending] = useActionState(updateName, undefined);
  return (
    <form action={action} className="adm-form">
      <label className="adm-field">
        <span>Full name</span>
        <input type="text" name="full_name" defaultValue={fullName} autoComplete="name" />
      </label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>Save name</button></div>
      <Result state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="adm-form" key={state?.message}>
      <label className="adm-field">
        <span>Current password</span>
        <input type="password" name="current" autoComplete="current-password" required />
      </label>
      <label className="adm-field">
        <span>New password</span>
        <input type="password" name="password" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </label>
      <label className="adm-field">
        <span>Repeat new password</span>
        <input type="password" name="confirm" autoComplete="new-password" minLength={MIN_PASSWORD} required />
      </label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Saving…" : "Change password"}</button></div>
      <Result state={state} />
    </form>
  );
}
