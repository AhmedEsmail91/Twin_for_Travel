# Implementation Plan — Twin for Travel

Living document. Phase status is updated as work lands; it must always describe the **actual**
state of the repository, not the intended one.

Legend: `DONE` · `IN PROGRESS` · `PLANNED`

---

## PHASE 0 — Reference analysis & architecture — `DONE`

**Objective.** Establish the visual language, the data model and the module layout before any
application code is written.

**Tasks**
- [x] Analyse the logo and the transportation offer sheet
- [x] Derive the colour system, typography, shape/depth/motion tokens
- [x] Decide page, component, module, API, i18n and storage architecture
- [x] Record assumptions
- [x] `docs/BRAND_ANALYSIS.md`, `docs/IMPLEMENTATION_PLAN.md`, `CLAUDE.md`

**Files.** `docs/BRAND_ANALYSIS.md`, `docs/IMPLEMENTATION_PLAN.md`, `CLAUDE.md`

**Acceptance.** A developer can read the three documents and know what to build and why.

---

## PHASE 1 — Foundation — `PLANNED`

**Objective.** A running, type-checked, lint-clean Next.js application with the design system
and bidirectional i18n in place.

**Tasks**
- [ ] Next.js 16 App Router + TypeScript (strict) + React 19
- [ ] Tailwind CSS v4 with the brand tokens declared in `@theme`
- [ ] `next-intl` with `/ar` (default) and `/en`, locale-aware `<html lang dir>`
- [ ] Fonts: Cairo (Arabic), Playfair Display + Manrope (Latin), self-hosted via `next/font`
- [ ] Environment configuration with fail-fast validation (`src/config/env.ts`)
- [ ] Root + locale layouts, `not-found`, `error` boundaries
- [ ] Base UI primitives (Button, Card, Badge, Input, Select, Textarea, Modal, Skeleton, …)
- [ ] Brand assets (logo) placed in `public/brand`

**Dependencies.** none

**Acceptance.** `npm run check` passes; `npm run build` succeeds; `/` redirects to `/ar`;
`/en` renders LTR and `/ar` renders RTL.

---

## PHASE 2 — Database architecture — `PLANNED`

**Objective.** Mongoose models and a connection strategy that is safe under Next.js hot reload
and serverless invocation.

**Tasks**
- [ ] Cached global connection (`src/lib/db/mongoose.ts`)
- [ ] `User` (admin) model — email, passwordHash, role, timestamps
- [ ] `Trip` model — bilingual fields, dates, pricing, capacity, status, media, ordering
- [ ] `SocialLink` model — platform, url, label, enabled, order
- [ ] `SiteSettings` model — singleton document, company/contact/SEO settings
- [ ] Indexes: `trips.slug` (unique), `{published,status,startDate}`, `featured`, `displayOrder`
- [ ] Shared `Localized` sub-schema for `{ ar, en }` fields

**Dependencies.** Phase 1

**Acceptance.** Models compile, register once under hot reload, and enforce their constraints.

---

## PHASE 3 — Authentication — `PLANNED`

**Objective.** Real, server-verified admin authentication.

**Tasks**
- [ ] Password hashing with `scrypt` (node:crypto) — salted, timing-safe verify
- [ ] Session as a signed JWT (`jose`, HS256) in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie
- [ ] `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [ ] `requireAdmin()` server guard used by every admin route handler and admin page
- [ ] Middleware: locale routing + admin cookie gate (defence in depth, not the authority)
- [ ] Login rate limiting (fixed window, per IP + email)
- [ ] Same-origin check on all mutating API requests (CSRF)
- [ ] `scripts/create-admin.mjs` to provision the first admin

**Dependencies.** Phase 2

**Acceptance.** Unauthenticated requests to `/admin/*` redirect; unauthenticated requests to
admin APIs return `401` with the standard error envelope.

---

## PHASE 4 — Trip module & API — `PLANNED`

**Objective.** Full trip CRUD behind a clean module boundary.

**Tasks**
- [ ] `trip.types.ts`, `trip.schema.ts` (Zod), `trip.model.ts`
- [ ] `trip.repository.ts` — every Mongoose query lives here
- [ ] `trip.service.ts` — slug uniqueness, status derivation, publish rules, business errors
- [ ] `trip.controller.ts` — request → validated input → service → response envelope
- [ ] `GET|POST /api/trips`, `GET|PATCH|DELETE /api/trips/[id]`
- [ ] Public read paths used directly by Server Components (no self-HTTP)

**Dependencies.** Phase 2, 3

**Acceptance.** Create/read/update/delete works through the API with validation errors
returned as `422` and duplicate slugs as `409`.

---

## PHASE 5 — Settings & social module — `PLANNED`

**Objective.** Every business-configurable value comes from the database.

**Tasks**
- [ ] `SocialLink` module + `GET|POST /api/social`, `PATCH|DELETE /api/social/[id]`
- [ ] `SiteSettings` module + `GET|PUT /api/settings`
- [ ] `getSiteSettings()` server helper with request-level `cache()` and safe defaults
- [ ] WhatsApp number, contact details and social URLs consumed from settings only

**Dependencies.** Phase 2, 3

**Acceptance.** Changing the WhatsApp number in `/admin/settings` changes the floating button
and every reservation CTA on the public site.

---

## PHASE 6 — Public website — `PLANNED`

**Objective.** The premium bilingual travel site.

**Tasks**
- [ ] Header with logo, locale switcher, mobile menu
- [ ] Hero, featured trips, upcoming trips, why-travel-with-us, previous trips, gallery, CTA
- [ ] `/[locale]/trips` with status filtering, `/[locale]/trips/[slug]` detail page
- [ ] `/[locale]/previous-trips`, `/[locale]/about`, `/[locale]/contact`
- [ ] `TripCard`, `TripGrid`, `TripGallery` (client, keyboard-navigable), `TripStatusBadge`
- [ ] Footer, floating WhatsApp button, expandable social menu
- [ ] Loading / empty / error states for every async surface

**Dependencies.** Phase 4, 5

**Acceptance.** Every page renders correctly in both locales and both directions with no
horizontal overflow from mobile to large desktop.

---

## PHASE 7 — Admin dashboard — `PLANNED`

**Objective.** A practical internal management system.

**Tasks**
- [ ] Admin shell — navy sidebar, header, responsive drawer
- [ ] Login page, logout
- [ ] Overview with real counts (total / upcoming / completed / draft / featured)
- [ ] Trip table — search, status/published/featured filters, sorting, pagination
- [ ] Trip create & edit form — bilingual tabs, dates, pricing, capacity, services, gallery
- [ ] Delete with confirmation, publish/unpublish, feature toggle
- [ ] Social link management, site settings form

**Dependencies.** Phase 4, 5

**Acceptance.** An admin can run the whole business from `/admin` without touching the database.

---

## PHASE 8 — Image management — `PLANNED`

**Objective.** Provider-agnostic media handling.

**Tasks**
- [ ] `StorageProvider` interface (`upload`, `delete`, `getUrl`)
- [ ] `LocalStorageProvider` (development) and `CloudinaryStorageProvider` (production)
- [ ] Provider selected by `STORAGE_PROVIDER`; business code never imports a provider directly
- [ ] Upload validation: extension, declared MIME, **magic-byte sniffing**, size, dimensions
- [ ] `POST /api/uploads`, `DELETE /api/uploads`
- [ ] Cover image + gallery management with reordering in the admin trip form

**Dependencies.** Phase 3, 4

**Acceptance.** Swapping `STORAGE_PROVIDER` requires no change to trip or admin code.

---

## PHASE 9 — SEO, accessibility, performance — `PLANNED`

**Objective.** Production polish.

**Tasks**
- [ ] Per-page metadata, dynamic trip metadata, Open Graph, canonical + `hreflang` alternates
- [ ] `robots.ts`, `sitemap.ts` (includes published trips in both locales)
- [ ] JSON-LD (`TravelAgency`, `TouristTrip`) on the relevant pages
- [ ] Semantic landmarks, heading hierarchy, skip link, visible focus rings, labelled controls
- [ ] `next/image` everywhere with sizes; `Suspense` boundaries around data sections
- [ ] Security headers (CSP-adjacent set, HSTS, referrer, frame, nosniff)

**Dependencies.** Phase 6, 7

**Acceptance.** Contrast passes AA, keyboard traversal reaches every control, metadata is
locale-correct.

---

## PHASE 10 — Verification & hardening — `PLANNED`

**Objective.** Prove the definition of done.

**Tasks**
- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] `scripts/seed.mjs` — settings, social links and sample bilingual trips for smoke-testing
- [ ] Manual test matrix recorded in `docs/TESTING.md`
- [ ] `.env.example` documented
- [ ] `CLAUDE.md` reflects the delivered architecture

**Dependencies.** all

**Acceptance.** A new developer can clone, configure, seed and run the project from the README.

---

## Deliberately out of scope

Documented so nobody mistakes them for gaps:

- Online payment. Not requested. Reservation is a WhatsApp/contact hand-off.
- A booking engine with seat holds and confirmations. The service layer keeps `availableSeats`
  and the reservation window so one can be added later without touching the UI.
- Automated test suite. See `docs/TESTING.md` for the manual matrix and the recommended
  next step (Vitest for services/schemas, Playwright for the two locales).
- Multi-admin roles beyond `admin`. The `role` field exists; no second role is used yet.
