"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteMedia, finishUpload, listMedia, prepareUpload, updateAlt, type MediaItem } from "@/app/admin/(panel)/media/actions";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Media library UI: upload, alt text, copy link, delete, and a picker for image fields.

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

function dimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

/** Upload one image: signed URL from the server, file straight to storage, then register it. */
async function upload(file: File, alt: string): Promise<{ error?: string; item?: MediaItem }> {
  const prep = await prepareUpload(file.type, file.size);
  if (prep.error || !prep.path || !prep.token) return { error: prep.error ?? "Couldn't start the upload." };
  const storage = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } }).storage;
  const { error } = await storage.from("media").uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type });
  if (error) return { error: `Upload failed: ${error.message}` };
  const { width, height } = await dimensions(file);
  return finishUpload({ path: prep.path, alt, width, height, mime: file.type, size: file.size });
}

export function Uploader({ onUploaded }: { onUploaded?: (item: MediaItem) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [state, setState] = useState<{ error?: string; message?: string }>({});
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      className="adm-form adm-form--grid"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file) return;
        start(async () => {
          const r = await upload(file, alt);
          if (r.error) { setState({ error: r.error }); return; }
          setState({ message: "Uploaded." });
          setFile(null);
          setAlt("");
          if (input.current) input.current.value = "";
          if (r.item) onUploaded?.(r.item);
        });
      }}
    >
      <label className="adm-field">
        <span>Image (JPEG, PNG, WebP, AVIF or GIF, up to 10 MB)</span>
        <input ref={input} type="file" accept={ACCEPT} required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <label className="adm-field">
        <span>Alt text (describe the image for screen readers)</span>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Jane Doe, founding partner" />
      </label>
      <div className="adm-field--wide"><button className="adm-btn adm-btn--primary" disabled={pending || !file}>{pending ? "Uploading…" : "Upload"}</button></div>
      {state.error && <p className="adm-alert adm-alert--error adm-field--wide" role="alert">{state.error}</p>}
      {state.message && <p className="adm-alert adm-alert--ok adm-field--wide" role="status">{state.message}</p>}
    </form>
  );
}

function MediaCard({ m, canEdit, onDeleted }: { m: MediaItem; canEdit: boolean; onDeleted: (id: string) => void }) {
  const [alt, setAlt] = useState(m.alt);
  const [state, setState] = useState<{ error?: string; message?: string }>({});
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return (
    <figure className="md-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.url} alt={m.alt} loading="lazy" />
      <figcaption>
        <small className="adm-muted">{m.width && m.height ? `${m.width}×${m.height}` : ""}{m.size_bytes ? ` · ${Math.round(m.size_bytes / 1024)} KB` : ""}</small>
        {canEdit ? (
          <div className="adm-inline">
            <input value={alt} onChange={(e) => setAlt(e.target.value)} aria-label="Alt text" placeholder="Alt text" />
            <button type="button" className="adm-btn adm-btn--sm" disabled={pending || alt === m.alt} onClick={() => start(async () => setState(await updateAlt(m.id, alt)))}>Save</button>
          </div>
        ) : <span>{m.alt || <em className="adm-muted">No alt text</em>}</span>}
        <div className="adm-inline">
          <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => { navigator.clipboard?.writeText(m.url); setState({ message: "Link copied." }); }}>Copy link</button>
          {canEdit && (confirm ? (
            <>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" disabled={pending} onClick={() => start(async () => { const r = await deleteMedia(m.id); setState(r); setConfirm(false); if (!r.error) onDeleted(m.id); })}>Delete</button>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirm(false)}>Cancel</button>
            </>
          ) : <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setConfirm(true)}>Delete…</button>)}
        </div>
        {state.error && <p className="adm-alert adm-alert--error" role="alert">{state.error}</p>}
        {state.message && <p className="adm-alert adm-alert--ok" role="status">{state.message}</p>}
      </figcaption>
    </figure>
  );
}

export function MediaGrid({ items: initial, canEdit }: { items: MediaItem[]; canEdit: boolean }) {
  const [items, setItems] = useState(initial);
  useEffect(() => setItems(initial), [initial]);
  if (!items.length) return <p className="adm-muted">No images yet.</p>;
  return (
    <>
      <p className="adm-muted">{items.length} image{items.length === 1 ? "" : "s"}</p>
      <div className="md-grid">
        {items.map((m) => <MediaCard key={m.id} m={m} canEdit={canEdit} onDeleted={(id) => setItems((list) => list.filter((x) => x.id !== id))} />)}
      </div>
    </>
  );
}

/** Image field: shows the current image and lets the user pick one from the library (or upload). */
export function MediaPicker({ label, value, onChange, hint, disabled }: { label: string; value: string; onChange: (url: string) => void; hint?: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [pending, start] = useTransition();
  const toggle = () => {
    setOpen((o) => !o);
    if (!items) start(async () => setItems(await listMedia()));
  };
  return (
    <div className="adm-field ed-field md-picker">
      <span className="ed-label">{label}</span>
      <div className="md-picker__row">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="md-picker__thumb" />
        ) : <span className="md-picker__empty">No image</span>}
        <div className="ed-add">
          <button type="button" className="adm-btn adm-btn--sm" onClick={toggle} disabled={disabled}>{open ? "Close" : "Choose image"}</button>
          {value && <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => onChange("")} disabled={disabled}>Remove</button>}
        </div>
      </div>
      {hint && <small className="ed-hint">{hint}</small>}
      {open && (
        <div className="md-picker__panel">
          <Uploader onUploaded={(item) => { setItems((l) => [item, ...(l ?? [])]); onChange(item.url); setOpen(false); }} />
          {pending && !items ? <p className="adm-muted">Loading…</p> : (
            <div className="md-grid md-grid--small">
              {(items ?? []).map((m) => (
                <button type="button" key={m.id} className={`md-choice${m.url === value ? " is-selected" : ""}`} onClick={() => { onChange(m.url); setOpen(false); }} title={m.alt}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
