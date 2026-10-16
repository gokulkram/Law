"use client";

import { useActionState, useState, useTransition } from "react";
import type { SiteSeo } from "@/lib/admin/settings-model";
import { saveSiteSeo, setDiscourageIndexing, type SettingsState } from "./actions";

function Result({ state }: { state: SettingsState }) {
  if (state?.error) return <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>;
  if (state?.message) return <p className="adm-alert adm-alert--ok" role="status">{state.message}</p>;
  return null;
}

export function SeoSettingsForm({ value }: { value: SiteSeo }) {
  const [state, action, pending] = useActionState(saveSiteSeo, undefined);
  // After a failed save, show what was typed (React resets the form); otherwise the saved values.
  const v = state?.values;
  const val = (k: keyof SiteSeo & string) => v?.[k] ?? (k === "robotsDisallow" ? (value.robotsDisallow ?? []).join("\n") : (value[k] as string | undefined));
  return (
    <form action={action} className="adm-form" key={v ? JSON.stringify(v) : "saved"}>
      <h3 className="ed-h3">Search engine verification</h3>
      <label className="adm-field">
        <span>Google Search Console code</span>
        <input name="googleVerification" defaultValue={val("googleVerification")} placeholder="e.g. a1B2c3D4e5…" />
        <small className="ed-hint">In Search Console choose “HTML tag” and paste only the <code>content=&quot;…&quot;</code> value.</small>
      </label>
      <label className="adm-field">
        <span>Bing Webmaster Tools code</span>
        <input name="bingVerification" defaultValue={val("bingVerification")} />
      </label>

      <h3 className="ed-h3">Analytics</h3>
      <label className="adm-field">
        <span>Google Analytics 4 measurement ID</span>
        <input name="ga4Id" defaultValue={val("ga4Id")} placeholder="G-XXXXXXXXXX" />
      </label>
      <label className="adm-field">
        <span>…or Google Tag Manager container ID</span>
        <input name="gtmId" defaultValue={val("gtmId")} placeholder="GTM-XXXXXXX" />
        <small className="ed-hint">Use one or the other. Adding analytics may require updating the Privacy Policy (California privacy law).</small>
      </label>

      <h3 className="ed-h3">robots.txt</h3>
      <label className="adm-field">
        <span>Extra paths to block from crawling</span>
        <textarea name="robotsDisallow" rows={3} defaultValue={val("robotsDisallow")} placeholder="/thank-you" />
        <small className="ed-hint">One path per line. /admin and /api are always blocked.</small>
      </label>

      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button></div>
      <Result state={state} />
    </form>
  );
}

export function IndexingSwitch({ on }: { on: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const [state, setState] = useState<SettingsState>(undefined);
  const [pending, start] = useTransition();
  const run = (v: boolean) => start(async () => { setState(await setDiscourageIndexing(v)); setConfirm(false); });
  return (
    <div className="ed-stack">
      {on ? (
        <>
          <p className="adm-alert adm-alert--error"><strong>Search engines are blocked.</strong> robots.txt disallows the whole site and every page is marked noindex. Turn this off before launch, or the firm disappears from Google.</p>
          <div><button type="button" className="adm-btn adm-btn--primary" onClick={() => run(false)} disabled={pending}>Allow search engines</button></div>
        </>
      ) : confirm ? (
        <div className="ed-confirm">
          <p>Block search engines from the entire website? Use this only for a staging or pre-launch site - on the live site it removes the firm from Google.</p>
          <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => run(true)} disabled={pending}>Yes, block search engines</button>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setConfirm(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <p className="adm-muted">Search engines may index the site (normal for the live website).</p>
          <div><button type="button" className="adm-btn adm-btn--sm" onClick={() => setConfirm(true)}>Block search engines…</button></div>
        </>
      )}
      <Result state={state} />
    </div>
  );
}
