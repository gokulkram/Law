import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/content/types";

// Renders the small inline syntax used in content files: **bold** and [text](/path).
const TOKEN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
// Links editors may use: site paths, https, email and phone. Anything else renders as plain text.
export const SAFE_HREF = /^(\/(?!\/)|https:\/\/|mailto:|tel:)/i;

export function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else if (!SAFE_HREF.test(m[3])) out.push(m[2]); // unsafe link (e.g. javascript:) - show the text only
    else {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={m.index} href={href}>{m[2]}</Link>
        ) : (
          <a key={m.index} href={href} target="_blank" rel="noopener">{m[2]}</a>
        )
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b) return <p key={i}><Inline text={b.p} /></p>;
        if ("ul" in b) return <ul key={i} className="bul">{b.ul.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ul>;
        if ("ol" in b) return <ol key={i} className="num">{b.ol.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ol>;
        return <div key={i} className="callout"><Inline text={b.callout} /></div>;
      })}
    </>
  );
}
