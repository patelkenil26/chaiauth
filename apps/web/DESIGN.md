---
name: ChaiAuth
description: Warm, tactile identity-provider UI. A cream "chai with milk" light theme and an obsidian-and-ember dark theme.
colors:
  masala-amber: "oklch(0.6 0.18 46)"
  masala-amber-dark: "oklch(0.725 0.163 48)"
  chai-soft: "oklch(0.74 0.14 66)"
  chai-bright: "oklch(0.68 0.17 54)"
  chai-mid: "oklch(0.62 0.19 45)"
  chai-rust: "oklch(0.52 0.17 38)"
  milk-cream: "oklch(0.975 0.012 80)"
  card-cream: "oklch(0.992 0.006 80)"
  raised-cream: "oklch(1 0.003 80)"
  sunken-cream: "oklch(0.955 0.014 78)"
  steeped-ink: "oklch(0.22 0.02 50)"
  soft-ink: "oklch(0.38 0.022 55)"
  muted-ink: "oklch(0.5 0.022 60)"
  cream-border: "oklch(0.89 0.018 75)"
  obsidian: "oklch(0.125 0.005 55)"
  obsidian-card: "oklch(0.165 0.006 55)"
  obsidian-raised: "oklch(0.2 0.007 55)"
  ember-text: "oklch(0.955 0.006 70)"
  verified-green: "oklch(0.55 0.13 152)"
  alert-red: "oklch(0.55 0.21 27)"
typography:
  display:
    fontFamily: "Sora, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Sora, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Sora, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.68rem"
    fontWeight: 600
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  md: "10px"
  button: "13.6px"
  lg: "14px"
  card: "18.4px"
  xl: "18px"
  pill: "9999px"
spacing:
  control-height: "44px"
  control-height-lg: "51px"
  container: "1152px"
  gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.chai-mid}"
    textColor: "{colors.raised-cream}"
    rounded: "{rounded.button}"
    height: "{spacing.control-height}"
    padding: "0 18px"
  button-ghost:
    backgroundColor: "{colors.sunken-cream}"
    textColor: "{colors.steeped-ink}"
    rounded: "{rounded.button}"
    height: "{spacing.control-height}"
    padding: "0 18px"
  input:
    backgroundColor: "{colors.sunken-cream}"
    textColor: "{colors.steeped-ink}"
    rounded: "{rounded.button}"
    height: "{spacing.control-height}"
    padding: "0 15px"
  card:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.steeped-ink}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: ChaiAuth

## Overview

**Creative North Star: "The Warm Ledger"**

ChaiAuth is a record-keeper that happens to be friendly. Every screen answers a question of trust (who is signing in, what is being approved, which session is live), and answers it in a warm voice. The system pairs precise structure (tabular numbers, mono labels, hairline borders, a strict control height) with the material warmth of cream paper, chai-brown ink and a single spiced accent.

Light mode is "chai with milk": a cream canvas with soft ambient amber light and a fine paper grain. Dark mode is "obsidian and ember": flat solid surfaces, hairline borders and one static ember glow from above. The accent is reserved for the main action, the active state and one key word.

The system rejects three looks: **cold enterprise security** (shield-and-lock imagery, navy/teal, compliance-badge walls), **generic SaaS gradients** (purple-blue washes, glassmorphism everywhere, stock illustration) and **hacker-terminal aesthetics** (neon on black).

**Key Characteristics:**
- Warm neutrals tinted toward amber; no pure white or pure black surfaces.
- One accent (Masala Amber), spent sparingly.
- Tactile controls that lift on hover and press down on click.
- Mono, uppercase micro-labels for technical facts (endpoints, status, counts).
- Two distinct theme personalities that share one structure.

## Colors

A warm, low-chroma neutral field with one saturated spiced-orange accent and a small set of status colors.

### Primary
- **Masala Amber** (oklch(0.6 0.18 46)): Light-theme primary. Focus rings, links, active icon glyphs, eyebrow text, selection tint.
- **Masala Amber, Ember** (oklch(0.725 0.163 48)): The same role in dark mode, lifted for contrast on obsidian.
- **Chai Gradient** (chai-soft → chai-bright → chai-mid → chai-rust, 105°): The signature fill. Only on the primary CTA, the active nav indicator, avatars and one key heading word. Stops: oklch(0.74 0.14 66), oklch(0.68 0.17 54), oklch(0.62 0.19 45), oklch(0.52 0.17 38).

### Neutral
- **Milk Cream** (oklch(0.975 0.012 80)): Page canvas, light.
- **Card Cream** (oklch(0.992 0.006 80)): Cards (level 1).
- **Raised Cream** (oklch(1 0.003 80)): Raised surfaces and focused inputs (level 2).
- **Sunken Cream** (oklch(0.955 0.014 78)): Input wells, code blocks, quiet sections.
- **Steeped Ink** (oklch(0.22 0.02 50)): Primary text. **Soft Ink** (oklch(0.38 0.022 55)) for lead paragraphs. **Muted Ink** (oklch(0.5 0.022 60)) for secondary text.
- **Cream Border** (oklch(0.89 0.018 75)): Hairlines and dividers.
- **Obsidian** (oklch(0.125 0.005 55)), **Obsidian Card** (oklch(0.165 0.006 55)), **Obsidian Raised** (oklch(0.2 0.007 55)): The dark canvas and its two surface levels. Borders are white at 8.5% (hairline) and 16% (strong).
- **Ember Text** (oklch(0.955 0.006 70)): Primary text on dark.

### Status
- **Verified Green** (oklch(0.55 0.13 152)): Success, live dot, "good" states. **Alert Red** (oklch(0.55 0.21 27)): Destructive actions and invalid fields. Toasts use paired tinted background, border and text colors for success, error, warning and info.

### Named Rules
**The One Voice Rule.** Masala Amber and the chai gradient are the only saturated colors on a screen. Status colors appear only when they carry status.

**The Tinted Neutral Rule.** Every neutral leans toward amber (hue 50–80). Never introduce a cold gray or pure #fff/#000 surface.

## Typography

**Display Font:** Sora (with sans-serif fallback), for headings and the avatar initial
**Body Font:** Manrope (with sans-serif fallback), for interface and reading text
**Label/Mono Font:** the system monospace stack, for endpoints, codes, status labels and eyebrows

**Character:** Sora is geometric and confident with slightly tight tracking; Manrope is open and friendly for dense interface text. The mono voice marks anything a developer might copy.

### Hierarchy
- **Display** (700, 2.25–3.75rem responsive, 1.08, -0.025em): Marketing hero only.
- **Headline** (600–700, 1.5–2.25rem, 1.2): Section and page titles. Balanced wrapping.
- **Title** (600, 1.125rem, 1.3): Card and feature titles.
- **Body** (400–500, 0.875–1rem, 1.625): Interface text and descriptions. Keep prose to about 65ch (hero copy uses a 36rem max).
- **Label** (600, 0.68–0.75rem, 0.14–0.18em tracking, uppercase, mono): Stat captions, eyebrows (dark mode), technical tags.

### Named Rules
**The Mono-For-Machines Rule.** Anything a developer might copy (endpoints, client IDs, codes, key prefixes) is mono. Everything else is Manrope or Sora.

**The Tabular Rule.** Numbers that line up or change (counts, codes, timers) use tabular figures.

## Layout

Content sits in a centered container (max 72rem, 1152px) with 20px side gutters that widen to 32px from the `sm` breakpoint. Marketing pages stack full-width sections with generous vertical rhythm; feature grids use a 6-column bento (4+2, 2+2+2) on large screens and collapse to a single column on small ones. The authenticated app uses a left sidebar with `ca-nav-link` items and a main column of cards, collapsing on mobile. Controls share one height (44px, 51px for large) so rows of buttons and inputs align.

## Elevation & Depth

Depth is a three-level stack: **page (L0) → card (L1) → raised (L2)**, plus a **sunken** well for inputs and code. The two themes express it differently.

- **Light** uses soft, warm-tinted shadows, a translucent card surface with backdrop blur, and a faint amber glow that appears on hover.
- **Dark** is deliberately flat: solid surfaces, 1px white-alpha hairlines, a top inner highlight, and no blur or colored glow. A single static ember light sits above the hero.

### Shadow Vocabulary
- **Card** (`inset 0 1px 0 foreground/7%, 0 1px 2px shadow/40%, 0 24px 60px -34px shadow`): L1 cards, light mode.
- **Raised** (`inset 0 1px 0 foreground/9%, 0 2px 4px shadow/45%, 0 32px 70px -28px shadow`): L2 surfaces.
- **Sunken** (`inset 0 2px 6px shadow/35%`): input wells and code areas.
- **CTA glow** (`0 12px 28px -14px chai-mid/75%`): the primary button, light mode only.

### Named Rules
**The Theme Personality Rule.** Light may glow; dark may not. Never add colored glow, blur or aurora motion to dark surfaces.

## Shapes

Soft, generous, and consistent: controls use a 0.85rem radius (about 14px), cards 1.15rem, large feature cards up to 24px, and pills and avatars are fully round. Borders are always 1px hairlines. Icon tiles are 44px rounded squares.

## Components

### Buttons
- **Shape:** 0.85rem radius, 44px tall (51px large), 600 weight, 0.9rem text.
- **Primary:** Chai gradient fill, near-white text, an inner top highlight and a soft amber drop shadow. A light sheen sweeps across on hover.
- **Hover / Focus / Active:** Lifts 2px on hover (1px in dark), presses to scale 0.97 on click. Focus shows a 2px Masala Amber outline offset 3px.
- **Ghost:** Translucent secondary fill, 1px border, amber-tinted border and accent fill on hover.

### Inputs / Fields
- **Style:** 44px tall, 0.85rem radius, sunken well fill, 1px border, inner top shadow.
- **Focus:** Border shifts to amber and a 4px (3px dark) amber ring appears; the field rises to the raised surface.
- **Error:** `aria-invalid` turns the border Alert Red with a soft red ring.

### Cards / Containers
- **Corner Style:** 1.15rem radius (`rounded-2xl` on feature cards).
- **Background:** Card Cream at 80% with blur in light; solid Obsidian Card in dark.
- **Border:** 1px hairline that warms toward amber on hover.
- **Internal Padding:** 24px.

### Navigation
- **Marketing:** top navbar with links and a primary CTA.
- **App:** sidebar `ca-nav-link` rows (42px tall, 0.8rem radius). The active row has an amber gradient wash and a 3px chai bar on its left edge. Hover nudges the row 2px right.

### Spotlight Card (signature)
A card whose border and surface react to the cursor: a radial amber sheen in light mode, a neutral white sheen and lit border in dark mode. Used on feature grids.

### Eyebrow
A small label above section titles. In light mode it is a tinted pill with an optional green live dot. In dark mode it becomes quiet uppercase mono text with no pill.

## Do's and Don'ts

### Do:
- **Do** keep every neutral tinted toward amber (hue 50–80) and use the Masala Amber accent on one primary action per screen.
- **Do** use the 44px control height for all buttons and inputs so rows align.
- **Do** write endpoints, IDs and codes in mono with tabular figures.
- **Do** give dark mode its own flat treatment: hairline borders, solid fills, no blur or glow.
- **Do** honor `prefers-reduced-motion`: stop aurora, float, marquee and animated gradient.

### Don't:
- **Don't** use cold enterprise-security imagery (shields, padlocks, navy and teal, compliance-badge walls).
- **Don't** use generic SaaS gradients, purple-blue washes or glassmorphism as decoration.
- **Don't** use hacker-terminal tropes: neon green on black, matrix rain.
- **Don't** spread the chai gradient beyond the CTA, the active nav indicator, avatars and one key heading word.
- **Don't** invent customers, logos, stats or compliance badges in the interface (see PRODUCT.md).
