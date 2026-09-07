# Twin for Travel

Website and admin dashboard for **Twin for Travel**, an Egyptian travel company.

The public site showcases the brand and publishes upcoming and previous trips with
their schedules, pricing, activities and reservation information. There is no online
payment: the reservation call to action is a configurable contact hand-off, WhatsApp
first. The dashboard lets non-technical staff run all of that content.

Arabic is the default language; English is secondary. Both are authored by the admin.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
MongoDB + Mongoose · Zod · next-intl · `scrypt` + `jose` sessions

The API lives inside Next.js as Route Handlers. There is no separate backend.

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill MONGODB_URI and AUTH_SECRET
npm run create-admin -- --email you@example.com --name "Your Name"
npm run seed                   # optional: sample settings, social links and trips
npm run dev                    # http://localhost:4500 → /ar
```

`create-admin` prints a generated password once if `ADMIN_PASSWORD` is unset. Store
it — it is not recoverable.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 4500 |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, including the RTL rule below |
| `npm run check` | typecheck + lint |
| `npm run create-admin` | Provision or reset an admin account |
| `npm run seed` | Seed content (`-- --reset` to start clean) |

## Before you change anything

Read **[CLAUDE.md](./CLAUDE.md)**. It is the governing document: architecture, module
and API conventions, the design system, the security rules, and the things not to do.
If an architectural decision changes, update it in the same commit.

Two other documents matter:

- **[docs/BRAND_ANALYSIS.md](./docs/BRAND_ANALYSIS.md)** — how the colour, type and
  layout system was derived from the company's logo and printed offer sheet. Every
  visual decision should be traceable to it.
- **[docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)** — the phase-by-phase
  status board.
- **[docs/TESTING.md](./docs/TESTING.md)** — the manual matrix that must pass before
  a release.

## Two rules that bite

**Bidirectional layout.** Arabic is the default locale, so nothing may assume
left-to-right. Use logical properties only — `ms-*`/`me-*`, `ps-*`/`pe-*`,
`start-*`/`end-*`, `text-start`/`text-end`. There is a lint rule that fails the build
on `ml-`, `pr-`, `left-`, `text-left` and friends. Check any layout change in Arabic
first.

**Nothing business-configurable is hard-coded.** The WhatsApp number, social URLs and
contact details come from `SiteSettings`/`SocialLink` in the database, never from a
component.

## Deployment notes

- Set `NEXT_PUBLIC_APP_URL` to the real public origin — canonical URLs, Open Graph
  tags and sitemap entries are built from it.
- Set `STORAGE_PROVIDER=cloudinary` in production. The local provider writes to the
  instance filesystem and is for development only; on serverless hosting those files
  disappear on redeploy.
- `AUTH_SECRET` must be at least 32 random characters. Rotating it signs everyone out.
- Replace `public/brand/logo.png` with the company badge if it is not already in
  place — see [public/brand/README.md](./public/brand/README.md).
