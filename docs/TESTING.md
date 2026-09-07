# Testing

No automated suite is committed yet (see "Next step" below). This is the manual
matrix that must pass before a release, plus a record of what has been verified
automatically during development.

---

## 1. Setup

```bash
npm install
cp .env.example .env.local        # fill MONGODB_URI and AUTH_SECRET
npm run create-admin -- --email you@example.com --name "Your Name"
npm run seed                      # sample settings, social links and trips
npm run dev                       # http://localhost:4500 → /ar
```

`npm run seed -- --reset` clears trips, social links and settings first. It never
touches admin accounts.

---

## 2. Public site

Run every row in **both** locales. Arabic is the default and must be checked first.

| # | Check | Expected |
| --- | --- | --- |
| P1 | Visit `/` | Redirects to `/ar` |
| P2 | `/ar` | `<html lang="ar" dir="rtl">`, layout mirrored |
| P3 | `/en` | `<html lang="en" dir="ltr">` |
| P4 | Locale switcher on a trip page | Stays on the same trip, keeps any query string |
| P5 | Homepage | Hero, featured, upcoming, why-us, past trips, gallery, contact band |
| P6 | Featured trip also upcoming | Appears once, not in both rails |
| P7 | `/ar/trips` filters | `all` / `upcoming` / `ongoing` / `completed` change the list and the URL |
| P8 | Filter with no matches | Empty state with a "clear filters" route out, not a blank grid |
| P9 | Trip detail | Cover, gallery, activities, included/excluded, transport, meeting point, notes, reservation info |
| P10 | Trip detail sidebar | Price, dates, duration with its unit, seats, reservation window |
| P11 | Completed trip | Shown as a memory with the "this trip has finished" notice, not as an unavailable product |
| P12 | Cancelled trip | Cancellation notice shown |
| P13 | Gallery lightbox | Opens on click; arrow keys move (mirrored in RTL); `Escape` closes |
| P14 | Floating WhatsApp button | Opens `wa.me` with the trip name prefilled |
| P15 | Floating social menu | Expands, `Escape` and outside-click collapse it |
| P16 | Burger menu at ≤1023px | Drawer fills the viewport height, all links reachable, `Escape` closes |
| P17 | Unknown URL | Localised 404 |
| P18 | No WhatsApp number in settings | Button and CTAs hide rather than linking nowhere |

## 3. Admin

| # | Check | Expected |
| --- | --- | --- |
| A1 | `/admin` signed out | Redirects to `/admin/login?next=…` |
| A2 | Wrong password | Generic "Incorrect email or password" — never "no such user" |
| A3 | Repeated wrong passwords | Rate limited with `429` and a `Retry-After` |
| A4 | Correct password | Lands on `/admin`; cookie is `HttpOnly` |
| A5 | Sign out | Returns to login; going back does not show cached admin data |
| A6 | Overview | Counts match the trips table |
| A7 | Trips table | Search, status filter, visibility filter, sorting all narrow the list |
| A8 | Publish toggle, no cover image | Refused with "Add a cover image before publishing this trip" |
| A9 | Publish toggle, with cover | Flips, confirmation shown, public site updates |
| A10 | Create trip, empty form | `422` with inline errors on title, destination, dates and capacity |
| A11 | Create trip, valid | Redirects to the edit page |
| A12 | Edit, change one field | Every other field survives the save |
| A13 | Status → `DRAFT` while published | Refused, naming the two settings that disagree |
| A14 | Status → `DRAFT`, unpublished | Saves; trip disappears from the public site |
| A15 | Status → `CANCELLED` | Persists and survives publication |
| A16 | Dates moved to the past | Status becomes `COMPLETED` without manual intervention |
| A17 | Delete trip | Confirmation dialog first; second delete returns `404` |
| A18 | Upload cover | Accepted; appears immediately |
| A19 | Upload a non-image renamed `.png` | Rejected by the magic-byte check |
| A20 | Gallery reorder | Order persists after save |
| A21 | Social link CRUD | Add, edit, hide, reorder, delete |
| A22 | Duplicate platform | `409` conflict |
| A23 | `javascript:` URL | `422` validation error |
| A24 | Settings save | WhatsApp number changes on the public site immediately |
| A25 | Admin at 390px | Sidebar drawer opens full height, forms usable |

## 4. API

| # | Check | Expected |
| --- | --- | --- |
| I1 | Mutating request, no `Origin`/`Referer` | `403 FORBIDDEN` |
| I2 | Mutating request, foreign `Origin` | `403 FORBIDDEN` |
| I3 | Mutating request, same origin | Succeeds, whichever port the app is served on |
| I4 | Any admin endpoint, signed out | `401 UNAUTHORIZED` |
| I5 | `GET /api/trips` anonymously | Published trips only, even with `?published=false` |
| I6 | `GET /api/trips/:id` anonymously | `401` |
| I7 | Invalid body | `422` with `error.details` keyed by field |
| I8 | Duplicate slug | `409 SLUG_TAKEN` |
| I9 | Unknown id | `404 TRIP_NOT_FOUND` |
| I10 | Any failure | No stack trace in the response |

## 5. Verified automatically during development

These were run against the app in a real browser and a real MongoDB, and are worth
re-running after significant UI work:

- **Layout and accessibility sweep** — 10 pages × 6 widths (360→1920). Asserts no
  horizontal overflow, no `<img>` without `alt`, exactly one `<h1>` per page, no
  skipped heading levels, no unnamed interactive controls, and the correct
  `dir`/`lang` per locale. Last run: no issues across all 60 combinations.
- **Upload validation** — a text file renamed `.png`, a PNG declared as `image/jpeg`,
  and a disallowed extension are all rejected.
- **CSRF** — same-origin accepted, foreign origin and absent origin refused.
- **Status lifecycle** — DRAFT/CANCELLED/derived transitions, through the API and
  through the admin UI.

## 6. Next step: automating this

Per CLAUDE.md §21, when automation is added:

- **Vitest** for the pure units — `trip.service` status derivation and slug
  resolution, the Zod schemas (especially that an update never resurrects a
  default), `lib/utils/dates`, `slugify`, and `modules/media/image-inspect`.
- **Playwright** for the flows in section 2 and the CRUD in section 3, in both
  locales.

Wire whatever is added into `npm run check` so it runs with typecheck and lint.
