import { ImageResponse } from "next/og";
import { PHONE, SITE_NAME } from "@/lib/site";

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
          padding: "72px 80px",
          background: "linear-gradient(105deg, #0B1F38 0%, #163A63 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 14, height: 56, background: "#C9A24B", borderRadius: 4 }} />
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 980 }}>
            California Personal Injury &amp; Wrongful Death Attorneys
          </div>
          <div style={{ fontSize: 32, color: "#E0C988" }}>Free consultation · No fee unless we win</div>
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
