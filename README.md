# West Stone Law — Website

A modern, professional static website for a personal injury law firm, with a focus on **wrongful death** cases. Built from scratch with plain HTML, CSS, and JavaScript — no build step, no dependencies.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero with people-photo background, **contact form at top**, practice areas, wrongful-death feature, process, testimonials, locations, CTA |
| `wrongful-death.html` | Dedicated, in-depth wrongful death page (the firm's emphasis) |
| `practice-areas.html` | All personal injury practice areas |
| `about.html` | Firm story and values |
| `contact.html` | Full contact form + all three office locations |

## Design system
- **Colors (Navy + Gold):** Navy `#0F2A4A` / deep navy `#0B1F38`, Gold `#C9A24B` / light gold `#E0C988`, paper `#F7F5F1`, ink `#1B2733`. All defined as CSS variables at the top of `css/styles.css` — change them in one place to re-skin the site.
- **Type:** *Fraunces* (serif display headings) + *Inter* (body), loaded from Google Fonts.
- **Logo:** Custom SVG. `assets/logo.svg` (dark, for light backgrounds), `assets/logo-light.svg` (light, for navy footer/nav), `assets/favicon.svg`.

## Before going live — replace the placeholders
1. **Firm details:** phone `(800) 555-0100` (+ branch numbers `…0120`, `…0140`), email `intake@weststonelaw.com`, and the three office addresses. These appear in the top bar, nav, footer, and `contact.html`. Search & replace across all `.html` files.
2. **Photos:** Background/feature images use Unsplash CDN URLs (people-focused, as requested). Replace with the firm's own licensed photography for production. Hero image is set in `css/styles.css` (`.hero__bg`); feature/about images are `<img>` tags in the HTML. Drop real files into `images/` and update the paths.
3. **Stats & testimonials:** Figures ($500M+, 98%, etc.) and client quotes are illustrative placeholders. Replace with real, verifiable numbers and approved client reviews. *(Check your state bar rules on testimonials and result claims.)*
4. **Contact form:** Wired to **Netlify Forms** (see section below). It works automatically once the site is deployed to Netlify — no extra code needed.
5. **Legal disclaimer & social links:** Review the footer disclaimer with the firm; update the `#` social links and Privacy/Disclaimer page links.

## Run locally
Just open `index.html` in a browser. Or serve the folder:
```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy
It's a static site — host it anywhere: Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any traditional web host (upload the folder via FTP). No server runtime required. `netlify.toml` is included for Netlify (publish directory = project root).

## Contact forms — Netlify Forms
Both forms (home page + contact page) are wired to [Netlify Forms](https://docs.netlify.com/forms/setup/). When the site is deployed **to Netlify**, submissions are captured automatically and appear in the Netlify dashboard under **Forms** — no backend or API keys required.

How it's set up (already done in the markup):
- Each `<form>` has `name`, `method="POST"`, and `data-netlify="true"`, plus a hidden `<input name="form-name">` so Netlify can identify it. Form names: `lead-contact` (home) and `contact-page` (contact page).
- A hidden `bot-field` honeypot (`netlify-honeypot="bot-field"`) reduces spam.
- `js/main.js` submits via AJAX (URL-encoded `POST` to `/`), so the visitor sees the inline "Thank you" message with **no page reload**. If JavaScript is off, the form submits natively and Netlify redirects to `thank-you.html`.

**After your first deploy:**
1. In the Netlify dashboard go to **Forms** to view submissions.
2. Set up **Forms → Form notifications** to email new leads to the firm (e.g. `intake@weststonelaw.com`), or connect Slack/a webhook.
3. Optionally enable reCAPTCHA in the form settings for extra spam protection.

> Note: form submissions only work on the deployed Netlify site. When testing locally (`python -m http.server`), the form will validate but the `POST` to `/` won't be captured — that's expected.

## Features
- Responsive (mobile menu, fluid type, stacking grids)
- Sticky header, scroll-reveal animations, auto-rotating testimonial slider
- Accessible markup, keyboard-friendly nav, `prefers-reduced-motion` support
- Client-side form validation
