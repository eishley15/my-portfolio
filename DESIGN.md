---
name: Kyle Payawal Studio
description: Light editorial photo and video portfolio — cream, raw, personal.
colors:
  bg: "#EDE8DC"
  bg-dim: "#E3D9C8"
  surface: "#F4EFE5"
  ink: "#0E0C0B"
  ink-muted: "rgba(14,12,11,0.45)"
  ink-faint: "rgba(14,12,11,0.14)"
  border: "rgba(14,12,11,0.09)"
  black: "#0E0C0B"
  black-pure: "#080706"
  off-white: "#F0EBE0"
  gray-dark: "#1C1A18"
typography:
  display:
    fontFamily: "'Fraunces', serif"
    fontWeight: 700
    fontStyle: "normal"
    letterSpacing: "-0.03em"
    lineHeight: 0.92
    note: "Variable font — use font-variation-settings: 'opsz' 144 at large sizes"
  display-italic:
    fontFamily: "'Fraunces', serif"
    fontWeight: 400
    fontStyle: "italic"
    letterSpacing: "-0.03em"
    lineHeight: 1.05
    note: "Editorial contrast lines within headlines only — never standalone"
  body:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 300
    fontSize: "16px"
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 400
    fontSize: "11px"
    letterSpacing: "2.5px"
    textTransform: "uppercase"
font-sizes:
  xs: "10px"
  sm: "11px"
  body-xs: "13px"
  body-sm: "14px"
  body: "16px"
  body-lg: "17px"
  quote: "21px"
  card-label: "28px"
  h3: "32px"
  h2-sm: "36px"
  display-xs: "42px"
  display-sm: "44px"
  display-base: "48px"
  display-md: "56px"
  display-lg: "64px"
  display-xl: "72px"
  display-2xl: "84px"
  display-3xl: "96px"
  display-4xl: "108px"
  display-5xl: "120px"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
  section: "120px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.none}"
    padding: "14px 36px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.gray-dark}"
    textColor: "{colors.off-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 36px"
    typography: "{typography.label}"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
---

# Design System: Kyle Payawal Studio

## Overview

**Creative North Star: "The Analog Print"**

This is a photographer's portfolio that trusts the work. The design does not compete with the images — it recedes into an aged-paper silence and lets the photographs announce themselves. The cream ground, the Fraunces serif, and the film grain skin are not decorative; they are a thesis: the work is primary, the interface is the frame.

The palette is a single warm monochrome stepped from raw linen to near-black ink. There is no accent color. No red, no blue, no brand hue. Color discipline is what keeps the photography on screen primary. Every interaction uses opacity, scale, and tonal shift — never hue.

Motion is present but imperceptible at first glance — TrueFocus cycling through headline lines, RotatingText swapping service words mid-sentence, category cards that breathe on hover. The effect should feel editorial, not technological. If you notice the interface before you notice the work, something is wrong.

**Key Characteristics:**
- Light-first: aged cream is the canvas, not a light-mode toggle
- Sharp everywhere: zero border radius throughout the system
- Two-font system: Fraunces (variable serif, optical size axis) + Outfit (geometric sans)
- Fraunces italic as the sole editorial accent — never used for standalone body copy
- Film grain skin (SVG noise, `mix-blend-mode: multiply`, ~3% opacity) applied globally
- Depth through tonal steps only — no shadows at rest

## Colors

A single warm monochrome. The palette moves from Aged Cream through Linen and Parchment to Near-Black Ink with no accent hue anywhere.

### Primary
- **Near-Black Ink** (`#0E0C0B`): Primary text, button backgrounds, dark overlays (CardNav, CTA sections), all foreground elements. Warm-toned — not neutral black.
- **Absolute Black** (`#080706`): Deepest layer only — `<html>` root, pure-dark contexts, the modal scrim base.

### Neutral
- **Aged Cream** (`#EDE8DC`): The main page background. Every section defaults here unless explicitly contrasting.
- **Linen Dim** (`#E3D9C8`): Section alternation (FAQ background), image placeholder backgrounds.
- **Pale Surface** (`#F4EFE5`): The lightest surface step — testimonial cards, elevated UI panels.
- **Antique White** (`#F0EBE0`): Text on dark surfaces (CTA section, CardNav). Body background in dark overlays.
- **Charcoal Dark** (`#1C1A18`): Dark surface one step above ink — CardNav cards, hover states in dark contexts.
- **Ink Muted** (`rgba(14,12,11,0.45)`): Secondary text, eyebrows, metadata. De-emphasis through opacity.
- **Ink Faint** (`rgba(14,12,11,0.14)`): Borders, dividers, loading indicator dots.
- **Border** (`rgba(14,12,11,0.09)`): Hairline separators. The thinnest visible structural mark.

### Named Rules
**The No-Accent Rule.** There is no accent color. Ink on cream is the entirety of the palette on light surfaces. Depart from this and the work stops being primary.

**The Warm Ink Rule.** Never substitute Near-Black Ink with a neutral or cool black. `#0E0C0B` is warm-toned by design — it reads against the cream ground correctly.

## Typography

**Display Font:** Fraunces (Google Fonts variable serif — optical size axis `opsz` 9–144, weight 100–900)
**Body / UI Font:** Outfit 300/400 (Google Fonts geometric sans)

**Character:** Fraunces is a high-contrast variable serif with a pronounced optical size axis — at large sizes it becomes more dramatic; at small sizes it opens up. Use `font-variation-settings: 'opsz' 144` on display text above 60px. Its italic optical is deeply calligraphic and forms the editorial counterpoint in headlines. Outfit at weight 300 keeps all UI text neutral and airy so Fraunces always dominates by contrast.

### Hierarchy
- **Display** (Fraunces 900, `opsz` 144, `clamp(44px, 5.5vw, 120px)`, line-height 0.88–0.92, tracking −0.03 to −0.04em, uppercase): Hero headlines, section titles, CTA headings. The primary structural voice.
- **Display Italic** (Fraunces 300 italic, `opsz` 120, ~10% smaller clamp range, line-height 1.0–1.05): Editorial contrast line within a Display headline. Never standalone; always immediately adjacent to Display upright.
- **Body Large** (Outfit 400, `clamp(14px, 1.6vw, 17px)`): FAQ questions, card descriptions, lead text.
- **Body** (Outfit 300, 16px, line-height 1.65, max ~65ch): All paragraph text, FAQ answers, about copy.
- **Label** (Outfit 400, 11px, 2.5px letter-spacing, uppercase): Navigation links, button text, eyebrows, metadata. The universal interactive chrome.

### Named Rules
**The Italic Counterpoint Rule.** Fraunces italic appears only in the direct company of Fraunces upright — one italic line within a Display headline, never a standalone heading.

**The 11px Floor.** No UI text set below 11px. Use `ink-muted` opacity for de-emphasis, never a smaller size.

## Layout

Full-bleed, section-based. Each section occupies full viewport width. Horizontal padding scales via `clamp(24px, 6vw, 80px)` — no fixed max-width container.

**Hero:** CSS Grid two-column split (1fr 1fr) at desktop — left column for typography, right column for the static photographer profile photo (`/kylepayawalprofile.webp`) at full height, `object-fit: cover`, edge-to-edge. On mobile, photo stacks above the text column at 40svh.

**Category Cards:** CSS Grid `auto-fill, minmax(240px, 1fr)` — flows from 1 column (mobile) to 5–6 columns (wide desktop). Each card: 3:4 aspect ratio (portrait orientation).

**Stats Strip:** CSS Grid `auto-fit, minmax(160px, 1fr)` — horizontal at all but narrowest viewports.

**Breakpoints:** 768px (mobile → tablet). No hard max-width containers. Fluid padding and sizes throughout via `clamp()`.

**Spacing Scale:** 4 / 8 / 16 / 32 / 64 / 120px. No arbitrary values. Section-level padding targets `clamp(64px, 8vw, 120px)`.

## Elevation & Depth

Flat at rest. No `box-shadow` on any static element. Hierarchy is communicated through tonal steps in the cream ramp (Pale Surface → Aged Cream → Linen Dim) and typographic weight contrast.

**The Flat-By-Default Rule.** If you reach for a box-shadow at rest, step the background color instead. Shadows appear only as interaction response, never as structural hierarchy.

### Shadow Vocabulary
- **Dark overlay** (CardNav, CTA section): `rgba(14,12,11,0.85)` scrim behind fullscreen card menus.
- **Category card gradient** (always-on): `linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.12) 55%, transparent 100%)` — directional depth layer for text legibility.
- **Navbar blur**: `backdrop-filter: blur(18px)` on scroll — functional elevation signal, not decorative.

## Shapes

Sharp everywhere. Border radius is `0px` throughout — buttons, cards, inputs, containers, images. This is an identity signal: rounding reads as friendly and consumer-product. This system is neither.

The film grain skin — SVG `<feTurbulence>` fractalNoise at ~3% opacity as `body::before`, `mix-blend-mode: multiply` — gives the cream background an analog, material quality. Do not remove it. Do not raise opacity above 5%.

**The Zero-Radius Rule.** No border radius anywhere. Not 2px, not `rounded-sm`. The sharp corner is the brand.

## Components

### Buttons

Quiet typographic objects. Their presence is felt through uppercase precision and letter-spacing, not size or color. The specular sheen on hover (mouse-tracked radial gradient via CSS custom props `--sx`, `--sy`) is the primary interaction reward.

- **Shape:** Sharp corners (0px radius)
- **Primary (Specular):** Near-Black Ink background, Antique White text, padding 14px × 36px, Label typography. On hover: `radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,0.13) 0%, transparent 55%)` sheen follows cursor.
- **Ghost:** Transparent background, 0.5px solid border (ink or off-white depending on section), same padding and typography.
- **Hover:** Specular sheen only — no scale, no color change on primary. Ghost border opacity increases.

### Cards / Category Cards

- **Shape:** Sharp corners (0px), no border at rest
- **Background:** Full-bleed portfolio photo — `object-fit: cover` within a 3:4 aspect-ratio container
- **Overlay:** Always-on directional gradient. On hover: photo scales 1.06 over 0.6s with spring ease `[0.16, 1, 0.3, 1]`.
- **Category Label:** Fraunces 700, Antique White, bottom-left. Lifts −6px on hover.
- **"View Work →":** Label typography, `opacity: 0` at rest, fades + slides in on hover.

### Navigation

- **Typography:** Outfit 400, 11px, 2.5px letter-spacing, uppercase
- **Desktop default:** `ink-muted` (45% opacity ink)
- **Desktop hover / active:** Full ink; `motion.div layoutId="nav-active"` underline slides between links
- **Mobile / Menu:** "Menu" text button opens CardNav fullscreen overlay
- **Scroll:** Transparent → `rgba(237,232,220,0.88)` + `blur(18px)` past 20px scroll

### CardNav (Signature)

Fullscreen dark overlay triggered by the Menu button. Cards animate in staggered (x: 60 → 0, opacity 0 → 1, 50ms per card). Each card uses `gray-dark` (`#1C1A18`) background. Locks `document.body.style.overflow`; closes on route change.

### LineSidebar (Signature)

Fixed right-edge scroll progress indicator on content-heavy pages. Connector lines fill as sections are passed; active dot scales to 1.7×. Appears after 80px scroll. Used on: Home, Work, Client Gallery.

## Do's and Don'ts

### Do:
- **Do** use Label typography (Outfit 400, 11px / 2.5px / uppercase) for all interactive chrome — buttons, nav, eyebrows, form labels.
- **Do** pair Fraunces upright 900 with Fraunces italic 300 in headlines — the weight contrast is the editorial move.
- **Do** use `font-variation-settings: 'opsz' 144` on any Fraunces text above 60px.
- **Do** apply the film grain skin to every page — it is the material signature.
- **Do** step through the cream ramp for section alternation (Pale Surface → Aged Cream → Linen Dim).
- **Do** use `clamp()` for all font sizes and padding — the system is entirely fluid.

### Don't:
- **Don't** add border radius anywhere. Zero radius is the brand.
- **Don't** introduce an accent color. Ink on cream is the entire palette on light surfaces.
- **Don't** use spinners for loading states — cream/linen toned skeletons only.
- **Don't** let Fraunces italic stand alone as the primary typographic voice on any section.
- **Don't** use `box-shadow` at rest on any element — depth is earned through tonal steps or interaction transforms.
- **Don't** hardcode colors as Tailwind utilities (`bg-white`, `text-gray-900`) — always use CSS custom properties (`var(--bg)`, `var(--ink)`).
