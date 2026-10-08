"use client";

import { useState, type FormEvent } from "react";
import { CASE_TYPES, OFFICES, PHONE } from "@/lib/firm";

// Case-review form. Posts natively to /api/contact (works without JS, redirects to
// /thank-you); with JS it validates, submits via fetch and shows an inline message.

type Variant = "lead" | "page";

function isValid(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const val = (el.value || "").trim();
  if (!val) return false;
  if (el.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  if (el.type === "tel") return val.replace(/\D/g, "").length >= 7;
  return true;
}

export default function ContactForm({ variant }: { variant: Variant }) {
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const p = variant === "lead" ? "f" : "c";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const required = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]"));
    const bad = required.filter((el) => !isValid(el));
    setInvalid(new Set(bad.map((el) => el.name)));
    if (bad.length) {
      bad[0].focus();
      return;
    }

    setStatus("sending");
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      form.querySelector(".form-success")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      setStatus("error");
      form.querySelector(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // clear a field's error as the user types
  const clear = (name: string) => () =>
    invalid.has(name) &&
    setInvalid((s) => {
      const n = new Set(s);
      n.delete(name);
      return n;
    });

  const fieldCls = (name: string) => `field${invalid.has(name) ? " invalid" : ""}`;
  const disabled = status === "sending" || status === "sent";
  const locked = status === "sent";

  const name = (
    <div className={fieldCls("name")}>
      <label htmlFor={`${p}-name`}>Full name *</label>
      <input id={`${p}-name`} name="name" type="text" required autoComplete="name" disabled={locked} onInput={clear("name")} />
      <span className="err">Please enter your name.</span>
    </div>
  );
  const phone = (
    <div className={fieldCls("phone")}>
      <label htmlFor={`${p}-phone`}>Phone *</label>
      <input id={`${p}-phone`} name="phone" type="tel" required autoComplete="tel" disabled={locked} onInput={clear("phone")} />
      <span className="err">Enter a valid phone number.</span>
    </div>
  );
  const email = (
    <div className={fieldCls("email")}>
      <label htmlFor={`${p}-email`}>Email *</label>
      <input id={`${p}-email`} name="email" type="email" required autoComplete="email" disabled={locked} onInput={clear("email")} />
      <span className="err">Enter a valid email address.</span>
    </div>
  );
  const caseType = (
    <div className={fieldCls("case_type")}>
      <label htmlFor={`${p}-type`}>Type of case *</label>
      <select id={`${p}-type`} name="case_type" required defaultValue="" disabled={locked} onInput={clear("case_type")}>
        <option value="">Select one&hellip;</option>
        {CASE_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <span className="err">Please choose a case type.</span>
    </div>
  );

  return (
    <form name={variant === "lead" ? "lead-contact" : "contact-page"} method="POST" action="/api/contact" noValidate onSubmit={onSubmit}>
      <input type="hidden" name="form-name" value={variant === "lead" ? "lead-contact" : "contact-page"} />
      <p hidden aria-hidden="true">
        <label>
          Don&rsquo;t fill this out if you&rsquo;re human: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className={`form-success${status === "sent" ? " show" : ""}`} role="status">
        Thank you - your request has been received. An attorney will contact you shortly.
      </div>
      <div className={`form-error${status === "error" ? " show" : ""}`} role="alert">
        Sorry, something went wrong sending your message. Please call us at {PHONE.replace(" ", " ")}.
      </div>

      {variant === "lead" ? (
        <>
          <div className="grid-2">{name}{phone}</div>
          {email}
          {caseType}
          <button className="btn btn--gold btn--block" type="submit" disabled={disabled}>
            {status === "sending" ? "Sending…" : "Request My Free Review →"}
          </button>
        </>
      ) : (
        <>
          <div className="grid-2">{name}{phone}</div>
          <div className="grid-2">{email}{caseType}</div>
          <div className="field">
            <label htmlFor="c-office">Preferred office</label>
            <select id="c-office" name="office" disabled={locked}>
              <option>No preference</option>
              {OFFICES.map((o) => (
                <option key={o.label}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className={fieldCls("message")}>
            <label htmlFor="c-msg">Tell us what happened *</label>
            <textarea id="c-msg" name="message" required placeholder="Share as much or as little as you'd like." disabled={locked} onInput={clear("message")}></textarea>
            <span className="err">Please add a brief description.</span>
          </div>
          <button className="btn btn--gold btn--block" type="submit" disabled={disabled}>
            {status === "sending" ? "Sending…" : "Submit My Free Review →"}
          </button>
          <p className="form-note">&#128274; Submitting does not create an attorney-client relationship. Your information is confidential.</p>
        </>
      )}
    </form>
  );
}
