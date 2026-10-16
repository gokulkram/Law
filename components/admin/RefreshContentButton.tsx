"use client";

import { useActionState } from "react";
import { refreshSiteContent } from "@/app/admin/(panel)/content-actions";

export default function RefreshContentButton() {
  const [state, action, pending] = useActionState(refreshSiteContent, undefined);
  return (
    <form action={action} className="adm-form">
      <div>
        <button className="adm-btn" disabled={pending}>{pending ? "Refreshing…" : "Refresh site content"}</button>
      </div>
      {state?.error && <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>}
      {state?.message && <p className="adm-alert adm-alert--ok" role="status">{state.message}</p>}
    </form>
  );
}
