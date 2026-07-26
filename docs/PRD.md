# Product Requirements Document (PRD)
## MetroMitra — Hyperlocal Community Platform for Indian Metro Commuters

> **Document status:** Approved baseline for v1.0 build
> **Author:** MetroMitra product team
> **Last revised:** Build cycle 1

---

## 1. Executive summary

MetroMitra is a hyperlocal community web application built around **Indian metro rail stations**. It turns a daily, solitary commute into a connected, safer, more productive experience by giving the millions of people who pass through the same stations every day a shared place to find rides, recover lost belongings, travel with trusted companions, trade within a verified commuter community, and talk about the station they share.

The product is positioned at the intersection of three proven categories — hyperlocal social networks, urban carpooling, and community marketplaces — none of which currently serve the Indian metro commuter as a first-class citizen. MetroMitra occupies that gap.

### The one-line promise

> *Find your people on the line you already ride.*

---

## 2. Problem context and market research

### 2.1 Scale of the opportunity

India operates one of the fastest-growing metro rail networks in the world. Aggregated daily ridership across operational systems is in the range of **8–10 million passenger journeys per day**, projected to cross 12 million as new corridors in Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kochi, Pune, Nagpur, Jaipur, Lucknow, Kanpur, and the NCR open through 2025–2027.

The largest systems and their approximate daily ridership:

| City / System | Operational corridors | Approx. daily ridership |
|---|---|---|
| Delhi Metro (DMRC) + NCR lines | ~390 km, ~286 stations | 5–6 million |
| Kolkata Metro (including East–West) | ~60 km | ~600 thousand |
| Bengaluru Metro (BMRCL / Namma Metro) | ~75 km, expanding | ~500 thousand |
| Hyderabad Metro (HMRL) | ~69 km | ~450 thousand |
| Mumbai Metro (MMRCL + lines) | expanding rapidly | ~400 thousand |
| Chennai Metro (CMRL) | ~55 km | ~250 thousand |
| Kochi Metro, Noida, Gurugram, Jaipur, Lucknow, Nagpur, Pune, Kanpur | various | ~300 thousand combined |

The commuter base is young, digitally native, UPI-fluent, and concentrated in dense station catchments. This is a high-frequency, high-retention audience by default.

### 2.2 Commuter pain points (observed, not invented)

These are recurring, well-documented friction points in Indian metro life. None of them are speculative:

1. **Last-mile cost and isolation.** Most riders exit a station still needing an auto, cab, or walk to a final destination. Solo fares are expensive; informal sharing is awkward and unsafe to arrange ad hoc.
2. **Safety on the first and last leg.** Early-morning and late-evening travel is a real concern, particularly for women. There is no structured way to find a trustworthy companion going the same way at the same time.
3. **Lost belongings.** Crowded coaches lead to dropped phones, wallets, ID cards, bags. The official lost-and-found counter is slow and station-bound; there is no networked recovery channel.
4. **Loneliness of mass transit.** Millions share the same train, the same platform, the same exit, every single day — and never speak. There is no platform that recognises this shared routine.
5. **Navigating unfamiliar stations and cities.** New residents, students, and travellers struggle with exits, interchanges, feeder services, and station-area amenities.
6. **No trustworthy intra-commuter commerce.** Buying and selling within a verified local commuter pool (textbooks, electronics, furniture for newly-relocated professionals) is currently routed through impersonal classifieds.
7. **No voice for station-level community issues.** Crowding, lift outages, water availability, security presence — discussed in scattered WhatsApp groups, if at all.

### 2.3 Competitive landscape and the gap

| Category | Existing players | Why they do not solve this |
|---|---|---|
| General social / messaging | WhatsApp groups, Facebook, Telegram | Not metro-aware; no station-level structure, no trust signals, no commute-specific tooling |
| Intercity carpooling | BlaBlaCar | Long-distance focus, not urban last-mile or metro feeder |
| Urban carpooling | sRide, QuickRide | Car-owner centric; do not serve metro-exit last-mile or non-car owners |
| Metro utility apps | DMRC Momentum, Mumbai Metro 1, Namma Metro | Journey planning and ticketing only; no social or community layer |
| Classifieds | OLX, Facebook Marketplace | City-wide, anonymous, no commuter trust context |
| Dating / meet-people apps | Tinder, Bumble BFF | Wrong context, real safety concerns in transit settings |

**The gap:** no product treats the *metro station* as the primary unit of community and combines last-mile ride-sharing, companion-finding, lost-and-found, local commerce, and station conversation in one trusted, transit-aware place.

### 2.4 Why MetroMitra will stand out

1. **Station-first, not city-first.** Community is anchored to a specific station code (e.g. `RJ-AI` for Rajiv Chowk, `CS-CB` for Cubbon Park). This makes every interaction immediately useful and locally trustworthy.
2. **Trust built for transit.** Profiles carry commute history, verified route streaks, and community ratings — purpose-built for "can I share a ride with this person?"
3. **Multi-need, single app.** A commuter does not want five apps for five micro-problems. MetroMitra consolidates them around a shared identity: *the line you ride*.
4. **India-native by default.** UPI payment intent, Indian metro line colour semantics, multilingual roadmap, awareness of interchange complexity, women-only matching options.
5. **Safety as a feature, not a footnote.** Live trip share, SOS shortcut, women-only carpool/buddy filters, and a visible "trusted commuter" tier.
6. **A brand motif that means something.** The visual language is derived from the metro map itself — nodes (stations) connected by coloured lines — used as a structural device, not decoration.

---

## 3. Goals and non-goals

### 3.1 Goals for v1.0

- Ship a deployed, usable web application that lets a real Indian metro commuter:
  - register and build a commuter profile;
  - browse a directory of major Indian metro stations across six cities;
  - join station-level community conversations;
  - post and respond to carpool/last-mile ride requests;
  - find a travel buddy for a planned trip, with women-only filtering;
  - report and reclaim lost items;
  - list and browse items in a station-area marketplace;
  - rate and be rated as a trusted commuter.
- Demonstrate the product end-to-end on a live URL via an automated CI/CD pipeline.
- Deliver professional documentation (PRD, TechRD, LaTeX architecture document) that reflects a real engineering process.

### 3.2 Explicit non-goals for v1.0

- We are **not** building native mobile apps in this cycle. The web app is responsive and installable (PWA-ready metadata) but the delivery target is a web deployment.
- We are **not** integrating live metro train APIs or ticketing. Real-time train data partnerships are out of scope for v1; the product is community-led.
- We are **not** processing real payments. Marketplace listings express *intent* to transact offline (cash/UPI directly between parties). No money flows through the platform in v1.
- We are **not** offering AI-moderated content moderation beyond a manual reporting flow. This is documented as a limitation.
- We are **not** claiming unverified metrics, testimonials, partner logos, or social proof anywhere in the product or documentation.

---

## 4. Target users and personas

### 4.1 Primary persona — "Daily Devika"

- 27, software professional in Bengaluru, takes the Purple Line from Baiyappanahalli to MG Road every weekday.
- Wants: a reliable last-mile auto share to Indiranagar, a known face on late shifts, a place to report a lost earbud.
- Frustration today: three WhatsApp groups, no replies, no trust signal on who is offering the ride.

### 4.2 Secondary persona — "Relocated Rohan"

- 23, just moved to Delhi for a first job, stays near Dwarka, office in Connaught Place.
- Wants: understand the Yellow Line, find people his age going the same route, buy a second-hand study table from someone in his station catchment, not feel alone in a new city.

### 4.3 Tertiary persona — "Occasional Anitha"

- 41, travels to Mumbai once a month for client work.
- Wants: a one-off travel buddy for an early-morning airport-to-Bandra leg via Andheri, and to know which exit at Andheri has prepaid autos.

### 4.4 Anti-persona

- Tourists looking for sightseeing itineraries. MetroMitra is for commuters and transit-aware residents, not a travel guide.

---

## 5. Functional requirements

Features are grouped by the commuter job they serve. Each feature lists acceptance criteria in plain language.

### F1. Authentication and commuter profile

- Email + password registration and login (NextAuth credentials provider).
- Profile fields: display name, home station, work/college station, usual travel window, bio, avatar (initials-based default), preferred language.
- "Verified commuter" badge appears after the user completes their profile and posts at least once.
- Account settings: change password, update profile, delete account.

### F2. Station directory

- A browsable directory of major metro stations across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata.
- Each station has a code, name, city, line(s), and a station page.
- Station pages aggregate: community feed for that station, active carpools originating there, recent lost & found entries, marketplace listings nearby.
- Search by station name or code; filter by city and line.

### F3. Community feed

- Post short text updates (with optional image URL) to a station's feed or the global feed.
- Posts support tags: `#help`, `#info`, `#alert`, `#meetup`, `#general`.
- Authenticated users can reply; the original poster can mark a reply as the answer.
- Sorting: latest, most replied.
- Reporting: any user can flag a post for review (stored for manual moderation).

### F4. Carpool / last-mile ride share

- A user can **offer** a ride (origin station, destination area, departure time, seats available, mode: auto / cab / personal vehicle, cost split preference, women-only flag).
- A user can **request** a ride with the same fields plus "needed by" time.
- Listings show the poster's commuter trust score, route streak, and verification badge.
- A "Request to join" button creates a join request; the poster can accept or decline.
- Status lifecycle: `open → matched → completed` or `open → expired`.

### F5. Travel buddy finder

- "I am travelling from station X to station Y at time T, looking for company."
- Distinct from carpool: no vehicle implied, just companion(s) for the metro ride itself (safety, navigation, company).
- Supports women-only filter.
- Match suggestions: show other open buddy requests on overlapping routes/times.
- Lifecycle: `open → matched → completed / expired`.

### F6. Lost & Found

- Two post types: **lost** something, or **found** something.
- Fields: item category, description, station, date, contact preference (in-app only), status.
- Status lifecycle: `active → reunited → closed`.
- Searchable by station and category.
- "I think this is mine" button starts an in-app conversation request (no contact info exposed until accepted).

### F7. Station marketplace

- Listings: title, description, price (INR), category, station catchment, condition, images (URL), status.
- Categories: books & study material, electronics, furniture, household, tickets/passes, other.
- "I'm interested" button starts a contact request.
- Status lifecycle: `available → reserved → sold`.
- No payment processing: transactions happen offline / via UPI directly.

### F8. Trust and safety

- Rating system: after a completed carpool, buddy match, or marketplace deal, both parties can rate each other 1–5 and leave a short note.
- Trust score: weighted aggregate of ratings + activity, displayed on profiles.
- SOS shortcut on every authenticated screen: opens a dialog with the user's last station + a "share live location / call 112" prompt (uses device capabilities; informational on web).
- Report flows on every piece of user-generated content.

### F9. Landing and marketing surface

- A public, SEO-friendly landing page that communicates the promise, the pain points addressed, the feature set, and a clear path to sign up.
- Follows the Master Playbook originality requirements: a station-node motif, a directional motion language, no generic gradient-blob hero, no fabricated statistics.

---

## 6. Non-functional requirements

### 6.1 Performance

- Public landing and station directory pages must be server-rendered and crawlable.
- LCP target ≤ 2.5 s on a typical 4G mobile profile.
- CLS ≤ 0.1; INP ≤ 200 ms.
- Image and font budgets kept proportionate; no decorative WebGL in v1.

### 6.2 Accessibility

- Semantic landmarks, logical heading order, keyboard-operable controls, visible focus, ≥ 44px touch targets, AA contrast, reduced-motion respected, no colour-only meaning.

### 6.3 Responsive design

- Mobile-first; verified at 390 px, 768 px, and 1440 px, plus intermediate widths where wrapping can fail.

### 6.4 Security and privacy

- Passwords hashed by NextAuth (bcrypt-based credentials adapter).
- No direct exposure of other users' contact information; all contact flows are opt-in.
- Input validation with Zod on every API route.
- `.env` and the SQLite database file are gitignored and never committed.

### 6.5 SEO

- Unique title and meta description per public page.
- OpenGraph and Twitter card metadata on the landing page.
- `robots.txt` and sitemap.
- Semantic, crawlable HTML for all public content.

### 6.6 Internationalisation

- v1 ships in English. The data model and UI strings are structured so Hindi and one regional language can be added without schema changes (documented in TechRD).

---

## 7. User journeys

### 7.1 The first-ride journey (Devika, last-mile auto)

1. Lands on the home page, reads the promise, clicks *Join your line*.
2. Registers with email + password, fills a 4-field profile (home station, work station, travel window, language).
3. Lands on her home-station page, sees the feed and active carpools.
4. Posts a carpool *request* for 7:30 PM from MG Road to Indiranagar.
5. Within the session, sees a *match suggestion* and a trust score; sends a join request.
6. Receives an accepted notification, sees the buddy's profile, completes the ride, rates the experience.

### 7.2 The lost-item journey (Rohan, dropped wallet at Dwarka)

1. Opens MetroMitra, goes to *Lost & Found*.
2. Posts a *lost* entry: wallet, Dwarka Sector 8, today 9:15 AM.
3. The entry appears on the Dwarka Sector 8 station feed.
4. A fellow commuter who found it clicks *I think this is mine* (from the finder side, *I found this*), an in-app contact request is created.
5. Rohan accepts the request; contact info is exchanged; item is returned; both mark the entry *reunited*.

### 7.3 The marketplace journey (Anitha, selling a tablet before leaving Mumbai)

1. Posts a marketplace listing: tablet, Andheri station catchment, ₹14,000.
2. Listing appears on Andheri station page and the global marketplace.
3. A buyer clicks *I'm interested*; Anitha reviews the buyer's trust score and accepts.
4. They coordinate offline; Anitha marks the listing *sold*.

---

## 8. Success metrics (v1 — qualitative, not fabricated)

We will not publish numbers we have not measured. For v1, success is defined as:

- The deployed application loads cleanly on mobile and desktop with no console errors.
- A new user can complete the full first-ride journey end-to-end without external help.
- Every public page is crawlable and passes the project's accessibility checklist.
- The CI/CD pipeline builds, lints, type-checks, and deploys the application automatically on push to `main`.

Future quantitative metrics (defined, not claimed): daily active commuters, stations with ≥ 10 active members, carpool match rate, lost-and-found reunion rate, marketplace conversion. These require real traffic and are out of scope for the v1 build report.

---

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Trust & safety abuse in ride/buddy matching | Women-only filters, rating system, report flow, no contact info exposed until mutual accept, clear "meet in public station area" guidance |
| Content moderation at scale | v1 uses a manual report queue; documented as a limitation; AI-assisted moderation is a roadmap item |
| Cold-start density (a station with no members is useless) | Seed station directory with real station data across 6 cities; global feed ensures value even before station-level density |
| Vercel read-only filesystem for SQLite | Documented limitation + migration path to Turso / Postgres in TechRD; v1 uses ephemeral-but-persistent-during-session behaviour |
| Localisation depth | v1 in English; schema and UI prepared for Hindi/regional addition |

---

## 10. Roadmap (post-v1)

- Native mobile apps (PWA install + offline-first).
- Real-time train and crowd data via metro corporation partnerships.
- In-app UPI payments for marketplace escrow.
- Multilingual UI (Hindi + one regional language per launch city).
- Station-area business listings and verified local ads.
- AI-assisted content moderation and lost-item image matching.
- Gamified "route streak" rewards and verified-commuter tiers.

---

## 11. Out-of-scope clarifications

- This document does not claim any ridership figure as a MetroMitra metric. All metro ridership figures in §2.1 are publicly reported approximate figures for the underlying transit systems and are cited only to size the addressable audience.
- No customer logos, testimonials, or partner names are invented. Where placeholders exist in the UI, they are clearly labelled as illustrative.
- This PRD is written to be read by engineers, designers, and reviewers as a real product document — not as marketing copy.

---

## 12. Reference alignment

This PRD was produced following the Master Playbook's discovery and originality rules (see `docs/reference/Master-Playbook.md`):

- **Strategy and originality** (§1, §2.4, §6 of this PRD): a product truth thesis, a station-as-node motif, and a clear differentiation from generic social/carpool apps.
- **Anti-patterns rejected** (see `docs/reference/anti-patterns.md`): no fabricated stats, no interchangeable gradient hero, no three-equal-cards default, no fake logo cloud.
- **Composition and typography** (see `docs/reference/composition-typography.md`): the landing sequence follows orientation → proof → capability → differentiation → objection → action.
- **Critique and verification** (see `docs/reference/critique-verification.md`): acceptance criteria are stated per feature; browser-verified interactivity is the standard of done.
- **Ponytail simplicity** (see `docs/reference/Ponytail-SKILL.md`): v1 ships the minimum feature set that proves the thesis; speculative features are pushed to the roadmap.
