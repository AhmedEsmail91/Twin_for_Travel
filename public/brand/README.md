# Brand assets

## `logo.png` — REPLACE THIS FILE

The file currently committed here is a **neutral placeholder** (a navy roundel with a
gold ring), not the company logo. It exists so the header, footer, admin login and
favicon render correctly out of the box.

Drop the supplied "Twin for Travel" badge in at this exact path, keeping:

- the filename `logo.png`,
- a **square (1:1) aspect ratio** — the layout reserves a square box and the logo is
  never stretched (CLAUDE.md §24),
- a transparent background if possible, since the mark sits on navy, cream and white.

Nothing else needs changing: every usage reads `SITE.logo` from `src/config/site.ts`.

## `og-image.png` — optional

1200×630 social sharing card. Referenced by `SITE.ogImage`. If it is absent, social
previews simply fall back to the site title and description.

## Why the logo is an image and not CSS

The badge combines photography, a script wordmark and a gold ring. Recreating it in
CSS or type would distort the brand and break at every size. It ships as an asset.
