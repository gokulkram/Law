// Receives case-review form submissions and emails them to the firm via Resend (https://resend.com).
//
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  – Resend API key
//   LEAD_TO_EMAIL   – inbox that receives new leads (comma-separate for several)
// Optional:
//   LEAD_FROM_EMAIL – sender address on a domain verified in Resend
//                     (defaults to Resend's test sender, onboarding@resend.dev)

const FIELDS = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  case_type: "Type of case",
  office: "Preferred office",
  message: "What happened",
} as const;

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// The site's JS posts with Accept: application/json and gets JSON back. A plain
// HTML form post (JavaScript disabled) is redirected to a page instead.
function reply(req: Request, status: number, payload: { ok: boolean; error?: string }) {
  if ((req.headers.get("accept") || "").includes("application/json")) return Response.json(payload, { status });
  return new Response(null, { status: 303, headers: { Location: payload.ok ? "/thank-you" : "/contact?error=1" } });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const body = Object.fromEntries(new URLSearchParams(raw));

  // Honeypot: bots fill the hidden field. Pretend success so they move on.
  if (body["bot-field"]) return reply(req, 200, { ok: true });

  const data = {} as Record<keyof typeof FIELDS, string>;
  for (const key of Object.keys(FIELDS) as (keyof typeof FIELDS)[]) {
    data[key] = String(body[key] || "").trim().slice(0, 5000);
  }
  if (!data.name || !data.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.case_type) {
    return reply(req, 400, { ok: false, error: "Missing or invalid fields" });
  }

  const { RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !LEAD_TO_EMAIL) {
    console.error("contact: RESEND_API_KEY or LEAD_TO_EMAIL is not set");
    return reply(req, 500, { ok: false, error: "Form is not configured" });
  }

  const source = String(body["form-name"] || "website");
  const filled = (Object.entries(FIELDS) as [keyof typeof FIELDS, string][]).filter(([key]) => data[key]);
  const rows = filled
    .map(([key, label]) => `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${label}</th><td style="padding:4px 0;white-space:pre-wrap">${esc(data[key])}</td></tr>`)
    .join("");
  const text = filled.map(([key, label]) => `${label}: ${data[key]}`).join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: LEAD_FROM_EMAIL || "California Law Website <onboarding@resend.dev>",
        to: LEAD_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: data.email,
        subject: `New case review: ${data.case_type} - ${data.name}`,
        html: `<h2>New case review request</h2><p>Form: ${esc(source)}</p><table>${rows}</table>`,
        text: `New case review request (form: ${source})\n\n${text}`,
      }),
    });
    if (!r.ok) {
      console.error("contact: Resend error", r.status, await r.text());
      return reply(req, 502, { ok: false, error: "Could not send" });
    }
    return reply(req, 200, { ok: true });
  } catch (err) {
    console.error("contact: send failed", err);
    return reply(req, 502, { ok: false, error: "Could not send" });
  }
}
