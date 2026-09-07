# CLAUDE.md — Twin for Travel

Governing document for this repository. Read it before changing anything. If an architectural
decision changes, **update this file in the same commit**.

---

## 1. Project purpose

A production website and admin dashboard for **Twin for Travel**, an Egyptian travel company.
The site showcases the brand, publishes upcoming and previous trips with schedules, pricing,
activities and reservation information, and makes contacting the company — above all by
WhatsApp — effortless. The dashboard lets non-technical staff run all of that content.

## 2. Business overview

- Customers browse trips, read the details, and **contact the company to reserve**.
- There is **no online payment and no booking engine**. The reservation CTA is a configurable
  contact hand-off (WhatsApp first). Do not build payments or seat-holding without a request.
- Content is bilingual. **Arabic is the default language**; English is secondary. Both are
  authored by the admin — never machine-translated at runtime.
- Trips have a lifecycle driven mostly by dates, with an admin override for exceptions.

## 3. Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Data | MongoDB + Mongoose 9 |
| API | Next.js Route Handlers (no Express, no separate backend) |
| Validation | Zod 4 |
| i18n | `next-intl` 4 |
| Auth | `scrypt` password hashing + `jose` HS256 session cookie |
| Media | `StorageProvider` abstraction — local (dev) / Cloudinary (prod) |

Adding a dependency requires a reason that Next.js, React, the browser, Node's standard
library or an existing dependency cannot satisfy.

## 4. Architecture

```
HTTP request
  → Route Handler (app/api/**/route.ts)   thin: auth, parse, delegate, respond
    → Controller (modules/*/x.controller.ts)   validate input, map result → envelope
      → Service (modules/*/x.service.ts)       business rules, invariants, domain errors
        → Repository (modules/*/x.repository.ts)  the ONLY place Mongoose is queried
          → Model (modules/*/x.model.ts)
            → MongoDB
```

Server Components on the **public** site call the **service** layer directly. They never fetch
the application's own HTTP API. Client components (admin forms, interactive filters) use the
HTTP API.

## 5. Folder structure

```
src/
├── app/
│   ├── [locale]/            public site (ar | en), locale layout sets lang + dir
│   ├── admin/               dashboard, locale-independent, English UI
│   ├── api/                 route handlers: auth, trips, social, settings, uploads
│   ├── globals.css          design tokens + base layer
│   └── layout.tsx           root shell
├── components/
│   ├── ui/                  primitives (Button, Card, Badge, Input, Modal, …)
│   ├── layout/              Header, Footer, MobileMenu, LocaleSwitcher
│   ├── home/                homepage sections
│   ├── trips/               TripCard, TripGrid, TripGallery, TripStatusBadge, …
│   ├── social/              WhatsAppButton, SocialMenu
│   └── admin/               AdminSidebar, TripForm, TripTable, SettingsForm, …
├── modules/
│   ├── auth/                model, schema, service, controller, session, password
│   ├── trips/               model, types, schema, repository, service, controller
│   ├── social/              …
│   ├── settings/            …
│   └── media/               upload validation + service on top of lib/storage
├── lib/
│   ├── db/                  mongoose connection
│   ├── http/                response envelope, error classes, handler wrapper
│   ├── storage/             StorageProvider interface + providers
│   ├── security/            csrf origin check, rate limiter
│   └── utils/               slug, dates, cn, formatting
├── i18n/                    routing, request config, navigation helpers
├── messages/                ar.json, en.json
├── types/                   shared cross-module types
├── config/                  env validation, site constants, navigation
└── proxy.ts                locale routing + admin cookie gate (Next 16 middleware)
```

Do not add folders for symmetry. Add one when something real lives in it.

## 6. Module conventions

Every backend feature is a folder in `src/modules/<feature>/` with, as needed:

| File | Responsibility |
| --- | --- |
| `<x>.types.ts` | Domain types and DTOs. No Mongoose imports leak out of the module. |
| `<x>.schema.ts` | Zod schemas for create/update/query. Single source of validation truth. |
| `<x>.model.ts` | Mongoose schema + model, guarded against hot-reload re-registration. |
| `<x>.repository.ts` | Every query. Returns plain objects, never Mongoose documents. |
| `<x>.service.ts` | Business rules. Throws `AppError` subclasses. Knows nothing about HTTP. |
| `<x>.controller.ts` | Validates with Zod, calls the service, returns `ApiResponse`. |

Rules:
- No business logic in `route.ts`.
- No Mongoose query outside a repository.
- No database access inside a React component.
- Admin and public paths share the same service — logic is never duplicated.

## 7. API conventions

Success:

```json
{ "success": true, "data": {} }
```

Failure:

```json
{ "success": false, "error": { "code": "TRIP_NOT_FOUND", "message": "Trip not found" } }
```

Validation failures add `error.details` — a field → messages map. Status codes: `200`, `201`,
`400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`. Internal errors are logged server-side
and returned as a generic `INTERNAL_ERROR`; stack traces never reach the client.

Every handler is wrapped by `withApiHandler` (`src/lib/http/handler.ts`), which performs the
same-origin check on mutating methods, catches `AppError`s, and normalises unknown errors.

## 8. Database conventions

- One cached connection per process (`src/lib/db/mongoose.ts`), safe under hot reload.
- Translatable content uses the shared `Localized` shape `{ ar: string; en: string }`. One
  document per trip — never one per language.
- Dates are stored as UTC `Date`. Trip *day* boundaries are treated as calendar days in the
  company's timezone (`SITE_TIMEZONE`, default `Africa/Cairo`) and formatted per locale with
  `Intl.DateTimeFormat`. No manual date-string arithmetic.
- `SiteSettings` is a singleton (`key: "site"`), upserted, never duplicated.
- Indexes exist only where a query needs them — see `docs/IMPLEMENTATION_PLAN.md` Phase 2.
- Image **binaries are never stored in MongoDB**; only URLs and metadata.

## 9. Authentication conventions

- Passwords: `scrypt` (N=2^15, r=8, p=1) with a 16-byte random salt, stored as
  `scrypt$N$r$p$salt$hash`, verified with `timingSafeEqual`. Chosen over bcrypt because Node's
  standard library provides a native, memory-hard KDF — no extra dependency. Never store or
  log plaintext.
- Session: JWT (HS256, `jose`) signed with `AUTH_SECRET`, 7-day expiry, in cookie
  `tft_session` — `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`.
- **Authorisation is always server-side.** `requireAdmin()` runs in every admin route handler
  and at the top of every admin page. Middleware only redirects early; it is not the authority.
- Login is rate limited per IP+email. Failures are generic (`INVALID_CREDENTIALS`) so the
  endpoint does not disclose which accounts exist.

## 10. Internationalisation rules

- Locales: `ar` (default) and `en`. Routing is prefix-based and **always prefixed**: `/ar/...`,
  `/en/...`. `/` redirects to `/ar`.
- UI strings live in `src/messages/{ar,en}.json`. No hard-coded user-facing copy in components.
- Database content is bilingual per document; `pickLocale(value, locale)` resolves it, falling
  back to the other language when one side is empty rather than rendering nothing.
- Slugs are **shared across locales** — one Latin, kebab-case, unique slug per trip, used by
  both `/ar/trips/<slug>` and `/en/trips/<slug>`. It is generated from the English title (or
  transliterated from Arabic when English is absent) and is editable by the admin. Rationale:
  one canonical URL per trip, no locale-pair slug table, no ambiguity when a language is later
  edited. Documented as an assumption in §23.
- The admin dashboard UI is English-only (it is an internal tool); the *content* it edits is
  bilingual.

## 11. RTL / LTR rules

- The locale layout sets `<html lang dir>`. Nothing else decides direction.
- Use **logical properties only**: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`,
  `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s-*`/`rounded-e-*`.
- Never write `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` in
  application code. There is a lint rule for this (`no-restricted-syntax` on `className`).
- Directional **icons** (arrows, chevrons) flip via `rtl:-scale-x-100`; non-directional icons
  never flip.
- Any layout change must be checked in Arabic first — it is the default locale.

## 12. UI / design system

Tokens live in `src/app/globals.css` under `@theme`. Consume them as Tailwind utilities
(`bg-navy`, `text-gold-dark`, `rounded-lg`, `shadow-card`). Never paste a hex literal into a
component. The full derivation is in `docs/BRAND_ANALYSIS.md`.

- Public site: banded layout — navy bands bracket warm cream/photographic content bands.
- Admin: navy sidebar, cream page, gold active states, white data surfaces. Utility over flair.
- Motion: 150ms `ease-out` for feedback, 400ms `cubic-bezier(.16,1,.3,1)` for entrances.
  Everything respects `prefers-reduced-motion`.

## 13. Brand colours

| Token | Hex | Role |
| --- | --- | --- |
| `navy` | `#071A2C` | Primary — bands, headings, body text |
| `navy-light` | `#102A43` | Raised navy surfaces |
| `navy-dark` | `#040302` | Deepest overlays |
| `gold` | `#C19258` | Accent — borders, icons, dividers |
| `gold-light` | `#F2B555` | Accent on navy only |
| `gold-dark` | `#AD6C37` | Gold text on light backgrounds (contrast-safe) |
| `cream` | `#F3E1BD` | Warm surface / text on navy |
| `sand` | `#DFD2C2` | Borders, dividers |
| `sand-muted` | `#C0B7A8` | Muted meta, hairlines |
| `ink` | `#071A2C` | Primary text |
| `ink-soft` | `#574B43` | Secondary text |
| `page` | `#FBF7F0` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `surface-sunk` | `#F6EFE3` | Inputs, stripes |

Gold is punctuation, not paint — keep it under roughly 10% of a screen. Do not introduce hues
outside this table. No purple/neon gradients, no glassmorphism.

## 14. Component conventions

- **Server Components by default.** `"use client"` only for state, effects, event handlers,
  browser APIs or interactive widgets — and as far down the tree as possible.
- One component per file, named export matching the filename (`TripCard.tsx` → `TripCard`).
- Props are explicit interfaces; no `any`; no prop-spreading of unknown objects onto DOM nodes.
- Variants use a small `cn()` + lookup-map pattern, not a styling dependency.
- A component earns its file when it is reused or non-trivial. Do not wrap single elements.

## 15. Image / storage architecture

`src/lib/storage/` exports a `StorageProvider` interface (`upload`, `delete`, `getUrl`) and
`getStorageProvider()`, which resolves from `STORAGE_PROVIDER` (`local` | `cloudinary`).
Business code imports only the interface. `src/modules/media/` validates uploads before they
reach a provider:

extension allow-list → declared MIME allow-list → **magic-byte sniff** → size limit →
dimension bounds parsed from the file header.

Local provider writes under `UPLOAD_DIR` (default `public/uploads`) and is for development
only — a serverless deployment must use Cloudinary or another object store.

## 16. Security rules

- Validate every input with Zod on the server, always. Client validation is UX only.
- Never interpolate user input into a Mongo query object; repositories build typed filters.
- Mutating API requests must pass the same-origin check — `Origin`/`Referer` compared against
  the origin the request **actually arrived on** (from `Host`), with `NEXT_PUBLIC_APP_URL`
  also accepted for proxied deployments. Combined with `SameSite=Lax` cookies this is our
  CSRF defence. Deriving the expected origin from the request rather than from configuration
  alone means a port mismatch cannot silently 403 every admin save.
- Never render untrusted HTML. `dangerouslySetInnerHTML` is used **only** for JSON-LD built
  from our own data.
- Security headers are set in `next.config.ts`.
- Never expose `MONGODB_URI`, `AUTH_SECRET`, or storage credentials to the client. Only
  `NEXT_PUBLIC_*` variables may be read in client components.
- Never commit `.env.local`.

## 17. Error handling

- Domain errors are `AppError` subclasses (`NotFoundError`, `ValidationError`, `ConflictError`,
  `UnauthorizedError`, `ForbiddenError`, `RateLimitError`) carrying `code`, `status`, `message`.
- Route handlers do not try/catch; `withApiHandler` does it once, centrally.
- Unknown errors are logged with context and returned as `INTERNAL_ERROR`.
- The UI renders `error.tsx` boundaries and explicit empty states; nothing fails silently.

## 18. Environment variables

See `.env.example` for the documented list. Validated at import time by `src/config/env.ts`,
which throws a readable error naming the missing variable rather than failing deep in a query.

## 19. Naming conventions

| Thing | Convention |
| --- | --- |
| Component files | `PascalCase.tsx` |
| Module files | `kebab-or-lower.role.ts` (`trip.service.ts`) |
| Hooks | `useThing.ts` |
| Types / interfaces | `PascalCase`, no `I` prefix |
| Constants | `SCREAMING_SNAKE_CASE` |
| Mongo collections | plural lower-case (`trips`, `sociallinks`) |
| API error codes | `SCREAMING_SNAKE_CASE` |
| Branches | `claude/<topic>` |

## 20. Development commands

```bash
npm install
cp .env.example .env.local     # then fill MONGODB_URI and AUTH_SECRET
npm run create-admin           # provision the first admin user
npm run seed                   # optional sample settings, social links and trips
npm run dev                    # http://localhost:4500  → /ar
npm run typecheck
npm run lint
npm run build
```

## 21. Testing strategy

No automated suite is committed yet. `docs/TESTING.md` holds the manual matrix that must pass
before a release. When automation is added: **Vitest** for services, schemas and utilities
(pure, no DB), and **Playwright** for the public flows in both locales plus admin CRUD. Do not
add a test framework without wiring it into `npm run check`.

## 22. Git conventions

- Work on `claude/<topic>` branches; never commit directly to `main`.
- Conventional-commit style subjects (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- One phase or one coherent concern per commit; keep `CLAUDE.md` and
  `docs/IMPLEMENTATION_PLAN.md` truthful in the same commit that changes behaviour.

## 23. Important architectural decisions

1. **No self-HTTP.** Public Server Components import services directly. Calling our own API
   over HTTP from the same server would add a round trip and a serialisation boundary for
   nothing.
2. **Repository/service/controller split.** Chosen so a future reservation system, a second
   storage provider or a different transport can be added without rewriting business rules.
3. **`scrypt` over `bcrypt`.** Native, memory-hard, in Node's standard library; one fewer
   dependency with no security loss.
4. **JWT session cookie over a session collection.** Stateless, edge-verifiable in middleware,
   and the admin population is tiny. If session revocation becomes a requirement, add a
   `sessionVersion` on the user and compare it in `requireAdmin()`.
5. **One shared slug across locales** (see §10) — one canonical URL per trip.
6. **Status is derived, then overridden.** `deriveStatus()` computes `UPCOMING`/`ONGOING`/
   `COMPLETED` from dates; `DRAFT` and `CANCELLED` are explicit admin states that always win.
   Staff never have to shuffle trips between "past" and "upcoming" by hand.
7. **Public pages render dynamically.** Content is admin-editable and must appear immediately
   after a save; per-request `cache()` dedupes reads within a render. No stale ISR windows.
8. **Tailwind v4 CSS-first tokens.** The design system is declared once in `globals.css`, so
   tokens are available to both utilities and raw CSS without a JS config file.
9. **No icon library.** The brand's pictograms are a small, fixed set; they live as inline SVG
   in `src/components/ui/Icon.tsx`, keeping the bundle and the visual language under control.

## 24. Things Claude MUST NOT do

- Create an Express server or any backend outside Next.js.
- Put Mongoose queries in React components, or business logic in `route.ts`.
- Hard-code the WhatsApp number, social URLs or contact details anywhere. They come from
  `SiteSettings`/`SocialLink`.
- Store image binaries in MongoDB.
- Store plaintext passwords, or invent placeholder/fake authentication.
- Expose secrets to the browser, or commit `.env.local`.
- Sprinkle `"use client"` across the tree.
- Ship mock data or stubbed endpoints where a real implementation is expected.
- Leave core functionality as `TODO`.
- Use physical direction utilities (`ml-`, `pr-`, `left-`, `text-left`, …).
- Treat Arabic as secondary, or ship an English-only layout with translated strings.
- Introduce colours outside §13, purple/neon gradients, or heavy glassmorphism.
- Recreate the logo in CSS or text, or distort its aspect ratio.
- Build payments or a booking engine without an explicit request.
- Add dependencies that the platform already covers.

## 25. Current implementation status

Phase 0 complete: references analysed, design system derived, architecture and data model
decided, documentation written. Phases 1–10 are tracked in `docs/IMPLEMENTATION_PLAN.md`,
which is the authoritative status board — update it as work lands.

## 26. Future planned work

- Automated tests (Vitest + Playwright) wired into `npm run check`.
- Reservation requests persisted as a `ReservationRequest` entity with an admin inbox, if the
  business outgrows the WhatsApp hand-off.
- A second admin role (`editor`) once more than one person manages content.
- Cloudinary transformation presets for responsive gallery derivatives.
- Structured audit logging of admin mutations.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
