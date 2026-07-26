# Product Requirements Document (PRD)
## MetroMitra — Hyperlocal Community Surface for Indian Metro Commuters

> **Document status:** Baseline for the v2 build (no-backend, browser-local)
> **Author:** MetroMitra product team
> **Last revised:** Build cycle 2

---

## 1. Executive summary

MetroMitra is a hyperlocal community web application built around **Indian metro rail stations**. It gives the millions of people who pass through the same stations every day a shared place to find last-mile rides, recover lost belongings, trade within a commuter pool, post and discuss entrepreneurial ideas anchored to a station, and talk about the station they share. The thesis is unchanged from the original concept: a metro station is a natural unit of community, and no existing product treats it that way.

What changed in v2 is the *implementation posture*. MetroMitra is now a **zero-setup, browser-local application**. There is no backend, no database, and no API. All commuter data lives in the browser through a Zustand store that persists to `localStorage`. Authentication is a demo flow that writes to the same store. The result is an artifact a reviewer can clone, `npm install`, `npm run dev`, and use immediately, with no Prisma setup, no environment variables to chase, and no server to provision. It is honestly described as a functionality-exploration build, not as production software.

This document updates the earlier PRD to match that posture. It also replaces the retired "Travel buddy finder" feature with **Idea Junction**, a station-anchored board for entrepreneurial ideas and thoughts. The market research in §2 is retained unchanged: the Indian metro commuter pain points and the competitive gap are real and remain the reason this product exists at all.

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

1. **Last-mile cost and isolation.** Most riders exit a station still needing an auto, cab, or walk to a final destination. Solo fares are expensive; informal sharing is awkward to arrange ad hoc.
2. **Lost belongings.** Crowded coaches lead to dropped phones, wallets, ID cards, bags. The official lost-and-found counter is slow and station-bound; there is no networked recovery channel.
3. **Loneliness of mass transit.** Millions share the same train, the same platform, the same exit, every single day — and never speak. There is no platform that recognises this shared routine.
4. **Navigating unfamiliar stations and cities.** New residents, students, and travellers struggle with exits, interchanges, feeder services, and station-area amenities.
5. **No trustworthy intra-commuter commerce.** Buying and selling within a verified local commuter pool (textbooks, electronics, furniture for newly-relocated professionals) is currently routed through impersonal classifieds.
6. **No voice for station-level community issues.** Crowding, lift outages, water availability, security presence — discussed in scattered WhatsApp groups, if at all.
7. **Wasted commute time for an aspirational demographic.** Metro commuters are disproportionately young professionals, students, and aspiring founders. Commute time is dead time; there is no structured way to turn it into entrepreneurial serendipity with people who share a routine.

### 2.3 Competitive landscape and the gap

| Category | Existing players | Why they do not solve this |
|---|---|---|
| General social / messaging | WhatsApp groups, Facebook, Telegram | Not metro-aware; no station-level structure, no trust signals, no commute-specific tooling |
| Intercity carpooling | BlaBlaCar | Long-distance focus, not urban last-mile or metro feeder |
| Urban carpooling | sRide, QuickRide | Car-owner centric; do not serve metro-exit last-mile or non-car owners |
| Metro utility apps | DMRC Momentum, Mumbai Metro 1, Namma Metro | Journey planning and ticketing only; no social or community layer |
| Classifieds | OLX, Facebook Marketplace | City-wide, anonymous, no commuter trust context |
| Founder-matching / idea boards | CoFoundersLab, IndieHackers, X | Global or country-level; not anchored to physical routine or station proximity |

**The gap:** no product treats the *metro station* as the primary unit of community and combines last-mile ride-sharing, lost-and-found, local commerce, station conversation, and founder/idea matching in one trusted, transit-aware place.

### 2.4 Why MetroMitra will stand out

1. **Station-first, not city-first.** Community is anchored to a specific station code (e.g. `st-RJC` for Rajiv Chowk, `st-CSB` for Cubbon Park). This makes every interaction immediately useful and locally legible.
2. **Trust built for transit.** Profiles carry commute context, a community rating, and an explainable trust score — purpose-built for "is this person safe to share a ride or trade with?"
3. **Multi-need, single app.** A commuter does not want five apps for five micro-problems. MetroMitra consolidates them around a shared identity: *the line you ride*.
4. **Idea Junction — the standout feature.** Station-anchored founder and idea matching is something no incumbent does. Metro commuters are a high-signal audience for entrepreneurial serendipity; matching them by station turns commute time into a recurring, low-friction founder-meeting surface.
5. **India-native by default.** Indian metro line colour semantics, INR pricing, awareness of interchange complexity, and a multilingual roadmap.
6. **A brand motif that means something.** The visual language is derived from the metro map itself — nodes (stations) connected by coloured lines — used as a structural device, not decoration.

---

## 3. Goals and non-goals

### 3.1 Goals for the v2 build

- Ship a deployed, usable web application that a reviewer can run locally with `npm install && npm run dev` and explore end-to-end with zero external setup.
- Demonstrate the product thesis end-to-end in the browser: a commuter can register, build a profile, browse 80 real Indian metro stations across six cities, post to a station feed, request or offer a last-mile carpool, post an entrepreneurial idea and find interested collaborators on the same line, report or reclaim a lost item, list and browse marketplace items, and rate other commuters.
- Persist all demo data in the browser via `localStorage` so a refresh does not wipe state.
- Be honest in product copy and documentation about what this is: a functionality-exploration build, not production software.
- Deliver professional documentation (this PRD, the companion TechRD, and the LaTeX architecture document) that reflects a real engineering process.

### 3.2 Explicit non-goals for the v2 build

- **No backend, no database, no API in v2.** All data is client-side and per-browser. A production version would need a real backend, server-side authentication, a database, and an API layer; that path is documented in the TechRD limitations and in §10 below, but is not part of this build.
- **No production-grade authentication.** The auth flow is a demo: passwords are hashed with a non-cryptographic demo hash and stored in `localStorage`. This is acceptable for exploring functionality and is clearly labelled as such. It is not acceptable for real users.
- **No cross-device sync.** Data created in one browser does not appear in another. There is no account server.
- **No real-time updates.** The store is local; there is no socket layer and no cross-tab push. (Refresh picks up persisted state; multiple tabs are not synchronised.)
- **No real payments.** Marketplace listings express *intent* to transact offline. No money flows through the platform.
- **No native mobile apps.** The web app is responsive and installable but the delivery target is a web deployment.
- **No live metro train APIs or ticketing.** Real-time train data partnerships are out of scope; the product is community-led.
- **No AI-moderated content moderation** beyond a manual reporting flow.
- **No fabricated metrics, testimonials, partner logos, or social proof** anywhere in the product or documentation.

---

## 4. Target users and personas

### 4.1 Primary persona — "Daily Devika"

- 27, software professional in Bengaluru, takes the Purple Line from Baiyappanahalli to MG Road every weekday.
- Wants: a reliable last-mile auto share to Indiranagar, a place to report a lost earbud, and a low-friction way to test a side-project idea with other commuters who share her routine.
- Frustration today: three WhatsApp groups, no replies, no signal on who is offering the ride; and no place to float a startup idea to people who actually understand her commute context.

### 4.2 Secondary persona — "Relocated Rohan"

- 23, just moved to Delhi for a first job, stays near Dwarka, office in Connaught Place.
- Wants: understand the Yellow Line, find people his age going the same route, buy a second-hand study table from someone in his station catchment, and meet other aspiring founders on the same line.

### 4.3 Tertiary persona — "Occasional Anitha"

- 41, consultant who travels to Mumbai once a month for client work.
- Wants: a one-off carpool from Andheri to BKC, to know which exit at Andheri has prepaid autos, and to validate a D2C concept with commuters she would never otherwise meet.

### 4.4 Anti-persona

- Tourists looking for sightseeing itineraries. MetroMitra is for commuters and transit-aware residents, not a travel guide.

---

## 5. Functional requirements

Features are grouped by the commuter job they serve. Each feature lists acceptance criteria in plain language.

### F1. Authentication and commuter profile

- Email + password registration and login, implemented as a client-side demo flow that writes to the Zustand store.
- Profile fields: display name, city, home station, work/college station, usual travel window, bio, avatar (initials-based default), preferred language.
- "Verified commuter" badge appears after the user completes their profile and posts at least once.
- Account actions: update profile, log out. (Password change and account deletion are roadmap items, not v2 surfaces, because the local-only model makes them low-value.)

### F2. Station directory

- A browsable directory of **80 real metro stations across six cities**: Delhi (16), Mumbai (14), Bengaluru (14), Hyderabad (12), Chennai (12), Kolkata (12).
- Stations are static reference data in `src/lib/stations-data.ts`, derived from public DMRC, MMRCL, BMRCL, HMRL, CMRL, and Metro Railway (Kolkata) sources. Each station has a derived `id` (e.g. `st-MGR`), a short code, a name, a city, the line(s) it serves, line colour tokens, and an exit count.
- Station pages aggregate: community feed for that station, active carpools originating there, recent lost & found entries, marketplace listings nearby, and Idea Junction posts anchored there.
- Search by station name or code; filter by city.
- Because the station reference is static, public station pages are server-rendered from static data and remain crawlable; authenticated interactions on those pages are client-rendered from the store.

### F3. Community feed

- Post short text updates (with optional image URL) to a station's feed or the global feed.
- Posts support tags: `#help`, `#info`, `#alert`, `#meetup`, `#general`.
- Authenticated users can reply; the original poster can mark a reply as the answer.
- Sorting: latest, most replied.
- Reporting: any user can flag a post for review (stored locally for manual inspection; no automated moderation in v2).

### F4. Carpool / last-mile ride share

- A user can **offer** a ride (origin station, destination area, departure time, seats available, mode: auto / cab / personal vehicle, cost split preference, women-only flag).
- A user can **request** a ride with the same fields plus a "needed by" time.
- Listings show the poster's commuter trust score and verification badge.
- A "Request to join" button creates a join request; the poster can accept or decline. Accepting promotes the carpool to `matched`.
- Status lifecycle: `open → matched → completed` or `open → expired`.

### F5. Idea Junction — entrepreneurial ideas & thoughts discussion

Idea Junction is the standout feature of v2. It replaces the retired "Travel buddy finder." The insight: metro commuters are disproportionately young professionals, students, and aspiring entrepreneurs; matching them by station (physical proximity plus shared routine) for idea discussion turns commute time into entrepreneurial serendipity.

- A user posts an **idea card** anchored to a station. Fields:
  - `title` — short headline.
  - `description` — what the idea is and who it is for.
  - `category` — `idea` | `feedback` | `cofounder` | `discussion` | `showcase`.
  - `looking-for` — `co-founder` | `feedback` | `discussion` | `collaborator`.
  - `station` — the station the idea is anchored to (the poster's home or work station by default).
  - `stage` — `just-an-idea` | `validating` | `building` | `launched`.
  - `notes` — optional free-text context (early user interviews, links, constraints).
- A reader on the same line, or even the same station, can click **"Let's discuss"** to create an in-app contact request. Contact information is *not* exposed until the original poster accepts the request.
- The idea card shows how many commuters have expressed interest and at what stage the idea is.
- Status lifecycle: `open → matched → closed`. Closing an idea is a manual action by the poster.
- Idea Junction posts appear both on the `/ideas` board (the dedicated route, nav label "Idea Junction") and on the originating station's page.
- Acceptance criteria: a logged-in user can create, view, and express interest in ideas end-to-end in a single browser session, and the persisted state survives a refresh.

### F6. Lost & Found

- Two post types: **lost** something, or **found** something.
- Fields: item category, description, station, event date, contact preference (in-app only), status.
- Status lifecycle: `active → reunited → closed`.
- Searchable by station and category.
- "I think this is mine" button starts an in-app conversation request (no contact info exposed until accepted).

### F7. Station marketplace

- Listings: title, description, price (INR), category, station catchment, condition, image (URL), status.
- Categories: books & study material, electronics, furniture, household, tickets/passes, other.
- "I'm interested" button starts a contact request.
- Status lifecycle: `available → reserved → sold`.
- No payment processing: transactions happen offline / via UPI directly between parties.

### F8. Trust, ratings, and contact-request flow

- Rating system: after a completed carpool, Idea Junction match, or marketplace deal, both parties can rate each other 1–5 and leave a short note.
- Trust score: a 0–100 explainable score computed client-side from profile completeness, verification badge, average rating, and number of completed interactions. It is shown on profiles and on every listing the user creates.
- Contact-request flow: any "I'm interested", "I think this is mine", or "Let's discuss" action creates a `ContactRequest`. The recipient sees it in their profile inbox and can accept or decline. Accepting is the only thing that exposes the initiator's contact intent to the recipient (and vice versa, by mutual action). Until then, no contact details change hands.
- Report flow on every piece of user-generated content; reports sit in the local store for manual inspection.

### F9. Landing and marketing surface

- A public landing page that communicates the promise, the pain points addressed, the feature set, and a clear path to sign up.
- Follows the Master Playbook originality requirements: a station-node motif, a directional motion language, no generic gradient-blob hero, no fabricated statistics.
- The landing page honestly describes MetroMitra as a zero-setup, browser-local application for exploring the concept. It does *not* claim server-side rendering for SEO of authenticated content, server-side sessions, a managed database, or production-grade security — none of those are true in v2.

---

## 6. Non-functional requirements

### 6.1 Performance

- Public landing, station directory, and station detail pages are server-rendered from static station data so first paint is fast and the HTML is crawlable.
- Authenticated app surfaces are client-rendered from the local store; there is no network round-trip for reads, so perceived latency is bounded by React render cost only.
- LCP target ≤ 2.5 s on a typical 4G mobile profile. CLS ≤ 0.1; INP ≤ 200 ms.
- Image and font budgets kept proportionate; no decorative WebGL in v2.

### 6.2 Accessibility

- Semantic landmarks, logical heading order, keyboard-operable controls, visible focus, ≥ 44 px touch targets, AA contrast, reduced-motion respected, no colour-only meaning (line colours are always paired with a label).

### 6.3 Responsive design

- Mobile-first; verified at 390 px, 768 px, and 1440 px, plus intermediate widths where wrapping can fail.

### 6.4 Security and privacy (honestly stated)

- This is a client-side demo. Passwords are hashed with a non-cryptographic demo hash (djb2-style) and stored in `localStorage`. Anybody with browser access to the device can read or modify stored data.
- No direct exposure of another user's contact information; all contact flows are opt-in through `ContactRequest`.
- The TechRD documents, in §8 and §10, exactly what a production version would need: server-side hashed passwords, a real database, rate limiting, HTTPS-only cookies, server-side input validation.

### 6.5 SEO

- Unique title and meta description per public page (landing, station directory, station detail, about).
- `robots.txt` and a dynamic sitemap generated from the static station list.
- Semantic, crawlable HTML for public content. Authenticated app surfaces are not crawlable and are not indexed.

### 6.6 Internationalisation

- v2 ships in English. The data model and UI strings are structured so Hindi and one regional language can be added without schema changes (documented in TechRD).

---

## 7. User journeys

### 7.1 The first-ride journey (Devika, last-mile auto)

1. Lands on the home page, reads the promise, clicks *Join your line*.
2. Registers with email + password, fills a 4-field profile (home station, work station, travel window, language).
3. Lands on her home-station page, sees the feed and active carpools.
4. Posts a carpool *request* for 7:30 PM from MG Road to Indiranagar.
5. Within the session, sees a matching *offer* and the offerer's trust score; sends a join request.
6. Receives an accepted notification in her inbox, sees the offerer's profile, completes the ride, rates the experience.

### 7.2 The Idea Junction journey (Rohan, validating a side-project concept)

1. Rohan is on the Yellow Line from Dwarka to Rajiv Chowk every morning. He has been thinking about a station-area co-working pod concept but has no one to stress-test it with.
2. He opens MetroMitra, navigates to **Idea Junction**, and posts a card: title *"Station-area co-working pods"*, category `feedback`, looking-for `feedback`, station `st-RJC` (his work station), stage `just-an-idea`, with a one-paragraph description of the unit-economics question he is stuck on.
3. The card appears on the `/ideas` board and on the Rajiv Chowk station page.
4. Devika, who rides the same Yellow Line interchange at Rajiv Chowk on her commute home, sees the card on the station page. She has thought about the same problem from a real-estate angle. She clicks **Let's discuss**.
5. Rohan sees a new contact request in his inbox from Devika, with a one-line message about her angle. He accepts.
6. They take the conversation offline. Rohan later marks the idea `matched`, then `closed` once they decide whether to keep exploring.

This journey is the reason Idea Junction exists. It is the kind of match that does not happen on a global founder-matching board, because the signal — same station, same routine, mutual legibility of commute context — is lost there.

### 7.3 The lost-item journey (Rohan, dropped wallet at Dwarka)

1. Opens MetroMitra, goes to *Lost & Found*.
2. Posts a *lost* entry: wallet, Dwarka Sector 8, today 9:15 AM.
3. The entry appears on the Dwarka Sector 8 station feed.
4. A fellow commuter who found it clicks *I think this is mine* (from the finder side, *I found this*); an in-app contact request is created.
5. Rohan accepts the request; contact info is exchanged; item is returned; both mark the entry *reunited*.

### 7.4 The marketplace journey (Anitha, selling a tablet before leaving Mumbai)

1. Posts a marketplace listing: tablet, Andheri station catchment, ₹14,000.
2. Listing appears on Andheri station page and the global marketplace.
3. A buyer clicks *I'm interested*; Anitha reviews the buyer's trust score and accepts.
4. They coordinate offline; Anitha marks the listing *sold*.

---

## 8. Success metrics (v2 — qualitative, not fabricated)

We will not publish numbers we have not measured. For v2, success is defined as:

- The deployed application loads cleanly on mobile and desktop with **no console errors**.
- A reviewer can run the app with zero setup: `npm install && npm run dev` produces a working application with no environment variables, no database, and no migration step.
- A new user can complete the full first-ride journey, the Idea Junction journey, the lost-item journey, and the marketplace journey end-to-end in a single browser session.
- Demo data **persists across page refreshes** in `localStorage`; a deliberate "reset demo data" action is available.
- Every public page is crawlable and passes the project's accessibility checklist.
- The CI/CD pipeline builds, lints, type-checks, and deploys the application automatically on push to `main`.
- All 80 stations across all six cities are visible and browsable on the directory and on station detail pages.

Future quantitative metrics (defined, not claimed): daily active commuters, stations with ≥ 10 active members, carpool match rate, Idea Junction contact-request accept rate, lost-and-found reunion rate, marketplace conversion. These require real traffic, real accounts, and a real backend — all out of scope for v2.

---

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A reviewer mistakes the demo auth for production auth | Demo hash and "demo only" callouts in the UI, the README, and the TechRD; the landing page does not claim production-grade security |
| localStorage is per-browser and ephemeral | Documented limitation; a "reset demo data" action is provided; migration path to a real backend is documented in TechRD §10 |
| Cold-start density (a station with no demo activity looks empty) | Demo seed places content across MG Road, Rajiv Chowk, and Andheri so the first-visit experience is populated; global feed ensures value even before station-level density |
| Multiple tabs desynchronise | Documented as a known v2 limitation; the store writes to localStorage on every change, but cross-tab synchronisation via the `storage` event is a roadmap item, not a v2 feature |
| Content moderation at scale | v2 uses a local manual report queue; documented as a limitation; AI-assisted moderation is a roadmap item and would require a backend |
| Localisation depth | v2 in English; schema and UI prepared for Hindi/regional addition |

---

## 10. Roadmap (post-v2)

The v2 build is intentionally a no-backend exploration. The roadmap is therefore split into two tracks: making the product real, and enriching the flagship feature.

**Track A — Migration to a real backend (in priority order):**

1. Provision a managed database (Postgres or libSQL/Turso) and migrate the Zustand store slices to typed server resources. The store types map almost 1:1 to a relational schema; this is mechanical, not a rewrite.
2. Introduce server-side authentication: replace the demo hash with scrypt or argon2, issue httpOnly session cookies, and move register/login/logout to server actions.
3. Add a thin REST or RPC API layer (Next.js Route Handlers are sufficient; no separate service is needed) with Zod validation at the trust boundary.
4. Add rate limiting, CSRF protection, and server-side input validation on every write.
5. Add cross-device sync (the database makes this free) and cross-tab real-time updates via WebSockets or Server-Sent Events where density justifies it.
6. Introduce real payments (UPI / escrow) for the marketplace, and a real moderation tool with AI-assisted triage.

**Track B — Idea Junction enrichment:**

1. A simple matching algorithm: surface ideas anchored to stations on the reader's commute lines first, then their city, then globally. Weight by overlapping travel window.
2. Stage progression nudges: if an idea has been `validating` for 30 days with no contact requests, prompt the poster with a structured next-step checklist.
3. A mentorship tier: commuters can mark themselves as a mentor (domain, stage expertise) and opt into receiving idea cards for feedback.
4. Pitch events: a station-anchored event type with an RSVP flow, deriving from the existing contact-request primitive.
5. Idea threads: long-form discussion attached to an idea card, beyond the one-shot contact request.

The two tracks are independent. A team could ship Track A without changing Track B, because Idea Junction is feature-complete in v2 and only lacks the network effects that a real backend would unlock.

---

## 11. Out-of-scope clarifications

- This document does not claim any ridership figure as a MetroMitra metric. All metro ridership figures in §2.1 are publicly reported approximate figures for the underlying transit systems and are cited only to size the addressable audience.
- No customer logos, testimonials, or partner names are invented. Where placeholders exist in the UI, they are clearly labelled as illustrative.
- This PRD does not claim that MetroMitra is "production-ready", "enterprise-grade", or "built like a real product". It is a functionality-exploration build with a clear and documented path to production, written to be read by engineers, designers, and reviewers as a real product document — not as marketing copy.

---

## 12. Reference alignment

This PRD was produced following the Master Playbook's discovery and originality rules (see `docs/reference/Master-Playbook.md`):

- **Strategy and originality** (§1, §2.4, §6 of this PRD): a product truth thesis, a station-as-node motif, and a clear differentiation from generic social/carpool/founder-matching apps.
- **Anti-patterns rejected** (see `docs/reference/anti-patterns.md`): no fabricated stats, no interchangeable gradient hero, no three-equal-cards default, no fake logo cloud, no claims of "built like a real product" when the artifact is honestly a demo.
- **Composition and typography** (see `docs/reference/composition-typography.md`): the landing sequence follows orientation → proof → capability → differentiation → objection → action.
- **Critique and verification** (see `docs/reference/critique-verification.md`): acceptance criteria are stated per feature; browser-verified interactivity is the standard of done.
- **Ponytail simplicity** (see `docs/reference/Ponytail-SKILL.md`): v2 ships the minimum stack that proves the thesis. The simplest correct implementation of "persisted client state" is a Zustand store with manual `localStorage` sync — not a database, not a server, not the persist middleware that caused SSR loops. Speculative features are pushed to the roadmap.
