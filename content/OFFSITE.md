# Off-site credibility checklist

Search engines and AI assistants judge a law firm partly by what *other* sites say about it. None of
this can be done in the code — it needs the firm's real details and accounts. Work through it once the
firm name, attorneys, and office addresses are final.

## 1. Consistent name, address, phone (NAP) — do first
Use exactly the same firm name, street address, and phone for each office everywhere below, matching
`OFFICES` in `lib/site.ts`. Inconsistencies (suite numbers, abbreviations, old phone numbers) weaken
local rankings.

## 2. Map and business listings (per office)
- [ ] Google Business Profile — one per real office; category "Personal injury attorney"; link to that office's page (e.g. `/los-angeles`), not the home page; add photos of the real office and team.
- [ ] Bing Places for Business (can import from Google).
- [ ] Apple Business Connect (Apple Maps / Siri).
- [ ] Yelp, BBB (optional), and the local chamber of commerce where the office is.

## 3. Legal directories (firm and each attorney)
- [ ] State Bar of California attorney profiles — confirm each attorney's public record shows the current firm name and address (attorneys update this in My State Bar Profile).
- [ ] Avvo, Justia Lawyer Directory, FindLaw, Martindale-Hubbell, Lawyers.com — free basic profiles; link to the attorney's bio page on this site once `content/attorneys.ts` is filled in.
- [ ] Peer-review and selection-based listings (e.g., Martindale-Hubbell ratings, Super Lawyers) can't be bought or self-claimed — note them only if actually awarded, and follow Rule 7.1 when displaying them.

## 4. Professional associations (genuine memberships only)
- [ ] Consumer Attorneys of California and the local consumer attorney groups (e.g., CAALA in Los Angeles, CAOC chapters elsewhere).
- [ ] County bar associations where offices are: Los Angeles, Orange County, San Diego, San Francisco/Alameda/San Mateo, Sacramento, Riverside, San Bernardino.
- Add real memberships to each attorney's `memberships` in `content/attorneys.ts`.

## 5. Reviews
- [ ] Ask satisfied former clients for Google reviews (one link per office profile). Never offer anything in exchange, and never write or edit reviews for clients.
- [ ] Respond to reviews without revealing confidential client information.
- [ ] Testimonials shown on this site (`content/credibility.ts`) must be real, approved by the client, and comply with Rules 7.1–7.2.

## 6. Earned links and mentions
- [ ] Local news and community: safety events, scholarships, sponsorships of local organizations (real ones only).
- [ ] Attorney commentary for local media on safety and legal questions — links to the relevant guide in `/resources`.
- [ ] Speaking or writing for bar associations and continuing-education programs.

## 7. Search engine accounts (from the Phase 0 README)
- [ ] Google Search Console and Bing Webmaster Tools — verify the domain and submit `/sitemap.xml`.
