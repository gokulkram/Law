# California Law — Website

A modern, professional static website for a personal injury law firm, with a focus on **wrongful death** cases. Built from scratch with plain HTML, CSS, and JavaScript — no build step, no dependencies. Hosted on Vercel; the one server-side piece is the contact-form function in `api/`.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero with people-photo background, **contact form at top**, practice areas, wrongful-death feature, process, testimonials, locations, CTA |
| `wrongful-death.html` | Dedicated, in-depth wrongful death page (the firm's emphasis) |
| `practice-areas.html` | All personal injury practice areas |
| `about.html` | Firm story and values |
| `contact.html` | Full contact form + all six office locations |
| `api/contact.js` | Vercel serverless function that emails form submissions to the firm |

## Design system
- **Colors (Navy + Gold):** Navy `#0F2A4A` / deep navy `#0B1F38`, Gold `#C9A24B` / light gold `#E0C988`, paper `#F7F5F1`, ink `#1B2733`. All defined as CSS variables at the top of `css/styles.css` — change them in one place to re-skin the site.
- **Type:** *Fraunces* (serif display headings) + *Inter* (body), loaded from Google Fonts.
- **Logo:** Custom SVG. `assets/logo.svg` (dark, for light backgrounds), `assets/logo-light.svg` (light, for navy footer/nav), `assets/favicon.svg`.

## Before going live — replace the placeholders
1. **Firm details:** phone `(800) 555-0100` (+ branch numbers `…0120`, `…0140`), email `intake@californialaw.com`, and the six California office locations (Los Angeles, Orange County, San Diego, Bay Area, Sacramento, Inland Empire — shown as city only in `index.html` and `contact.html`). Add each office's real street address; California Rule of Professional Conduct 7.2(c) requires at least one lawyer or firm office address in advertising. Search & replace across all `.html` files.
2. **Photos:** Background/feature images use Unsplash CDN URLs (people-focused, as requested). Replace with the firm's own licensed photography for production. Hero image is set in `css/styles.css` (`.hero__bg`); feature/about images are `<img>` tags in the HTML. Drop real files into `images/` and update the paths.
3. **Stats & testimonials:** Figures ($500M+, 98%, etc.) and client quotes are illustrative placeholders. Replace with real, verifiable numbers and approved client reviews. *(Check California Rules of Professional Conduct 7.1–7.5 on testimonials, result claims, and firm names.)*
4. **Contact form:** Emails leads through a Vercel function and [Resend](https://resend.com). It won't send anything until you set the environment variables below.
5. **California legal content:** `wrongful-death.html` and `practice-areas.html` cite California deadlines and rules (CCP §377.60, §335.1, §340.5; Gov. Code §911.2; MICRA; comparative fault; workers' comp exclusivity). Have a California attorney confirm them before launch and whenever the law changes.
6. **Legal disclaimer & social links:** Review the footer disclaimer with the firm; update the `#` social links and Privacy/Disclaimer page links.

## Run locally
Just open `index.html` in a browser. Or serve the folder:
```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy
Deployed on **Vercel** from the `master` branch of GitHub — every push goes live automatically. The pages are static; `api/contact.js` runs as a Vercel serverless function (Node 18+, no dependencies). `netlify.toml` is left over from an earlier Netlify setup and is ignored by Vercel.

## Contact forms — Vercel function + Resend
Both forms (home page + contact page) post to `/api/contact`, the serverless function in `api/contact.js`. It validates the fields and emails each lead to the firm through [Resend](https://resend.com), with the visitor's email as the reply-to address.

**Setup (one time):**
1. Create a Resend account and an API key. To send from the firm's own domain, verify the domain in Resend; until then, Resend's test sender (`onboarding@resend.dev`) can only deliver to the email address the Resend account was created with.
2. In Vercel go to **Project → Settings → Environment Variables** and add:
   - `RESEND_API_KEY` — the Resend API key
   - `LEAD_TO_EMAIL` — the inbox that should receive leads (comma-separate several)
   - `LEAD_FROM_EMAIL` *(optional)* — sender on the verified domain, e.g. `California Law Website <leads@yourdomain.com>`
3. Redeploy (Deployments → ⋯ → Redeploy) so the function picks up the variables, then send a test submission.

How it works:
- `js/main.js` submits via AJAX (URL-encoded `POST` to `/api/contact` with `Accept: application/json`), so the visitor sees the inline "Thank you" message with **no page reload**. If sending fails, the red error message with the phone number appears instead.
- If JavaScript is off, the form posts natively and the function redirects to `thank-you.html`.
- A hidden `bot-field` honeypot filters simple spam bots. Hidden `form-name` values (`lead-contact`, `contact-page`) show in each email which form was used.
- Failures are logged in Vercel under **Logs** (search for `contact:`).

> Note: when testing locally with `python -m http.server`, the form validates but `/api/contact` doesn't exist. Use `vercel dev` to run the function locally.

## Features
- Responsive (mobile menu, fluid type, stacking grids)
- Sticky header, scroll-reveal animations, auto-rotating testimonial slider
- Accessible markup, keyboard-friendly nav, `prefers-reduced-motion` support
- Client-side form validation
