"use client";

import { useActionState, useState } from "react";
import { OFFICE_IDS } from "@/lib/admin/page-model";
import { createPage } from "../actions";

const TYPES = [
  { value: "service", label: "Practice area", prefix: "/", example: "/boating-accident-lawyer  or  /wrongful-death/boating-accident" },
  { value: "article", label: "Guide", prefix: "/resources/", example: "/resources/how-to-file-a-claim" },
  { value: "local", label: "City + practice area", prefix: `/${OFFICE_IDS[0]}/`, example: `/${OFFICE_IDS[0]}/motorcycle-accident-lawyer` },
  { value: "attorney", label: "Attorney profile", prefix: "/attorneys/", example: "/attorneys/jane-doe" },
  { value: "location", label: "Office", prefix: "/", example: OFFICE_IDS.map((o) => `/${o}`).join(", ") },
];

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function NewPageForm() {
  const [state, action, pending] = useActionState(createPage, undefined);
  const [type, setType] = useState("service");
  const [name, setName] = useState("");
  const [path, setPath] = useState("/");
  const [touched, setTouched] = useState(false);
  const t = TYPES.find((x) => x.value === type)!;

  const suggest = (n: string, ty = type) => {
    const p = TYPES.find((x) => x.value === ty)!.prefix;
    return ty === "location" ? p : p + slugify(n);
  };

  return (
    <form action={action} className="adm-form">
      {state?.error && <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>}
      <label className="adm-field">
        <span>Type of page</span>
        <select name="type" value={type} onChange={(e) => { setType(e.target.value); if (!touched) setPath(suggest(name, e.target.value)); }}>
          {TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </label>
      <label className="adm-field">
        <span>Name</span>
        <input name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!touched) setPath(suggest(e.target.value)); }} placeholder={type === "attorney" ? "Jane Doe" : "Boating Accidents"} />
      </label>
      <label className="adm-field">
        <span>Web address (URL)</span>
        <input name="path" required value={path} onChange={(e) => { setPath(e.target.value); setTouched(true); }} />
        <small className="ed-hint">For example {t.example}. The address can&rsquo;t be changed after the page is created.</small>
      </label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Creating…" : "Create draft"}</button></div>
      <p className="adm-muted">The page starts as a draft - nothing appears on the website until you publish it.</p>
    </form>
  );
}
