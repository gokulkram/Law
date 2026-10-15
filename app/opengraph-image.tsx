import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PHONE, SITE_NAME } from "@/lib/site";

// Transparent cut-out of the brand logo (same file as the site footer).
const logoSrc = `data:image/png;base64,${await readFile(join(process.cwd(), "public/assets/logo-footer.png"), "base64")}`;

// Default social-share image (Facebook, LinkedIn, X, iMessage…) for every page.
export const alt = `${SITE_NAME} - California personal injury and wrongful death attorneys`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 80px 64px",
          background: "linear-gradient(105deg, #0B2A52 0%, #12396B 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} alt="" width={337} height={140} style={{ marginLeft: -8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 980 }}>
            California Personal Injury &amp; Wrongful Death Attorneys
          </div>
          <div style={{ fontSize: 32, color: "#D4AF37" }}>Free consultation · No fee unless we win</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#d7e0ec" }}>
          <span>Six offices across California · Available 24/7</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{PHONE}</span>
        </div>
      </div>
    ),
    size
  );
}
