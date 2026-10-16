"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const error = state?.error ?? notice;
  return (
    <form action={action} className="adm-form">
      {error && <p className="adm-alert adm-alert--error" role="alert">{error}</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="adm-field">
        <span>Email</span>
        <input type="email" name="email" autoComplete="username" required defaultValue={state?.email} autoFocus />
      </label>
      <label className="adm-field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="adm-btn adm-btn--primary adm-btn--block" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
