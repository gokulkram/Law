# Location pages — brief

Two page types. Both must be **genuinely local**: Google treats near-identical "city name swapped"
pages as doorway pages and demotes the whole site. If a paragraph would read the same with another
city's name in it, it doesn't belong — link to the statewide page instead.

## 1. Office pages — `content/locations/<office-id>.ts` (type `LocationContent`)
Slugs: /los-angeles, /orange-county, /san-diego, /bay-area, /sacramento, /inland-empire.
The office's street address, phone and map come from `OFFICES` in `lib/site.ts` (addresses are not
supplied yet) — never write an office street address, suite, parking or directions in content.
The page template automatically adds: office card (city + phone), links to practice areas, and links
to this city's local service pages. Your content provides:
- `title` e.g. "Los Angeles Personal Injury Lawyer" (≤ 43 chars), `description` 120–155, `h1`, `heroText`, `summary` (≤ 160), `intro`.
- `areasServed`: 10–25 real cities/communities in the region the office serves.
- `courts`: the county Superior Court location(s) that hear civil personal injury cases from this area — official name, street address, official court URL (https). Verified.
- `sections` (3–5), e.g.: personal injury in [region] — what's distinctive locally (major freeways and corridors, ports/logistics/agriculture/tourism, transit agencies — all verifiable, no statistics); where cases are filed and what that process looks like locally; claims against local public entities (which county/city/transit agencies, and where their claim forms are — official URLs); home and hospital visits across the region.
- `faqs` 4–6, local.

## 2. City + service pages — `content/local/<office-id>--<service>.ts` (type `ServiceContent`)
Slugs: /los-angeles/…, /orange-county/…, /san-diego/… × car-accident-lawyer, truck-accident-lawyer, wrongful-death-lawyer.
Same type as the statewide service pages, plus `location: "<office-id>"`. `group` = the statewide page's group.
- `title` like "Los Angeles Car Accident Lawyer" (≤ 43 chars incl. no suffix), unique `h1`/`description`.
- Keep California law to a short summary (a paragraph or two) and **link to the statewide page** for depth: `/car-accident-lawyer`, `/truck-accident-lawyer`, `/wrongful-death` (and its sub-pages).
- The bulk is local and practical, for example:
  - Where crashes happen locally: named freeways/interchanges/corridors and why (port truck traffic, mountain passes, commuter corridors) — facts, not statistics.
  - How to get the collision report locally (city police department vs. CHP — which agency covers freeways/unincorporated areas, how to request a report — official URLs).
  - Claims against local public entities (the city, the county, the regional transit agency, Caltrans) — who to file with, official claim-form pages, the 6-month rule (§911.2).
  - Where the case would be filed (the county Superior Court) — verified.
  - Wrongful death pages: local steps families face — the county medical examiner/coroner (autopsy and reports), death certificates (county recorder/public health), probate court for appointing a personal representative — official URLs.
  - Truck pages: local freight context (ports, distribution centers, border crossings, major truck routes) — verifiable.
- `steps` optional (a local "what to do" list works well). `faqs` 5–7, local. `related`: the statewide page, the office page (e.g. "/los-angeles"), and 1–2 other pages.
- Roughly 900–1,400 words. Quality over length — no padding.

## Verifying local facts (required)
Every local fact (court names and addresses, agency names, claim-filing procedures, report request
procedures, coroner/medical examiner offices, freeway names and what they connect, ports/border
crossings) must be checked with WebFetch/WebSearch against an **official source** (courts.ca.gov or the
county court's site, county/city .gov sites, CHP, Caltrans, port authority sites). Record each in
`content/local-facts/<office-id>.md` as: fact — source URL — checked 2026-10-02. If you can't verify it,
leave it out. Don't link to sources that aren't official. External links in content: `[text](https://…)`.

## Same rules as the statewide pages
- California law facts only from `content/FACTS.md`; cite § only if it's there.
- No statistics, case results, client stories, attorney names, years of experience, awards.
- Never "specialist/specialize", "expert" (for the firm), "best", "leading", "top", "#1"; no guarantees.
- Firm facts: six offices; home and hospital visits anywhere in California; free consultation; available 24/7; contingency fee — no fee unless we win; main phone (800) 555-0100. Don't claim the firm has handled cases in a particular court or city.
- `updated: "2026-10-02"`. Run `npm run check:content -- <office-id>` and fix all errors; review warnings.
