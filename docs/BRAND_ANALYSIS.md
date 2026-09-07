# Phase 0 — Visual Reference Analysis

Source of truth: the two supplied references.

1. **The company logo** — a circular badge combining a sunset Nile/Giza scene with the
   "Twin for Travel" wordmark and the tagline `EXPLORE • DISCOVER • ENJOY`.
2. **The private-transportation offer** — a bilingual (AR/EN) price sheet laid out over a
   desaturated pyramids-and-Nile background.

This document records what was extracted from them and how it becomes a web design system.
It is the reference every UI decision in this project should be traceable to.

---

## 1. What the references actually contain

### 1.1 Logo

| Element | Observation |
| --- | --- |
| Shape | Circular badge, thin **gold ring** with a broken/swooping stroke that doubles as a motion line |
| Scene | Sunset over the Nile — pyramids right, palms + felucca left, low warm sun at centre |
| Motion | Airplane climbing to the upper-left, contrail behind it |
| Wordmark | "Twin" in a heavy **navy script** with a gold outline and a long ribbon swash |
| Sub-wordmark | "for Travel" — bold, slightly condensed navy sans |
| Tagline | `EXPLORE • DISCOVER • ENJOY` — small, wide letter-spaced navy caps separated by gold dots |
| Props | Navy rolling suitcase, gold-and-navy **location pins** (one inside the "i" dot, one below) |
| Palette | Navy `#071A2C`→`#102A43`, gold `#C19258`/`#F2B555`, warm cream `#F3E1BD`, sunset amber |

**Reading:** the brand is *warm premium Egyptian travel*. The navy carries the authority, the
gold carries the luxury, the photography carries the emotion. The logo is a badge — it wants
breathing room and a calm background, never a busy one.

### 1.2 Offer sheet

| Element | Observation |
| --- | --- |
| Background | Full-bleed pyramids/Nile photo, heavily **washed to warm sand** so text stays legible |
| Title block | Navy heavy caps headline + gold secondary line + a **three-gold-star divider** |
| Bilingual | English left / Arabic right, fully mirrored, both typographically first-class |
| Arabic display | Very heavy geometric Arabic (Cairo/Tajawal family), navy with a gold second line |
| Feature chips | Navy rounded rectangles, gold pictogram, EN over AR, 3 across |
| Price rows | Cream/white translucent cards, **thin gold hairline border**, moderate radius |
| Price token | Navy pill, gold/white numerals, small unit label under the number |
| Icons | Circular gold-outlined medallion, solid navy/gold glyph inside, centred between languages |
| Secondary block | Darker inset card for the 7-seater upsell — same system, lower emphasis |
| Contact band | Solid navy footer, gold WhatsApp number at display size, name beneath |
| Footnote | Thin cream strip with a gold star bullet — "price is for the whole car" |

**Reading:** the layout language is *banded*. Navy bands anchor the top and bottom; the warm
photographic middle holds content in light, gold-edged cards. Information is dense but never
crowded because every row is the same shape. Gold is used only on **edges, numerals, icons and
dividers** — never as a fill for large areas.

---

## 2. Extracted design language

### 2.1 Colour

| Role | Token | Hex | Usage |
| --- | --- | --- | --- |
| Primary | `navy` | `#071A2C` | Bands, footer, headings, body text, admin sidebar |
| Primary light | `navy-light` | `#102A43` | Raised navy surfaces, hover on navy, chips |
| Primary dark | `navy-dark` | `#040302` | Deepest overlays, scrim gradients |
| Accent | `gold` | `#C19258` | Borders, icons, dividers, links, focus rings |
| Accent light | `gold-light` | `#F2B555` | Numerals on navy, active states, highlights |
| Accent dark | `gold-dark` | `#AD6C37` | Gold text on cream (contrast-safe), pressed states |
| Surface | `cream` | `#F3E1BD` | Warm section backgrounds, light-on-navy text |
| Surface alt | `sand` | `#DFD2C2` | Card borders, dividers, alternating rows |
| Muted | `sand-muted` | `#C0B7A8` | Disabled, meta text on cream, hairlines |
| Text | `ink` | `#071A2C` | Primary text |
| Text secondary | `ink-soft` | `#574B43` | Secondary text, captions |
| Text on dark | `cream` | `#F3E1BD` | Text on navy |
| Neutral | `white` / `black` | `#FFFFFF` / `#040302` | Cards, deepest shadow |

Derived surfaces (needed for real UI, kept inside the family — no new hues):

| Token | Value | Why |
| --- | --- | --- |
| `page` | `#FBF7F0` | Cream at ~25% — a full page of `#F3E1BD` is too saturated to read on |
| `surface` | `#FFFFFF` | Card fill, as in the offer sheet's price rows |
| `surface-sunk` | `#F6EFE3` | Inputs, table stripes, empty states |
| `success` / `warning` / `danger` | `#2F6D4F` / `#AD6C37` / `#9B3B2F` | Status only, desaturated to sit beside navy+gold |

**Rules**
- Gold is an **accent**: hairlines, icons, numerals, dividers, focus. Never a page background.
- Gold text on light backgrounds uses `gold-dark` (`#AD6C37`) for contrast; `gold-light`
  (`#F2B555`) is reserved for text **on navy**.
- The dominant relationship is **navy + cream/sand + photography**, with gold as punctuation.
- No purple/neon/electric-blue gradients, no glassmorphism, no rainbow category colours.

### 2.2 Typography

The references pair a *display* voice (heavy, confident, slightly editorial) with a *plain*
voice (clean, legible, bilingual). Three families, each with a job:

| Family | Script | Role |
| --- | --- | --- |
| **Cairo** | Arabic + Latin | All Arabic text, display and body. Matches the flyer's heavy geometric Arabic. |
| **Playfair Display** | Latin | English display/headings — the editorial warmth of a premium travel brand. |
| **Manrope** | Latin | English body, UI, labels, numerals, and the entire admin dashboard. |

Rationale for three rather than two: Cairo's Latin is serviceable but flat, and the flyer's
English headline voice is clearly distinct from its body voice. Arabic gets a single family
because Arabic display/body distinction is carried by weight, not by contrast of style.

Tokens (see `src/app/globals.css`):

| Token | Size / line-height | Use |
| --- | --- | --- |
| `display` | clamp 2.5→4.5rem / 1.05 | Hero headline |
| `h1` | clamp 2→3rem / 1.15 | Page title |
| `h2` | clamp 1.5→2.25rem / 1.2 | Section title |
| `h3` | 1.25rem / 1.3 | Card title |
| `body` | 1rem / 1.7 | Paragraphs |
| `body-sm` | 0.9375rem / 1.65 | Dense UI |
| `caption` | 0.8125rem / 1.5 | Meta |
| `label` | 0.75rem / 1, `0.12em` tracking, caps | Eyebrows, chips, the tagline voice |

Arabic gets **+0.15 line-height** and **no letter-spacing** (Arabic must never be tracked out)
— handled once in `globals.css` via `:lang(ar)`, not per component.

### 2.3 Shape, depth, motion

| Property | Decision | Traced from |
| --- | --- | --- |
| Radius | `sm 4px`, `md 8px`, `lg 12px`, `xl 20px`, `pill 999px` | Offer cards are moderately rounded, not pill-shaped |
| Borders | 1px hairline, `sand` on light / `gold` at 25–40% for emphasis | Gold hairlines around every price row |
| Shadows | Warm-tinted, low spread (`0 1px 2px`, `0 8px 24px`, `0 20px 48px` at 6–14% navy) | The flyer's cards float subtly, they don't pop |
| Imagery | Full-bleed, warm-graded, always under a navy→transparent scrim when text sits on it | The washed background photo |
| Dividers | Thin gold rule, optionally with a centred `★★★` or `◆` | The three-star divider |
| Decoration | Gold hairline frames, corner rules, medallion icon circles | The circular icon medallions |
| Icons | Single-weight line/solid glyphs, currentColor, 20–24px, inline SVG (no icon library) | Flyer pictograms |
| Motion | 150ms `ease-out` for UI feedback, 400ms `cubic-bezier(.16,1,.3,1)` for entrances | Restraint — a premium brand doesn't bounce |

### 2.4 Layout language

- **Banded sections.** Navy bands (header, CTA, footer) bracket warm cream/photographic
  content bands. This is the flyer's structure, translated to a page.
- **Mirrored bilingualism.** Nothing about the layout may assume left-to-right. Every
  directional style uses logical properties (`margin-inline`, `inset-inline`, `ps-*`/`pe-*`).
- **Repeating row shape.** Lists of comparable things (trips, prices, services) use one card
  shape repeated, so density never becomes noise.
- **Medallion accents.** Circular gold-outlined icon holders mark features and services.

### 2.5 Brand personality

Warm · premium · confident · Egyptian · unhurried · trustworthy · bilingual by design.

Not: playful, techy, minimal-Scandinavian, or SaaS.

---

## 3. Applying it (and what to avoid)

**Do**
- Let photography do the emotional work; keep type and chrome quiet around it.
- Use navy for structure, cream for reading, gold for emphasis.
- Design the Arabic view first for any layout decision — it is the default locale.
- Keep gold coverage under roughly 10% of any screen.

**Don't**
- Reproduce the offer sheet as a web page. Its *language* transfers; its *layout* does not.
- Recreate or redraw the logo in CSS/text — it ships as an image asset with a fixed ratio.
- Put the logo on photography or on gold. It gets navy, cream, or white.
- Introduce hues outside the table in §2.1.
