# California Law — Website

A modern, professional website for a personal injury law firm, with a focus on **wrongful death** cases. Built with **Next.js** (App Router, TypeScript) and plain CSS. Pages are statically prerendered; the one server-side piece is the contact-form route in `app/api/contact/`. Hosted on Vercel.

The original plain-HTML version of the site is kept in `legacy-static/` for reference. It is not part of the build and can be deleted once the Next.js version is live.

## Structure
| Path | Purpose |
|------|---------|
| `app/(site)/page.tsx` | Home — hero with people-photo background, **contact form at top**, practice areas, wrongful-death feature, process, testimonials, locations, CTA |
| `app/(site)/wrongful-death/page.tsx` | Wrongful death overview (the firm's emphasis) — links to its sub-pages |
| `app/(site)/practice-areas/page.tsx` | Practice-areas hub — every service page, grouped |
| `app/(site)/[service]/page.tsx`, `app/(site)/wrongful-death/[slug]/page.tsx` | Practice-area (service) pages, rendered from `content/services/` by `components/ServicePage.tsx` |
| `app/(site)/about/page.tsx` | Firm story and values |
| `app/(site)/contact/page.tsx` | Full contact form + all six office locations |
| `app/(site)/privacy`, `app/(site)/disclaimer`, `app/(site)/site-map` | Privacy Policy, Legal Disclaimer, HTML site map |
| `app/(site)/thank-you/page.tsx` | Shown after a no-JavaScript form post (`noindex`) |
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

## Admin panel (`/admin`) - in progress

**The website's pages now come from the Supabase database**, not from the files in `content/`, and are edited in the admin panel. All six phases are built: admin foundation, content in the database, page editor, SEO and redirects, main pages' text, and site settings + media library.

> **`content/*.ts` files are seed data only.** They were imported once with `npm run content:import`; editing them no longer changes the site, and `npm run check:content` checks those files, not the live database content. Don't use the "add a page" steps in the sections above - pages will be created in the admin panel.

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | Database schema: `profiles` (staff roles), `pages` (content + SEO, draft and published copies, attorney-review status), `page_revisions`, `site_settings`, `redirects`, `media`, the `media` storage bucket, and row-level security |
| `app/admin/` | Admin panel - login, dashboard, users (admins only), my account. Outside the `app/(site)` route group, so it has no site header/footer |
| `proxy.ts` | Runs for `/admin` only: refreshes the session and sends signed-out visitors to `/admin/login` |
| `lib/admin/auth.ts` | `requireStaff()` / `staffFor()` - every admin page and Server Action re-checks the role here |
| `lib/supabase/` | Supabase clients: `server.ts` (signed-in user, RLS applies), `admin.ts` (secret key, server only) |
| `lib/content-store.ts` | **Where the site gets its content.** Loads every published page in one cached query (tag `content`) and offers lookups (`service()`, `card()`, `sitePages`, ...). Throws if Supabase errors or returns no pages, so a broken database fails the build and Vercel keeps the previous deployment |
| `app/admin/(panel)/pages/` | Page list, **page editor** (`[id]`), new page, and their Server Actions (save draft, publish, discard, unpublish, delete, restore a version, review sign-off) |
| `components/admin/editor/` | Editor UI - form for each page type, live checks, SEO preview, history |
| `lib/admin/page-model.ts`, `lib/admin/validate.ts` | Page types, URL rules, structure check, pages the code depends on; the `check:content` rules as a pure function (run live in the editor and again on publish) |
| `app/admin/preview/[id]` | Draft preview with the real page template |
| `app/admin/(panel)/seo/` | Site-wide SEO (admins): Search Console / Bing verification, GA4 or Tag Manager, extra robots.txt rules, "block search engines" for staging; plus a page-health table for every page |
| `app/admin/(panel)/redirects/` | Redirect manager (admins + editors). Redirects are resolved by the content routes just before a 404 (`redirectOrNotFound` in `lib/site.ts`), so a live page always wins and changes apply immediately. Responses are 308 (permanent) / 307 (temporary) |
| `components/static-pages/` | The main pages (home, about, contact, privacy, disclaimer, wrongful death overview, hubs) as views that take their text as props - used by the routes in `app/(site)/` and by the draft preview |
| `lib/admin/static-model.ts` | Which text fields each main page has (what the editor shows) and their structure check. To make more text editable: add the field here, to the type and seed in `content/static-text.ts`, and use it in the view |
| `app/admin/(panel)/settings/` | **Site settings** (admins): firm phone/email/description, social links, contact-form case types, footer text, the six offices' details and photos, and the home/wrongful-death figures and testimonials (with a "verified" flag - placeholders show a warning on the dashboard and in the build log) |
| `app/admin/(panel)/media/` | **Media library** (admins + editors): uploads go from the browser straight to Supabase Storage via a one-time signed URL; JPEG/PNG/WebP/AVIF/GIF up to 10 MB (no SVG). Images in use can't be deleted. Image fields (attorney photo, share image, office photo) pick from here |
| `lib/admin/settings-model.ts` | Site-wide SEO settings and redirect rules (validation shared by the admin and the site) |
| `scripts/import-content.mjs` | `npm run content:import` - copies the `content/` files into the database (skips pages already there; `--force <path>` overwrites one; `--dry-run`). Every row is read back and compared with its file |

**Roles:** Admin (everything, incl. users and settings), Editor (pages, SEO, media, redirects), Attorney reviewer (reads everything, signs off reviews - only as the attorney their account is linked to under Users).

**Editing workflow:** edits are saved as a *draft*; the site keeps showing the published version until someone presses **Publish** (which also moves "Last updated" to today if the text changed). Errors in the Checks panel block publishing; warnings don't. A save can't overwrite someone else's newer save - the editor says so instead. Pages linked from the site's code (home page, footer, the wrongful-death hub) can't be unpublished or deleted.

**Per-page SEO** (editor → Search engines → Advanced): noindex / nofollow, canonical URL, sitemap exclusion and priority, social-sharing title/description/image, FAQ structured data on/off, and custom JSON-LD (parsed and escaped, never output raw). Noindex pages are left out of `sitemap.xml` automatically.

**Attorney review:** a sign-off records a fingerprint of the exact text reviewed (computed by the database). The page's "Legal review by …" byline and its structured data appear only while the *live* text matches it; edit the text and the page shows "Needs review" until it is signed off again. There is no public sign-up: admins create accounts under Users and send the temporary password.

**Setup:** copy `.env.example` to `.env.local` and fill in the Supabase keys (also add them in Vercel); apply the migration (Supabase SQL Editor, or `supabase db push`); in Supabase → Authentication → Sign In / Providers, turn off "Allow new users to sign up"; then create the first admin with `npm run admin:create -- you@example.com "Your Name"`.

**Firm details** are read with `getContent().firm` / `.credibility` (seeded from `content/firm.ts` with `npm run content:import -- --settings`). `Header`, `ContactForm` and `Testimonials` are small server wrappers that pass these to their interactive `*Client` components. The site name, default meta description and the menu/footer link lists stay in `lib/firm.ts` (code). Office ids are part of URLs, so adding or removing an office is a code change.

All public pages live in `app/(site)/` (a route group - URLs are unchanged) and must stay static: never call `cookies()` or the Supabase server client from the root or `(site)` layouts.

**Updating the live site:** pages are prerendered and cached. Saving in the admin panel refreshes them; after changing the database any other way (a re-import, the Supabase dashboard), press **Refresh site content** on the admin dashboard. A new deployment always starts from the database (the cache is versioned per build in `next.config.ts`).

**Vercel:** builds read the database, so `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` must be set for Production *and* Preview, or the build fails.

## Before going live — replace the placeholders
1. **Site URL:** set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.yourfirm.com`) in Vercel, then redeploy — the value is baked in at build time. Canonical tags, Open Graph URLs and the sitemap entries are only output when it is set, so a placeholder domain never reaches search engines.
2. **Firm details:** phone `(800) 555-0100` (+ branch numbers), email `intake@californialaw.com`, and the six California office locations (shown as city only). Edit them in `lib/site.ts` — fill each office's `street` and `postalCode` (they appear on the site and in the structured data). California Rule of Professional Conduct 7.2(c) requires at least one lawyer or firm office address in advertising; also add the responsible lawyer's name and address to `app/(site)/disclaimer/page.tsx`.
3. **Photos:** The images in `public/images/` are stock placeholders (Unsplash; the office photos are not of the actual cities). Replace them with the firm's own licensed photography — real office or attorney photos help with trust and local search. Hero and CTA backgrounds are set in `app/globals.css` (`.hero__bg`, `.ctaband`); office images in `lib/site.ts`; the about image in `app/(site)/about/page.tsx`. Save new images as WebP.
4. **Stats & testimonials:** Figures ($500M+, 98%, etc.) and client quotes are illustrative placeholders. Replace with real, verifiable numbers and approved client reviews. *(Check California Rules of Professional Conduct 7.1–7.5 on testimonials, result claims, and firm names.)*
5. **Contact form:** Emails leads through [Resend](https://resend.com). It won't send anything until you set the environment variables below.
6. **California legal content:** the wrongful death and practice areas pages cite California deadlines and rules (CCP §377.60, §335.1, §340.5; Gov. Code §911.2; MICRA; comparative fault; workers' comp exclusivity). Have a California attorney confirm them before launch and whenever the law changes.
7. **Legal pages & social links:** Have the firm's counsel review `app/(site)/privacy/page.tsx`, `app/(site)/disclaimer/page.tsx`, and the footer disclaimer. The privacy policy describes the site as it is today (no analytics or ad cookies) — update it when adding analytics, chat, call tracking or ad pixels. Add social profile URLs to `SOCIAL` in `lib/site.ts`; icons appear in the footer only once a URL is set.

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
