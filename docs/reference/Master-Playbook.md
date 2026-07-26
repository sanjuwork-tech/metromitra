# Master Website Playbook

> A portable operating system for AI-assisted website discovery, design direction, implementation, critique, verification, and delivery.

## Purpose

Use this playbook at the beginning of every website project. Read it before making design decisions, installing dependencies, cloning repositories, generating imagery, or editing production code.

The goal is not to apply the same visual style to every website. The goal is to consistently produce an original, brand-specific, accessible, performant, conversion-aware website through a repeatable process.

This playbook supports:

- professional and service businesses;
- e-commerce and catalogues;
- SaaS and technology products;
- applications and dashboards;
- editorial and content platforms;
- portfolios and personal brands;
- hospitality, food, health, education, finance, luxury, and automotive sites;
- immersive 3D, WebGL, and motion-led experiences;
- redesigns of existing websites.

3D is a selectable design route, not the universal default.

---

## 1. Agent role

Operate as a combined:

- **Product strategist** who understands the business, audience, promise, conversion, and evidence.
- **Design director** who creates a specific visual thesis and rejects generic AI output.
- **UX architect** who makes content, navigation, actions, and responsive behaviour understandable.
- **Design engineer** who translates the system into maintainable, accessible code.
- **Motion and spatial designer** when animation or 3D genuinely improves the experience.
- **Production owner** who verifies the rendered result and never confuses compilation with completion.
- **Ponytail engineer** who uses the simplest correct implementation after fully understanding the problem.

Do not assume that “modern” means dark mode, gradients, glassmorphism, oversized type, or 3D. These are materials, not a strategy.

---

## 2. Authority and operating rules

Apply instructions in this order:

1. The user’s current request and explicit business facts.
2. Project instructions such as `AGENTS.md`, `DESIGN.md`, security policy, stack, and deployment constraints.
3. Existing code, brand assets, content, analytics, and user research.
4. This Master Playbook.
5. The bundled UI/UX skills.
6. Brand playbooks and external references.

Never let a reference brand override the actual project.

### Required behaviours

- Inspect before changing.
- Ask only questions that materially affect the result.
- Do not ask for information already present in the project or supplied files.
- Group discovery questions into a short first round, then ask focused follow-ups.
- State assumptions when an answer is unavailable.
- Obtain approval for the proposed design route before substantial implementation.
- Prefer reversible, native, and already-installed solutions.
- Never fabricate business facts, metrics, testimonials, partner logos, awards, ratings, scarcity, or urgency.
- Never claim browser, performance, or deployment verification that did not occur.

---

## 3. Portable folder contract

The expected reusable project bundle is:

```text
project/
├── Master Playbook.md
├── skills/
│   └── ui-ux/
│       ├── SKILL.md
│       ├── references/
│       ├── playbook/
│       │   ├── INDEX.md
│       │   └── brands/
│       └── sources/
│           ├── emilkowalski-skills/
│           ├── taste-skill/
│           ├── ui-ux-pro-max-skill/
│           ├── awesome-design-md/
│           └── ponytail/
├── AGENTS.md
├── DESIGN.md
└── application source
```

Treat `skills/` and reference repositories as development material, not shipped application source.

Recommended `.gitignore`:

```gitignore
/skills/
/playbook-references/
```

Do not remove these ignore rules or push vendored skills unless the user explicitly requests it.

---

## 4. Skill and repository preflight

### 4.1 Use local skills first

Before cloning anything:

1. Locate `skills/ui-ux/SKILL.md`.
2. Read it completely.
3. Read `skills/ui-ux/references/source-catalog.md`.
4. Select only the relevant specialist skills.
5. Read every selected `SKILL.md` completely before acting.
6. Follow relative references from the selected skill only when required.

Do not load every skill into context for every project.

### 4.2 Required baseline skills

Use:

- `skills/ui-ux/SKILL.md` for the end-to-end design workflow.
- `skills/ui-ux/sources/ponytail/SKILL.md` for simplicity and dependency restraint.
- `skills/ui-ux/sources/taste-skill/skills/taste-skill/SKILL.md` for anti-generic direction or substantial redesigns.

Add specialist skills based on the project:

- animation or gestures: Emil Kowalski motion skills;
- design tokens and component systems: `design-system`;
- Tailwind, shadcn, or accessible UI implementation: `ui-styling`;
- brand identity: `brand` or `brandkit`;
- visual reference generation: `imagegen-frontend-web`;
- image-to-code workflow: `image-to-code`;
- strict motion review: `review-animations`;
- exhaustive output: `full-output-enforcement`.

### 4.3 Clone only when missing

If a required source is absent:

1. Tell the user which capability is missing.
2. Ask permission before network access or cloning.
3. Clone shallowly into `skills/ui-ux/sources/`.
4. Do not overwrite an existing folder.
5. Preserve licences.
6. Keep the repository ignored by the application Git repository.

Known sources:

```bash
git clone --depth 1 https://github.com/emilkowalski/skills.git \
  skills/ui-ux/sources/emilkowalski-skills

git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git \
  skills/ui-ux/sources/taste-skill

git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git \
  skills/ui-ux/sources/ui-ux-pro-max-skill

git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git \
  skills/ui-ux/sources/awesome-design-md
```

The Ponytail skill is bundled locally. If it is missing and the user wants a repository clone, ask for the exact repository URL rather than guessing.

---

## 5. Mandatory discovery

Do not select a design reference or start coding until the project is understood.

### 5.1 Inspect first

Read:

- existing `AGENTS.md`, `DESIGN.md`, README, routes, components, and styles;
- brand assets and logo files;
- product or service content;
- current analytics, research, or competitor material when supplied;
- deployment configuration and package manager;
- current Git status and uncommitted work.

For a redesign, identify what works before proposing replacement.

### 5.2 First discovery round

Ask a compact set of questions covering the unresolved items below. Prefer 5–8 grouped questions, not a long interrogation.

#### Business

- What is the business or product name?
- What does it sell or enable?
- Who is the primary audience?
- Which geography, language, or market matters?
- What should a visitor do first?

#### Scope

- Which pages or routes are required?
- Is this a new site or redesign?
- Which functions are required: enquiry, booking, checkout, authentication, search, filtering, CMS, dashboard, or multilingual content?
- Does a backend already exist?

#### Brand

- Are the logo, colours, fonts, photography, or brand guidelines available?
- Which current brand elements must remain?
- Which adjectives should the site embody?
- Which visual styles or competitors should be avoided?

#### Content and trust

- Is final copy available?
- Which real proof exists: testimonials, cases, credentials, product images, customer logos, guarantees, process, or metrics?
- Are legal, privacy, refund, shipping, accessibility, or regulatory pages required?

#### Technical and delivery

- Is the stack fixed?
- Is static HTML required?
- Where will it be deployed?
- Are there deadline, budget, device, browser, performance, or accessibility constraints?

### 5.3 Visual-route question

If the user has not chosen a visual direction, present 2–3 concrete routes based on the answers:

- route name;
- why it fits the audience and business;
- likely reference playbooks;
- image treatment;
- motion or 3D level;
- conversion implications;
- technical cost and risk.

Recommend one route. Do not delegate the recommendation back to the user without analysis.

### 5.4 Do not repeat discovery

Record confirmed answers in a brief. On future turns, ask only about genuinely missing or changed information.

---

## 6. Classify the website

Choose a primary archetype. A project may have a secondary archetype, but one must lead.

| Archetype | Primary job | Typical design emphasis | Suitable reference families |
|---|---|---|---|
| Professional services | Establish trust and generate qualified contact | authority, proof, process, readable expertise | Apple, Notion, Airbnb, IBM |
| E-commerce | Help customers discover, evaluate, and purchase | product media, navigation, filtering, PDP, checkout confidence | Shopify, Nike, Apple, Starbucks |
| SaaS / developer product | Explain mechanism and convert to trial or demo | product proof, technical clarity, interactive demonstration | Linear, Vercel, Stripe, Intercom |
| Application / dashboard | Enable repeated task completion | information hierarchy, state, keyboard use, density | IBM, Linear, Airtable |
| Editorial / media | Support discovery and reading | typography, hierarchy, art direction, archive structure | WIRED, The Verge, Notion |
| Luxury / portfolio | Create desire and communicate craft | pacing, image direction, restraint, case-study narrative | Ferrari, Bugatti, Tesla, Apple |
| Playful consumer | Build affinity and easy action | expressive type, illustration, motion, friendly controls | Figma, Spotify, Airbnb |
| Immersive 3D | Make spatial interaction part of the product story | WebGL, cinematic staging, motion, progressive enhancement | Runway, Tesla, Framer, Apple |

Reference families are starting points, not templates.

---

## 7. Reference selection protocol

Browse `skills/ui-ux/playbook/INDEX.md`.

Choose:

- one primary reference for composition;
- optionally one secondary reference for a different property such as typography, motion, product staging, or information density.

Do not inherit the primary reference’s full colour, type, radius, voice, and layout combination.

For each reference, produce:

| Decision | Borrow | Transform | Reject |
|---|---|---|---|
| Composition | Underlying rhythm | Adapt to project content | Brand-specific signature |
| Typography | Scale relationship | Use licensed or available type | Proprietary imitation |
| Colour | Role discipline | Apply project palette | Exact brand palette |
| Motion | Interaction principle | Adapt to project behaviour | Decorative choreography |
| Surface | Hierarchy logic | Apply project materials | Recognisable clone |

### Design-direction approval gate

Before substantial coding, show:

1. the proposed route;
2. the selected references;
3. the “borrow / transform / reject” summary;
4. the brand-derived motif;
5. the motion and 3D level;
6. the conversion path;
7. the main technical implications.

Proceed after approval or after applying the user’s changes.

---

## 8. Originality requirements

Write one direction sentence:

> A `[brand character]` experience using `[spatial or editorial device]` to help `[audience]` achieve `[outcome]`.

Derive a motif from:

- logo geometry;
- product behaviour;
- industry material;
- customer workflow;
- distinctive data;
- physical environment;
- cultural or geographic context.

Use one or two surprising moments. Keep navigation, forms, checkout, and essential controls familiar.

### Reject generic AI output

Reject:

- centered headline over an interchangeable gradient blob;
- three equal feature cards as the default page;
- a border around every paragraph;
- excessive pills and badges;
- decorative glassmorphism;
- random purple-to-blue gradients;
- fake dashboard screenshots;
- fake statistics or logo clouds;
- anonymous stock photography;
- floating 3D objects unrelated to the brand;
- identical reveal animations on every element;
- CTA bands after every section;
- a desktop layout merely stacked on mobile.

If changing the logo and accent would make the site fit an unrelated company, the direction is not specific enough.

---

## 9. Create the project brief

Before `DESIGN.md`, create a concise internal brief containing:

- business and audience;
- primary conversion;
- pages and functions;
- product or service hierarchy;
- proof available;
- objections;
- brand assets;
- content status;
- approved design route;
- selected references;
- motif;
- motion and 3D level;
- technical constraints;
- SEO and deployment needs;
- unresolved assumptions.

Do not create invented content merely to fill the design.

---

## 10. Write the project DESIGN.md

Write `DESIGN.md` before broad implementation. It is the project-specific visual source of truth.

Include:

1. **Source evidence and confidence**  
   List supplied assets, references, observed viewports, assumptions, and missing evidence.

2. **Brand thesis and audience**  
   Define the character, promise, audience, and desired response.

3. **Reference adaptation contract**  
   State what is borrowed, transformed, and rejected.

4. **Colour roles**  
   Define canvas, surfaces, ink, accents, semantics, contrast, and logo-only colours.

5. **Typography**  
   Define available font families, scale, weight, line height, tracking, reading measure, and responsive behaviour.

6. **Composition and narrative**  
   Define section sequence, content density, grid, full-bleed moments, asymmetry, whitespace, and card usage.

7. **Image and media direction**  
   Define subject, crop, lighting, material, desktop/mobile art direction, alt text, and loading.

8. **Components and complete states**  
   Define default, hover when relevant, focus-visible, active, selected, disabled, loading, empty, success, and error.

9. **Depth, motion, and spatial behaviour**  
   Define surfaces, borders, shadows, timing, easing, scroll behaviour, interruption, reduced motion, and optional 3D.

10. **Responsive art direction**  
    Define order, crop, simplification, interaction changes, grids, rails, and target sizes.

11. **Accessibility and performance**  
    Define contrast, semantics, keyboard use, target sizes, media budgets, font strategy, layout stability, and progressive enhancement.

12. **Conversion and content**  
    Define CTA hierarchy, proof placement, objection handling, form/contact behaviour, and ethical restrictions.

13. **SEO and delivery**  
    Define static rendering, metadata, structured data, crawlable content, sitemap, robots, social image, and deployment.

14. **Do and do not**  
    Encode project-specific guardrails.

15. **Verification checklist**  
    Define measurable acceptance criteria.

### Avoid false universal rules

The following may be strong project choices, but they are not universal:

- one accent colour;
- one radius value;
- negative display tracking;
- dark rather than light canvas;
- glass navigation;
- no true black;
- no gradients;
- 3D hero;
- centered hero;
- one animation duration.

Choose them only when the approved brand system benefits from them.

---

## 11. Generate AGENTS.md

Keep `AGENTS.md` operational and concise. Include:

- stack and package manager;
- source-of-truth documents;
- architecture constraints;
- static/server/backend boundaries;
- accessibility requirements;
- forbidden visual patterns;
- quality commands;
- browser viewport requirements;
- deployment constraints;
- protected user files and Git rules.

Do not paste the entire Master Playbook into `AGENTS.md`.

---

## 12. Choose the technical route

Inspect the existing project before selecting technology.

### Default public-site route

When no stack exists and the user wants a React marketing site:

- React 19;
- TypeScript strict;
- Tailwind CSS 4;
- a framework capable of static generation or server-rendered HTML;
- static HTML for public, indexable pages;
- minimal client-side JavaScript;
- semantic components;
- SEO routes and metadata.

Next.js App Router is a valid default, not a universal mandate.

### Ponytail dependency ladder

Before adding code or packages:

1. Does the feature need to exist?
2. Does the codebase already solve it?
3. Can the standard library solve it?
4. Can HTML or CSS solve it?
5. Can an installed dependency solve it?
6. Add the smallest correct implementation.

Never simplify away security, validation, accessibility, privacy, data protection, or an explicit requirement.

### Backend decision

Do not force a static no-backend architecture when the project requires:

- secure authentication;
- payments;
- stock or order integrity;
- private customer data;
- server-validated forms;
- CMS editing;
- search indexing;
- subscriptions;
- transactional email;
- webhooks.

Use WhatsApp, mail, telephone, calendar, or hosted checkout only when the user chooses that operating model.

---

## 13. Archetype-specific requirements

### Professional services

- Outcome-focused hero.
- Credentials and real proof near claims.
- Clear services and process.
- Specific audience and geography.
- Low-friction contact.
- Case studies when available.
- Honest expectation of what happens after enquiry.

### E-commerce

- Product taxonomy and navigation.
- Search and filters when catalogue size justifies them.
- Product-list and product-detail templates.
- Consistent product media and mobile crops.
- Price, variants, stock, shipping, returns, and trust.
- Cart and checkout with data integrity.
- Product structured data.
- Hosted commerce or backend integration when real transactions occur.

Do not build a fake cart or checkout for appearance.

### SaaS or developer product

- Explain the mechanism, not only the outcome.
- Use real product views or demonstrations.
- Separate marketing claims from technical evidence.
- Provide trial, signup, demo, or documentation routes.
- Keep code examples accessible and copyable.

### Application or dashboard

- Optimize task completion before marketing spectacle.
- Define loading, empty, partial, error, and permission states.
- Support keyboard interaction.
- Test dense data and narrow layouts.
- Use charts only when they improve comprehension.

### Editorial

- Define homepage, section, archive, article, author, search, and related-content behaviour.
- Protect reading measure and hierarchy.
- Art-direct images and captions.
- Use article, breadcrumb, and organization structured data where accurate.

### Portfolio or luxury

- Lead with authored work and material detail.
- Use pacing and restraint.
- Make case studies explain the problem, process, and result.
- Do not hide essential navigation behind experimental interaction.

---

## 14. Motion-level selection

Choose one:

### Level 0: Static editorial

Use when trust, reading, or speed dominates. Allow state transitions only.

### Level 1: Refined interface motion

Use short entry, hover, press, menu, and section transitions.

### Level 2: Narrative motion

Use scroll-linked or staged transitions to explain a product, process, or story.

### Level 3: Immersive 3D

Use WebGL or spatial interaction when depth is central to the product story or brand.

Do not select Level 3 because the user asked for a “modern” website. Explain its value, cost, fallback, and mobile impact first.

---

## 15. Immersive 3D route

Read the relevant motion skills before implementation.

### 15.1 3D purpose test

Use 3D only when at least one is true:

- the product is inherently spatial;
- interaction explains the mechanism;
- the brand motif becomes materially stronger in depth;
- cinematic staging is central to desire or storytelling;
- the user explicitly approves the added cost.

If none is true, use photography, illustration, video, CSS, or restrained motion.

### 15.2 Spatial brief

Define:

- purpose and focal point;
- camera and composition;
- text-safe space;
- user input;
- scene states;
- model and texture source;
- light and material system;
- loading experience;
- static poster or CSS fallback;
- reduced-motion behaviour;
- mobile simplification;
- device-pixel-ratio cap;
- performance budget;
- offscreen pause;
- cleanup and disposal.

### 15.3 3D composition

- Protect the primary message and action.
- Make the spatial object respond to the brand or product.
- Avoid automatic rotation unless rotation communicates state.
- Do not obscure text with scene contrast.
- Ensure the page remains understandable before the scene loads.
- Keep core content and conversion in semantic HTML, not inside canvas.

### 15.4 Performance defaults

- Load semantic HTML and primary copy first.
- Defer non-critical scene work.
- Cap DPR based on device capability.
- Compress models and textures.
- Keep light, material, post-processing, and draw-call counts deliberate.
- Pause or reduce work offscreen.
- Provide stable layout dimensions.
- Test low-power and touch devices.

---

## 16. Image and asset workflow

Inventory existing assets before generating new ones.

For every required image define:

- content job;
- subject;
- aspect ratio;
- desktop and mobile crop;
- style and medium;
- lighting and palette;
- text-safe space;
- alt text;
- priority and loading behaviour.

Generate imagery after the direction is approved. Inspect spelling, anatomy, perspective, brand consistency, crop, and file size.

Render important text in HTML rather than baking it into generated images.

Do not generate fake customer logos, product screenshots, or evidence.

---

## 17. Conversion and content architecture

Define one primary conversion per page.

Place the action:

- near the initial promise;
- after relevant proof;
- after the offer or mechanism;
- at the final decision point.

Use secondary actions only when they support a distinct lower-commitment path.

Pair claims with evidence. Put objection handling where the doubt occurs. Use FAQ only for questions not resolved naturally in the page.

Forms must have:

- visible labels;
- appropriate input types;
- useful error messages;
- privacy context;
- clear success feedback;
- the minimum information required for the next step.

---

## 18. Responsive, accessibility, and performance contract

### Responsive art direction

For every major section decide:

- order;
- alignment;
- crop or alternate asset;
- type scale and intended line breaks;
- grid, row, stack, or rail behaviour;
- touch interaction;
- whether spatial media simplifies or disappears;
- which whitespace is protected.

Default verification widths when the project does not specify others:

- 390px mobile;
- 768px tablet;
- 1440px desktop.

Test intermediate widths where wrapping may fail.

### Accessibility

- Use semantic landmarks and heading order.
- Keep controls keyboard accessible.
- Provide visible focus.
- Maintain contrast.
- Use target sizes of at least 44 by 44 CSS pixels.
- Provide useful alt text.
- Avoid colour-only meaning.
- Respect reduced motion and transparency.
- Preserve content without animation or WebGL.
- Announce meaningful dynamic state changes.

### Performance

Set project budgets before adding spectacle. Default public-site targets:

- LCP at or below 2.5 seconds under the agreed test profile;
- CLS at or below 0.1;
- INP at or below 200 milliseconds;
- no continuous unnecessary main-thread work;
- no preventable layout shift;
- proportionate image, font, JavaScript, and WebGL cost.

Treat these as targets to measure, not claims to assume.

---

## 19. SEO and crawlability

Public pages must provide meaningful HTML for crawlers and non-JavaScript contexts.

Include as appropriate:

- unique title and meta description;
- canonical URL;
- Open Graph and social image;
- Twitter metadata;
- sitemap;
- robots configuration;
- favicon and manifest;
- semantic headings and navigation;
- accurate structured data;
- descriptive image alt text;
- crawlable links;
- location and language metadata;
- product, article, breadcrumb, organization, service, or local-business schema when factual.

Do not hide primary copy inside canvas, video, or client-only components.

---

## 20. Build workflow

### Phase 0: Preflight

- Read this Master Playbook.
- Read project instructions.
- Inspect the code and assets.
- Locate local UI/UX and Ponytail skills.
- Clone only approved missing sources.

Exit: project state and available capabilities are understood.

### Phase 1: Discovery

- Ask unresolved business, scope, brand, content, technical, and delivery questions.
- Classify the website.
- Record the brief.

Exit: the audience, offer, conversion, routes, and constraints are clear.

### Phase 2: Direction

- Recommend 2–3 visual routes when needed.
- Select references by principle.
- Define the motif, content sequence, media, motion level, and conversion path.
- Present the adaptation contract.

Exit: user approves a direction.

### Phase 3: System

- Write `DESIGN.md`.
- Write or update concise `AGENTS.md`.
- Define tokens, states, assets, responsive behaviour, accessibility, performance, and verification.

Exit: the design and implementation rules are internally consistent.

### Phase 4: Scaffold

- Reuse the existing stack.
- Add only necessary dependencies.
- Establish routes, layout, fonts, tokens, SEO skeleton, and stable content structure.

Exit: the application renders without runtime errors.

### Phase 5: Build

Build page by page and component by component. For each unit:

1. Plan its content job and hierarchy.
2. Build the smallest complete version.
3. Render at required viewports.
4. Observe interactions, requests, and console.
5. Critique against `DESIGN.md`.
6. Fix the highest-severity issue.
7. Repeat until the unit passes.

### Phase 6: Integrate

- Verify navigation and conversion paths.
- Complete all states.
- Add final assets and content.
- Confirm responsive composition.
- Confirm SEO and structured data.

Exit: every required route is complete.

### Phase 7: Verify

- Run project lint.
- Run strict type checking where applicable.
- Run tests.
- Run the production build.
- Inspect required routes in a real browser.
- Check console and failed requests.
- Verify keyboard use.
- Verify reduced motion.
- Inspect mobile, tablet, and desktop.
- Check performance under the agreed profile.
- Verify static or server-rendered HTML for public pages.

Exit: all quality gates pass, or limitations are explicitly reported.

### Phase 8: Deliver

- Check staged files for secrets and generated junk.
- Commit only authorized source.
- Keep skills and reference repositories untracked unless requested.
- Push or deploy only when authorized.
- Verify the production URL after deployment.

---

## 21. Loop engineering

Use bounded loops, not one-shot prompting.

### Component loop

```text
OBJECTIVE: Build the named page or component against DESIGN.md.

PLAN: Define its content job, hierarchy, states, and responsive behaviour.
ACT: Make one coherent implementation step.
OBSERVE: Render it and capture the relevant evidence.
CRITIQUE: Check brand, originality, conversion, accessibility, performance, and responsiveness.
REFINE: Fix the highest-severity issue.

DONE when all acceptance criteria pass.
STOP when the iteration cap is reached or the same blocking condition repeats three times.
```

### Repair loop

```text
OBJECTIVE: Fix the failing quality gate at its root cause.

PLAN: Identify the first actionable error and affected callers.
ACT: Make the smallest root-cause correction.
OBSERVE: Re-run the narrow check, then the full gate.
REFLECT: Continue, finish, or report the blocker.
```

### Loop safeguards

- Set a maximum iteration count.
- Set time and token budgets when relevant.
- Detect identical no-progress results.
- Keep only relevant recent output in context.
- Re-read the objective and `DESIGN.md` to prevent drift.
- Make side-effecting actions idempotent.
- Do not expose private chain-of-thought; report concise decisions, evidence, and critique.
- A model stopping is not proof that the objective is complete.

---

## 22. Critique rubric

Score each category from 1 to 5:

| Category | Question |
|---|---|
| Strategy | Does the experience support the audience and business goal? |
| Originality | Could it belong to another company after a logo swap? |
| Hierarchy | Is one element dominant in each viewport? |
| Composition | Does the sequence vary while remaining coherent? |
| Brand | Are motif, colour, type, media, and voice consistent? |
| Content | Are claims concrete and supported? |
| Conversion | Is the primary action clear and appropriately repeated? |
| Interaction | Do states and motion explain response or continuity? |
| Responsive | Does mobile feel art-directed rather than collapsed? |
| Accessibility | Can the site be understood and operated inclusively? |
| Performance | Are assets, JavaScript, motion, and 3D proportionate? |
| SEO | Is public content semantic, crawlable, and accurately described? |
| Engineering | Is the solution simple, maintainable, and verified? |

Do not ship with:

- any blocking issue;
- any category below 4 when it is material to the project;
- unresolved console errors;
- failed build gates;
- unsupported claims of verification.

---

## 23. Verification evidence

The final report must state:

- routes and components delivered;
- selected direction and references;
- which skills were used;
- automated commands and exit status;
- browser and viewport coverage;
- console and failed-request status;
- keyboard and reduced-motion result;
- performance result or limitation;
- SEO/static-rendering result;
- remaining assumptions or limitations;
- commit, deployment, or artifact location.

If a required browser, dependency, credential, network connection, or deployment target is unavailable, report it and do not claim that gate passed.

---

## 24. Git and deployment safety

- Preserve unrelated user changes.
- Do not commit secrets, tokens, `.env`, databases, build output, dependency folders, or nested source repositories.
- Do not rewrite Git history unless explicitly requested.
- Use the project’s chosen package manager and commit its lockfile.
- Run the exact production build before pushing.
- Deploy only with user authorization.
- Verify the production result, not only the deployment command.

Static hosting, Vercel, Cloudflare, Netlify, or another target may be appropriate. Select from project requirements rather than assuming one provider.

---

## 25. Quick-start instruction for a new AI agent

Use this exact instruction:

```text
Read "Master Playbook.md" completely.
Then inspect the project instructions, code, brand assets, and the local
"skills/ui-ux" collection.

Do not code yet.

Ask me one concise first round of unresolved business, audience, scope,
conversion, brand, content, feature, SEO, stack, and deployment questions.
Classify the website and recommend 2–3 suitable design routes.
For each route, name the primary and supporting DESIGN.md references,
explain what would be borrowed, transformed, and rejected, and state the
motion/3D level, technical cost, and conversion implications.

Wait for my direction approval.
Then write the project brief, DESIGN.md, and concise AGENTS.md before
implementation. Use the simplest correct implementation, work in bounded
plan → build → observe → critique → refine loops, and do not declare
completion without the required automated and browser evidence.
```

---

## 26. Final principle

The master process is universal; the visual result must not be.

Understand the business first. Choose references by principle. Transform them through the brand. Use spectacle only when it carries meaning. Build the simplest correct system. Verify the real experience before calling it finished.
