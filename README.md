# California Law — Website

A modern, professional website for a personal injury law firm, with a focus on **wrongful death** cases. Built with **Next.js** (App Router, TypeScript) and plain CSS. Pages are statically prerendered; the one server-side piece is the contact-form route in `app/api/contact/`. Hosted on Vercel.

The original plain-HTML version of the site is kept in `legacy-static/` for reference. It is not part of the build and can be deleted once the Next.js version is live.

## Structure
| Path | Purpose |
|------|---------|
| `app/page.tsx` | Home — hero with people-photo background, **contact form at top**, practice areas, wrongful-death feature, process, testimonials, locations, CTA |
| `app/wrongful-death/page.tsx` | Wrongful death overview (the firm's emphasis) — links to its sub-pages |
| `app/practice-areas/page.tsx` | Practice-areas hub — every service page, grouped |
| `app/[service]/page.tsx`, `app/wrongful-death/[slug]/page.tsx` | Practice-area (service) pages, rendered from `content/services/` by `components/ServicePage.tsx` |
| `app/about/page.tsx` | Firm story and values |
| `app/contact/page.tsx` | Full contact form + all six office locations |
| `app/privacy`, `app/disclaimer`, `app/site-map` | Privacy Policy, Legal Disclaimer, HTML site map |
| `app/thank-you/page.tsx` | Shown after a no-JavaScript form post (`noindex`) |
| `app/not-found.tsx` | Branded 404 page |
| `app/api/contact/route.ts` | Route handler that emails form submissions to the firm |
| `app/layout.tsx` | Shared shell: top bar, header, footer, accessibility menu, font loading |
| `app/sitemap.ts`, `app/robots.ts` | `/sitemap.xml` and `/robots.txt` |
| `app/opengraph-image.tsx` | Social-share preview image (1200×630), used by every page |
| `app/globals.css` | The whole stylesheet |
| `components/` | Header, Footer, ContactForm, Testimonials, shared sections (PageHero, CtaBand, Locations), Reveal (scroll animation), A11yMenu |
| `lib/site.ts` | **Firm details in one place** — phone, email, social links, nav, offices, services, the page list (`PAGES`), page-metadata helper |
| `lib/schema.ts`, `components/JsonLd.tsx` | Structured data (schema.org JSON-LD) built from `lib/site.ts` |
| `public/` | Static files served as-is — `assets/` (logo, favicon), `images/` (WebP) |

Old `.html` URLs (`/about.html` etc.) permanently redirect to the clean URLs (`/about`) — see `next.config.ts`.

## Practice-area (service) pages
24 pages — e.g. `/car-accident-lawyer`, `/wrongful-death/who-can-file` — each a content file in `content/services/`, all rendered by one template (`components/ServicePage.tsx`): hero with breadcrumb, answer-first intro, optional "what to do" steps, sections, FAQ, related pages, a sidebar case-review form, and `Service` + `FAQPage` + `BreadcrumbList` structured data.

| File | Purpose |
|------|---------|
| `content/types.ts` | The content model (`ServiceContent`). Inline text supports `**bold**` and `[link](/path)`. |
| `content/services/*.ts` | One file per page. File name = slug without the leading `/`, with `/` → `--`. |
| `content/services/index.ts` | **Registry** — routes, the hub, sitemap, site map and structured data all read it. |
| `content/FACTS.md` | Verified California law fact sheet with sources. Legal facts on service pages come only from here. |
| `content/TOPICS.md` | Which page owns which topic, search focus, and linking rules — prevents pages competing for the same searches. |
| `scripts/check-content.mjs` | `npm run check:content` — checks title/description length, duplicates, broken links, related pages, word count, banned advertising words, and that every `§` citation is on the fact sheet. |

**To add a service page:** add the slug to `SERVICES` in `scripts/check-content.mjs` and a row to `content/TOPICS.md`; create `content/services/<slug>.ts`; register it in `content/services/index.ts`; run `npm run check:content`, then `npm run build`.

**Before launch, an attorney must review every service page.** The fact sheet was checked against the statute text on 2026-10-02; dates and dollar amounts in it change (MICRA caps rise every January 1). Re-check `content/FACTS.md` at least yearly and update the `updated` date on pages you change.

## Location pages
- **Office pages** — `/los-angeles`, `/orange-county`, `/san-diego`, `/bay-area`, `/sacramento`, `/inland-empire` — one file each in `content/locations/` (type `LocationContent`), rendered by `components/LocationPage.tsx`: office card (address, phone, and a map once a street address is set in `OFFICES`), local courts, communities served, local and statewide practice-area links, FAQ, and the office's `LegalService` structured data.
- **City + service pages** — car accident, truck accident and wrongful death for Los Angeles, Orange County and San Diego (e.g. `/los-angeles/car-accident-lawyer`) — files in `content/local/`, rendered by the service template with an office breadcrumb, the office's phone number, and office-level structured data.
- `content/LOCAL.md` is the brief: pages must be genuinely local (courts, claim offices, report procedures, roads, agencies), never a statewide page with the city name swapped — Google demotes those as doorway pages.
- Every local fact is recorded with its official source in `content/local-facts/<office>.md`. Re-check them yearly — courthouses, claim forms and procedures move.
- Registries: `content/locations/index.ts`, `content/local/index.ts`. To add a city + service page: add its slug to `LOCAL` in `scripts/check-content.mjs`, write the file, register it, run `npm run check:content`.
- **When real office addresses exist:** fill `street`/`postalCode` in `lib/site.ts` — the office card, map, structured data and footer cards all update. Each office should have a matching Google Business Profile that links to its office page.

## Credibility and guides
- **Guides** — `/resources` hub and 8 guides (`content/articles/`, type `ArticleContent`, rendered by `components/ArticlePage.tsx` with `Article` + `FAQPage` structured data). Each guide answers one specific question, lists the practice areas it supports (`services`), and those practice-area pages (and their city versions) link back under "Helpful guides". Add a guide: add its slug to `ARTICLES` in `scripts/check-content.mjs`, write the file, register it in `content/articles/index.ts`.
- **Attorneys** — `content/attorneys.ts` is **empty on purpose**: add only real attorneys with real State Bar numbers. Once it has entries, `/attorneys` (team page) and `/attorneys/<slug>` (bio with `Person` structured data and a link to the official State Bar profile) go live, the About page links to them, and the sitemap/site map include them. To show "Legal review by <attorney>, State Bar #…" on any content page, set `reviewedBy` and `reviewed` in its content file — only after the attorney has actually reviewed it. This is the single biggest credibility signal for legal content.
- **Stats and testimonials** — `content/credibility.ts` holds the home trust bar, the wrongful death sidebar figures and the homepage testimonials. **All are still placeholders** (`verified: false`); the production build prints a warning until each is replaced with a verified figure or approved review, or deleted.
- **Off-site work** — `content/OFFSITE.md`: business listings, legal directories, associations, reviews and earned links.
- **Attorney review** — `content/REVIEW.md` lists what to check first on every content page.

## SEO foundation
- **Per-page metadata** via `pageMeta()` in `lib/site.ts`: title (keep under ~60 characters including the ` | California Law` suffix), description (under ~155), canonical URL, Open Graph and X/Twitter tags with the share image.
- **Structured data** (`lib/schema.ts`): every page carries a `LegalService` graph for the firm — phone, email, area served, practice areas, social profiles — with each office as a department with its own address and phone, plus a `WebSite` node. Inner pages add a `BreadcrumbList` matching the visible breadcrumb.
- **Sitemap and site map:** `/sitemap.xml` and the `/site-map` page are both generated from `PAGES` in `lib/site.ts`. **When adding a page, add it to `PAGES`** (and to `SERVICES` if it's a new practice area).
- **Images:** WebP, served from `public/images`. Office and about photos go through `next/image` (resized per device, lazy-loaded below the fold). The home hero background is preloaded.
- **SEO audit:** `scripts/seo-audit.mjs` crawls a running build and checks every sitemap page - title and description length and uniqueness, one H1, heading order, canonical, Open Graph tags, structured data, image alt text, internal links, orphan pages, and that `/thank-you` and 404s stay out of the index. Run it against a build that has the site URL set: `NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build`, `npx next start -p 3100`, then `npm run audit:seo -- http://localhost:3100 https://www.example.com`.
- **Keep content out of browser scripts:** client components (`"use client"`) import firm details from `lib/firm.ts`, never `lib/site.ts`, which loads every content page.
- Check structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results) once the site is live.

### After launch
1. Verify the domain in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters), and submit `https://<domain>/sitemap.xml` in both.
2. Create or claim a Google Business Profile for each real office. The name, address, and phone must match `OFFICES` in `lib/site.ts` exactly.

## Design system
- **Colors (Navy + Gold):** Navy `#0F2A4A` / deep navy `#0B1F38`, Gold `#C9A24B` / light gold `#E0C988`, paper `#F7F5F1`, ink `#1B2733`. All defined as CSS variables at the top of `app/globals.css` — change them in one place to re-skin the site.
- **Type:** *Inter*, self-hosted through `next/font` (no request to Google Fonts at runtime).
- **Logo:** Custom SVG. `public/assets/logo.svg` (dark, for light backgrounds), `public/assets/logo-light.svg` (light, for navy footer/nav), `public/assets/favicon.svg`.

## Before going live — replace the placeholders
1. **Site URL:** set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.yourfirm.com`) in Vercel, then redeploy — the value is baked in at build time. Canonical tags, Open Graph URLs and the sitemap entries are only output when it is set, so a placeholder domain never reaches search engines.
2. **Firm details:** phone `(800) 555-0100` (+ branch numbers), email `intake@californialaw.com`, and the six California office locations (shown as city only). Edit them in `lib/site.ts` — fill each office's `street` and `postalCode` (they appear on the site and in the structured data). California Rule of Professional Conduct 7.2(c) requires at least one lawyer or firm office address in advertising; also add the responsible lawyer's name and address to `app/disclaimer/page.tsx`.
3. **Photos:** The images in `public/images/` are stock placeholders (Unsplash; the office photos are not of the actual cities). Replace them with the firm's own licensed photography — real office or attorney photos help with trust and local search. Hero and CTA backgrounds are set in `app/globals.css` (`.hero__bg`, `.ctaband`); office images in `lib/site.ts`; the about image in `app/about/page.tsx`. Save new images as WebP.
4. **Stats & testimonials:** Figures ($500M+, 98%, etc.) and client quotes are illustrative placeholders. Replace with real, verifiable numbers and approved client reviews. *(Check California Rules of Professional Conduct 7.1–7.5 on testimonials, result claims, and firm names.)*
5. **Contact form:** Emails leads through [Resend](https://resend.com). It won't send anything until you set the environment variables below.
6. **California legal content:** the wrongful death and practice areas pages cite California deadlines and rules (CCP §377.60, §335.1, §340.5; Gov. Code §911.2; MICRA; comparative fault; workers' comp exclusivity). Have a California attorney confirm them before launch and whenever the law changes.
7. **Legal pages & social links:** Have the firm's counsel review `app/privacy/page.tsx`, `app/disclaimer/page.tsx`, and the footer disclaimer. The privacy policy describes the site as it is today (no analytics or ad cookies) — update it when adding analytics, chat, call tracking or ad pixels. Add social profile URLs to `SOCIAL` in `lib/site.ts`; icons appear in the footer only once a URL is set.

## Run locally
Requires Node 20.9+ (also set Node.js 20+ in Vercel → Project → Settings).
```bash
npm install
npm run dev          # http://localhost:3000, with hot reload (if port 3000 is taken: `npx next dev -p 3100`)
# or a production build:
npm run build && npm start
```
Put local environment variables in `.env.local` (not committed).

## Deploy
Deployed on **Vercel** from the `master` branch of GitHub — every push goes live automatically. `vercel.json` pins the framework to Next.js. When switching the existing Vercel project over from the old static site, check **Project → Settings → Build & Deployment**: Framework Preset should be *Next.js*, and any custom Output Directory / Build Command overrides should be cleared.

## Contact forms — route handler + Resend
Both forms (home page + contact page) post to `/api/contact` (`app/api/contact/route.ts`). It validates the fields and emails each lead to the firm through [Resend](https://resend.com), with the visitor's email as the reply-to address.

**Setup (one time):**
1. Create a Resend account and an API key. To send from the firm's own domain, verify the domain in Resend; until then, Resend's test sender (`onboarding@resend.dev`) can only deliver to the email address the Resend account was created with.
2. In Vercel go to **Project → Settings → Environment Variables** and add:
   - `RESEND_API_KEY` — the Resend API key
   - `LEAD_TO_EMAIL` — the inbox that should receive leads (comma-separate several)
   - `LEAD_FROM_EMAIL` *(optional)* — sender on the verified domain, e.g. `California Law Website <leads@yourdomain.com>`
3. Redeploy (Deployments → ⋯ → Redeploy) so the route picks up the variables, then send a test submission.

How it works:
- `components/ContactForm.tsx` validates and submits with `fetch` (URL-encoded `POST` to `/api/contact` with `Accept: application/json`), so the visitor sees the inline "Thank you" message with **no page reload**. If sending fails, the red error message with the phone number appears instead.
- If JavaScript is off, the form posts natively and the route redirects to `/thank-you`.
- A hidden `bot-field` honeypot filters simple spam bots. Hidden `form-name` values (`lead-contact`, `contact-page`) show in each email which form was used.
- Failures are logged in Vercel under **Logs** (search for `contact:`).

## Features
- Responsive (mobile menu, fluid type, stacking grids)
- Sticky header, scroll-reveal animations, auto-rotating testimonial slider
- Accessibility menu (text size, contrast, readable font, pause motion, big cursor) that remembers settings
- Accessible markup, keyboard-friendly nav, `prefers-reduced-motion` support
- Client-side form validation, with a working no-JavaScript fallback
- Per-page titles and descriptions, Open Graph tags, canonical URLs, `sitemap.xml`, `robots.txt`
