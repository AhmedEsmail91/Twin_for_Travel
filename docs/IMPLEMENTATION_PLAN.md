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

## PHASE 1 — Foundation — `DONE`

**Objective.** A running, type-checked, lint-clean Next.js application with the design system
and bidirectional i18n in place.

**Tasks**
- [x] Next.js 16 App Router + TypeScript (strict) + React 19
- [x] Tailwind CSS v4 with the brand tokens declared in `@theme`
- [x] `next-intl` with `/ar` (default) and `/en`, locale-aware `<html lang dir>`
- [x] Fonts: Cairo (Arabic), Playfair Display + Manrope (Latin), self-hosted via `next/font`
- [x] Environment configuration with fail-fast validation (`src/config/env.ts`)
- [x] Root + locale layouts, `not-found`, `error` boundaries
- [x] Base UI primitives (Button, Card, Badge, Input, Select, Textarea, Modal, Skeleton, …)
- [x] Brand assets (logo) placed in `public/brand`

**Dependencies.** none

**Acceptance.** `npm run check` passes; `npm run build` succeeds; `/` redirects to `/ar`;
`/en` renders LTR and `/ar` renders RTL.

---

## PHASE 2 — Database architecture — `DONE`

**Objective.** Mongoose models and a connection strategy that is safe under Next.js hot reload
and serverless invocation.

**Tasks**
- [x] Cached global connection (`src/lib/db/mongoose.ts`)
- [x] `User` (admin) model — email, passwordHash, role, timestamps
- [x] `Trip` model — bilingual fields, dates, pricing, capacity, status, media, ordering
- [x] `SocialLink` model — platform, url, label, enabled, order
- [x] `SiteSettings` model — singleton document, company/contact/SEO settings
- [x] Indexes: `trips.slug` (unique), `{published,status,startDate}`, `featured`, `displayOrder`
- [x] Shared `Localized` sub-schema for `{ ar, en }` fields

**Dependencies.** Phase 1

**Acceptance.** Models compile, register once under hot reload, and enforce their constraints.

---

## PHASE 3 — Authentication — `DONE`

**Objective.** Real, server-verified admin authentication.

**Tasks**
- [x] Password hashing with `scrypt` (node:crypto) — salted, timing-safe verify
- [x] Session as a signed JWT (`jose`, HS256) in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie
- [x] `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [x] `requireAdmin()` server guard used by every admin route handler and admin page
- [x] Middleware: locale routing + admin cookie gate (defence in depth, not the authority)
- [x] Login rate limiting (fixed window, per IP + email)
- [x] Same-origin check on all mutating API requests (CSRF)
- [x] `scripts/create-admin.mjs` to provision the first admin

**Dependencies.** Phase 2

**Acceptance.** Unauthenticated requests to `/admin/*` redirect; unauthenticated requests to
admin APIs return `401` with the standard error envelope.

---

## PHASE 4 — Trip module & API — `DONE`

**Objective.** Full trip CRUD behind a clean module boundary.

**Tasks**
- [x] `trip.types.ts`, `trip.schema.ts` (Zod), `trip.model.ts`
- [x] `trip.repository.ts` — every Mongoose query lives here
- [x] `trip.service.ts` — slug uniqueness, status derivation, publish rules, business errors
- [x] `trip.controller.ts` — request → validated input → service → response envelope
- [x] `GET|POST /api/trips`, `GET|PATCH|DELETE /api/trips/[id]`
- [x] Public read paths used directly by Server Components (no self-HTTP)

**Dependencies.** Phase 2, 3

**Acceptance.** Create/read/update/delete works through the API with validation errors
returned as `422` and duplicate slugs as `409`.

---

## PHASE 5 — Settings & social module — `DONE`

**Objective.** Every business-configurable value comes from the database.

**Tasks**
- [x] `SocialLink` module + `GET|POST /api/social`, `PATCH|DELETE /api/social/[id]`
- [x] `SiteSettings` module + `GET|PUT /api/settings`
- [x] `getSiteSettings()` server helper with request-level `cache()` and safe defaults
- [x] WhatsApp number, contact details and social URLs consumed from settings only

**Dependencies.** Phase 2, 3

**Acceptance.** Changing the WhatsApp number in `/admin/settings` changes the floating button
and every reservation CTA on the public site.

---

## PHASE 6 — Public website — `DONE`

**Objective.** The premium bilingual travel site.

**Tasks**
- [x] Header with logo, locale switcher, mobile menu
- [x] Hero, featured trips, upcoming trips, why-travel-with-us, previous trips, gallery, CTA
- [x] `/[locale]/trips` with status filtering, `/[locale]/trips/[slug]` detail page
- [x] `/[locale]/previous-trips`, `/[locale]/about`, `/[locale]/contact`
- [x] `TripCard`, `TripGrid`, `TripGallery` (client, keyboard-navigable), `TripStatusBadge`
- [x] Footer, floating WhatsApp button, expandable social menu
- [x] Loading / empty / error states for every async surface

**Dependencies.** Phase 4, 5

**Acceptance.** Every page renders correctly in both locales and both directions with no
horizontal overflow from mobile to large desktop.

---

## PHASE 7 — Admin dashboard — `DONE`

**Objective.** A practical internal management system.

**Tasks**
- [x] Admin shell — navy sidebar, header, responsive drawer
- [x] Login page, logout
- [x] Overview with real counts (total / upcoming / completed / draft / featured)
- [x] Trip table — search, status/published/featured filters, sorting, pagination
- [x] Trip create & edit form — bilingual tabs, dates, pricing, capacity, services, gallery
- [x] Delete with confirmation, publish/unpublish, feature toggle
- [x] Social link management, site settings form

**Dependencies.** Phase 4, 5

**Acceptance.** An admin can run the whole business from `/admin` without touching the database.

---

## PHASE 8 — Image management — `DONE`

**Objective.** Provider-agnostic media handling.

**Tasks**
- [x] `StorageProvider` interface (`upload`, `delete`, `getUrl`)
- [x] `LocalStorageProvider` (development) and `CloudinaryStorageProvider` (production)
- [x] Provider selected by `STORAGE_PROVIDER`; business code never imports a provider directly
- [x] Upload validation: extension, declared MIME, **magic-byte sniffing**, size, dimensions
- [x] `POST /api/uploads`, `DELETE /api/uploads`
- [x] Cover image + gallery management with reordering in the admin trip form

**Dependencies.** Phase 3, 4

**Acceptance.** Swapping `STORAGE_PROVIDER` requires no change to trip or admin code.

---

## PHASE 9 — SEO, accessibility, performance — `DONE`

**Objective.** Production polish.

**Tasks**
- [x] Per-page metadata, dynamic trip metadata, Open Graph, canonical + `hreflang` alternates
- [x] `robots.ts`, `sitemap.ts` (includes published trips in both locales)
- [x] JSON-LD (`TravelAgency`, `TouristTrip`) on the relevant pages
- [x] Semantic landmarks, heading hierarchy, skip link, visible focus rings, labelled controls
- [x] `next/image` everywhere with sizes; `Suspense` boundaries around data sections
- [x] Security headers (CSP-adjacent set, HSTS, referrer, frame, nosniff)

**Dependencies.** Phase 6, 7

**Acceptance.** Contrast passes AA, keyboard traversal reaches every control, metadata is
locale-correct.

---

## PHASE 10 — Verification & hardening — `PARTIAL`

**Objective.** Prove the definition of done.

**Tasks**
- [x] `npm run typecheck` clean
- [x] `npm run lint` clean
- [x] `npm run build` succeeds
- [x] `scripts/seed.mjs` — settings, social links and sample bilingual trips for smoke-testing
- [x] Manual test matrix recorded in `docs/TESTING.md`
- [x] `.env.example` documented
- [x] `CLAUDE.md` reflects the delivered architecture
- [x] Verified against a real MongoDB and a real browser: auth, CSRF, trip CRUD,
      validation, upload rejection, status lifecycle, settings propagation
- [x] Layout/accessibility sweep — 10 pages × 6 widths, no issues
- [ ] **Automated suite (Vitest + Playwright) wired into `npm run check`** — not done;
      this is the one outstanding item, tracked in CLAUDE.md §26

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
