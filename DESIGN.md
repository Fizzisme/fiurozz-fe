---
name: Fiurozz
description: Two deliberate worlds — a warm, instrument-lit SaaS for builders, and an ivory-paper atelier for the Catronaut landing page.
colors:
  signal-orange: "#ffa951"
  ember-red: "#bb2233"
  bone-white: "#fcfcfb"
  ink-black: "oklch(0.145 0 0)"
  card-white: "oklch(1 0 0)"
  card-graphite: "oklch(0.205 0 0)"
  quiet-grey: "oklch(0.556 0 0)"
  hairline-grey: "oklch(0.922 0 0)"
  greige-edge: "#d8d2ca"
  greige-wash: "#f5f2ed"
  toast-badge: "#f5eee6"
  alarm-red: "oklch(0.577 0.245 27.325)"
  atelier-paper: "#F2ECDF"
  atelier-paper-lift: "#F8F3E8"
  atelier-paper-2: "#E9E1D0"
  atelier-paper-3: "#DED3BE"
  atelier-ink: "#2B3A4A"
  atelier-ink-soft: "#4E5E6C"
  atelier-desk: "#454D3D"
  atelier-terracotta: "#BE6247"
  atelier-terracotta-ink: "#8E3D28"
  atelier-ochre: "#C98F52"
  atelier-sage: "#8B9C86"
  atelier-blue: "#93A9B8"
typography:
  display:
    fontFamily: "Lexend Deca, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.055em"
  title:
    fontFamily: "Lexend Deca, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Lexend Deca, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lexend Deca, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.18em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.18em"
  atelier-display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 6.2vw, 5.6rem)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.022em"
    fontFeature: "oldstyle-nums"
  atelier-h2:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(2.1rem, 4.1vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  atelier-h3:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(1.35rem, 1.9vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  atelier-lede:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(1.06rem, 1.3vw, 1.28rem)"
    fontWeight: 400
    lineHeight: 1.66
  atelier-body:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(1rem, 1.05vw, 1.1rem)"
    fontWeight: 400
    lineHeight: 1.62
    fontFeature: "oldstyle-nums"
  atelier-micro:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "clamp(0.69rem, 0.78vw, 0.79rem)"
    fontWeight: 400
    letterSpacing: "0.1em"
  atelier-control:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(0.82rem, 0.95vw, 0.95rem)"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  atelier-plate: "1px"
spacing:
  card: "16px"
  field-gap: "8px"
  group-gap: "16px"
  section-gap: "24px"
  atelier-gutter: "clamp(1.5rem, 5vw, 6rem)"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.bone-white}"
    textColor: "#292929"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.greige-wash}"
  input-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "4px 12px"
    height: "36px"
  card-surface:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "16px"
  icon-badge:
    backgroundColor: "{colors.toast-badge}"
    textColor: "#4b4540"
    rounded: "{rounded.lg}"
    size: "40px"
  chip-stack:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-grey}"
    rounded: "{rounded.lg}"
    padding: "4px 8px"
    typography: "{typography.mono}"
  card-artifact:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "24px"
  atelier-plate:
    backgroundColor: "{colors.atelier-ink}"
    textColor: "{colors.atelier-paper}"
    typography: "{typography.atelier-control}"
    rounded: "{rounded.atelier-plate}"
    padding: "0.82em 1.5em 0.86em"
  atelier-plate-ink:
    backgroundColor: "#9C4C34"
    textColor: "{colors.atelier-paper}"
    rounded: "{rounded.atelier-plate}"
  atelier-plate-large:
    backgroundColor: "{colors.atelier-paper}"
    textColor: "{colors.atelier-ink}"
    rounded: "{rounded.atelier-plate}"
    padding: "1.05em 2.2em 1.1em"
---

# Design System: Fiurozz

## Overview

**Creative North Star: "The Warm Mission Control"**

Fiurozz runs on instruments — a live agent chip, a code readout that types itself, ranked projects, a scene counter down the side of the page — but none of it is lit like an enterprise console. The ground is bone white, the accent is the orange of a desk lamp at midnight, the mascot is a cat in a space helmet, and the hero photograph is somebody's actual desk with a bowl of snacks on it. That is the whole idea: the precision of mission control, kept at the temperature of the room where the work really happens. Cold blue dashboards, grey-on-grey admin chrome and stock-photo professionalism are the anti-reference; so is the opposite failure, decoration with nothing running underneath.

The system is deliberately restrained: neutrals carry the surface, and the accent appears on primary actions, live indicators and one or two emphasized words per page. Density is moderate — generous around headings, tight inside field groups. Corners are small (10px), borders are hairlines, and shadows are wide and soft rather than dark. Both themes are first-class, and the accent is the one thing that genuinely changes between them: warm orange in the light, deep ember red in the dark.

**The `/design` route is a different world on purpose.** Catronaut's landing page is set on ivory laid paper in EB Garamond, with terracotta italics, hairline rules, oldstyle numerals, a watercolour plate of a Dutch polder and a wheel-capped smooth scroll. Its North Star is **"The Dutch Artist Atelier"** — a nineteenth-century painter's studio and its plate book, not a product page. Its tokens are namespaced `ctr-*` and its fonts are loaded on that route only, so the separation is enforced by the code, not by good intentions. The two worlds never blend; see Do's and Don'ts.

**Key Characteristics:**
- Bone-white ground, near-black type, one warm accent — never a second accent hue.
- The accent flips family across themes: `#ffa951` orange in light, `#bb2233` ember in dark.
- Small radii (10px), hairline borders, wide-soft shadows; nothing hard-edged or heavy.
- Authored brand assets over generic UI furniture: the Catronaut pixel mascot, the painted plate, the real desk photograph.
- One easing curve, `cubic-bezier(0.16, 1, 0.3, 1)`, governs motion in both worlds.
- `/design` is a sealed second world: `ctr-*` tokens, three route-scoped fonts, ivory paper.

## Colors

Two palettes, each internally restrained: a warm neutral field with a single shifting accent for the application, and a pigment set drawn from paper, ink and earth for the atelier.

### Primary
- **Signal Orange** (`#ffa951`): the application's accent in light mode. Primary buttons, the emphasized word in the hero headline, the eyebrow label, active indicators. It is the only saturated colour on a light screen and should stay that way.
- **Ember Red** (`#bb2233`): the accent in dark mode. Not a darkened orange — a different pigment that holds its weight against a near-black ground, where orange would glow and cheapen. The same class names produce both; never hard-code either.

### Secondary
- **Atelier Terracotta** (`#BE6247`): `/design` only. The italic emphasis in the hero headline, the short rule under a section intro, tinted swatches inside the drawn figures.
- **Atelier Terracotta Ink** (`#8E3D28`): `/design` only, for numerals and small type where terracotta at text size would read too light.
- **Atelier Ochre** (`#C98F52`): `/design` selection highlight, and a warm accent inside plates.

### Tertiary
- **Atelier Sage** (`#8B9C86`) and **Atelier Blue** (`#93A9B8`): muted swatch pigments inside the atelier's line drawings. Never for text or controls.
- **Atelier Desk** (`#454D3D`) / **Desk Lift** (`#515A48`): the dark olive of the drawing table, for inverted panels on `/design`.

### Neutral
- **Bone White** (`#fcfcfb`): the application's page ground in light mode. Warmer than white; the difference from a card's pure white is the whole depth model.
- **Ink Black** (`oklch(0.145 0 0)`): body and heading text in light mode, and the page ground in dark mode.
- **Card White** (`oklch(1 0 0)`) / **Card Graphite** (`oklch(0.205 0 0)`): raised surfaces, light and dark.
- **Quiet Grey** (`oklch(0.556 0 0)` light, `oklch(0.708 0 0)` dark): secondary and helper text.
- **Hairline Grey** (`oklch(0.922 0 0)` light, `oklch(1 0 0 / 10%)` dark): borders and dividers.
- **Greige Edge** (`#d8d2ca`) and **Greige Wash** (`#f5f2ed`): the warm border and hover fill of outline buttons — the detail that keeps the neutral field from turning cold grey.
- **Toast Badge** (`#f5eee6`): the warm square behind feature and section icons.
- **Atelier Paper** (`#F2ECDF`, with lifts at `#F8F3E8`, `#E9E1D0`, `#DED3BE`): the four grades of ivory stock the atelier is printed on; scene backgrounds alternate between them.
- **Atelier Ink** (`#2B3A4A`) and **Ink Soft** (`#4E5E6C`): the atelier's blue-black writing ink, at full and reading strength. Its transparencies `rgba(43,58,74,0.28)` and `rgba(43,58,74,0.16)` draw every frame and rule on that page.
- **Alarm Red** (`oklch(0.577 0.245 27.325)`): validation errors only.

### Named Rules
**The Two-Pigment Rule.** One accent per world, and never both worlds' accents on one screen. If a surface seems to need a second accent colour, it needs a hierarchy fix instead.

**The Warm Neutral Rule.** Neutrals in this system are warm. When a grey is needed for a border, hover or badge, take it from the greige family (`#d8d2ca`, `#f5f2ed`, `#f5eee6`), never from a blue-grey or a pure `#ccc`.

**The Theme-Shift Rule.** The accent is `var(--primary)`, and it is a different hue per theme by design. Writing `#ffa951` literally into a component breaks dark mode silently.

## Typography

**Display / Body Font (application):** Lexend Deca (with `system-ui, sans-serif`), loaded globally at weights 200, 300, 400, 500, 600, 700.
**Label / Mono Font (application):** Geist Mono, loaded as a variable font and bound to the `--font-mono` token.
**Display Font (`/design`):** EB Garamond, roman and italic, weights 400–600.
**Control Font (`/design`):** Archivo, weights 400–600.
**Label / Mono Font (`/design`):** Courier Prime, weights 400 and 700.

**Character:** the application speaks in one geometric humanist sans, tightly tracked at display size and plain everywhere else — a single voice doing headings, labels, buttons and data, which is what a product interface wants. Geist Mono is its one second voice, and a narrow one: tracked micro-labels and anything that is literally code or a filename. The atelier speaks in three: a Garamond that sets long-form thinking with oldstyle numerals, a tracked Archivo for anything you press, and Courier Prime for the plate numbers and marginalia. The pairing is a printed book, not a web page.

### Hierarchy — application
- **Display** (600, `2.5rem → 4.25rem` across breakpoints, line-height 0.98, tracking `-0.055em`): the home hero headline only. The tight tracking is the signature; it is what makes the type read as designed rather than defaulted.
- **Headline** (600, `1.5rem`, tracking `-0.02em`): page and panel titles — "Welcome back", "Create your account".
- **Title** (500–600, `1.125rem`): card titles, section headings.
- **Body** (400, `0.875rem`, line-height ~1.6): the working size of the entire product UI. Prose blocks stay under 65–75ch; form and data can run denser.
- **Label** (400, `0.75rem`): field labels and helper text, usually in Quiet Grey.
- **Eyebrow** (mono, 11px, `0.2em` tracking, accent, with a hairline and an `N° 0x` counter): a legacy pattern still running on home scenes 02–05. The hero dropped it — a page's opening does not need a label announcing itself — and it is not to be added to anything new. Documented because it is on screen, not because it is a model.
- **Mono** (Geist Mono, 400–700, `0.5625rem → 0.8125rem`, tracking `0.1em`–`0.2em`): section eyebrows ("SDCB · N° 01"), panel micro-labels ("PROMPT", "142 tokens"), filenames and code. Never body copy.

### Hierarchy — atelier (`/design`)
- **Display** (400 roman, `clamp(2.5rem, 6.2vw, 5.6rem)`, line-height 0.99, tracking `-0.022em`): scene titles, with the final clause set in terracotta italic.
- **Headline** (400, `clamp(2.1rem, 4.1vw, 3.6rem)`) and **Title** (400, `clamp(1.35rem, 1.9vw, 1.75rem)`): scene and tenet headings.
- **Lede** (400, `clamp(1.06rem, 1.3vw, 1.28rem)`, line-height 1.66, Ink Soft): the paragraph under a scene title, capped at 44ch.
- **Body** (400, `clamp(1rem, 1.05vw, 1.1rem)`, line-height 1.62): running text, capped at 58ch.
- **Micro** (Courier Prime, `clamp(0.69rem, 0.78vw, 0.79rem)`, uppercase, tracking `0.1em`, or `0.24em` when set vertically): plate captions, scene counters, margin coordinates.

### Named Rules
**The Loaded-Weight Rule.** Lexend Deca is loaded at 200/300/400/500/600/700 in `app/layout.tsx`. Those six are the whole palette: any other weight (`font-extrabold`, `font-black`) is synthesized by the browser and looks it. Add the weight to the loader rather than reaching for a fake one.

**The Oldstyle Rule.** On `/design`, numerals are oldstyle (`font-variant-numeric: oldstyle-nums`) everywhere except Courier Prime labels, where they are lining by nature. Never introduce tabular lining figures into that page's prose.

**The Narrow-Mono Rule.** `font-mono` is Geist Mono, and it earns its place only where the monospace means something: a tracked micro-label, a filename, a token count, real code. Monospace as a costume for "technical" is not a use — the sans already carries the product's voice.

## Layout

The application is a fixed-header layout: the header is `position: fixed`, 56px tall on mobile and 82px from `md` up, and it auto-hides after 1.2s of scroll idle. **Every page must reserve that height itself** — the home sections pad `pt-14 md:pt-[82px]`, the auth pages `pt-20 md:pt-28`. A page that starts at `p-8` slides under the header.

Content sits in a centred column: `max-w-6xl` for page shells, `max-w-4xl` for a focused single-task card such as sign-in. Horizontal padding is `px-4` to `px-6` on mobile, `px-6` to `px-8` from `md`. The spacing rhythm is Tailwind's 4px scale used at four steps: `gap-2` inside a labelled field, `gap-4` between fields, `gap-6` between cards, `gap-8`+ between page regions — with more space above a heading than below it.

Responsive behaviour is structural, not fluid: type sizes step at breakpoints rather than clamping (the atelier is the exception), and layouts collapse column-by-column. The rule that matters in practice is that **two-column form rows start at one column**: `grid-cols-1 sm:grid-cols-2`, never a bare `grid-cols-2`, which crushes inputs on a phone. The projects grid is a container query (`projects-grid-container`, `@container projects-grid (min-width: 700px)`) that switches from a 2-up mobile cycle to a 3-up/2-up desktop cycle.

The home page is not a scrolling document: it is five full-viewport layers stacked with `position: absolute`, moved by wheel-driven index changes, each with its own inner scroll. New home sections join that stack; they do not append to a page flow.

### Named Rules
**The Standing-Room Rule.** A full-height scene centres against the room the visitor actually has, not against the document. The header is `position: fixed`, so a scene reserves its band (`pt-14 md:pt-[82px]`), then makes its content area `flex-1` and centres inside that. `min-h-screen` with top padding and no centring drops everything against the header and leaves the dead space at the bottom, which reads as a page that failed to load rather than a composition.

**The Horizon Rule.** Decorative artwork is ground, and ground sits under the page rather than behind the words. The home hero's planet is anchored past two edges at once (`-bottom-20 -left-24`) so only an arc reads, clear of the text column; copy is never asked to survive on top of it. An image that lands inside a column of type is either content — given a box, a caption and a job — or it moves.

`/design` uses its own grammar: a `max-w-[1500px]` container, a `clamp(1.5rem, 5vw, 6rem)` gutter, an asymmetric `0.82fr / 1.38fr` split at the hero, sticky section intros beside scrolling lists, and a single-column fallback below 1000px where the pinned choreography is disabled entirely.

## Elevation & Depth

The application is **tonally layered first and shadowed second**. Depth comes from the difference between the bone-white page and a pure-white card, plus a hairline ring — `ring-1 ring-foreground/10` is the house card edge. Shadows are wide, soft and far more transparent than they look in the value: they describe a card lifted a few centimetres off a desk under diffuse light, never a hard drop.

`/design` is the opposite model: it is printed matter. Depth is the paper's own grain (a fixed SVG turbulence overlay at 22% opacity, `mix-blend-multiply`), the hairline frame around a plate, and one long soft shadow under it. Nothing on that page floats; things rest.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 30px 80px -30px rgba(0,0,0,0.25)`): the auth card and other focused single-task surfaces.
- **Panel lift** (`box-shadow: 0 20px 60px rgba(30,25,20,0.06)`, dark `rgba(0,0,0,0.3)`): the home page's code-editor panel.
- **Control lift** (`shadow-xs`): buttons and inputs at rest.
- **Plate rest** (`box-shadow: 0 1px 0 rgba(43,58,74,0.22), 0 22px 40px -28px rgba(43,58,74,0.75)`): `/design` framed artwork — a contact shadow plus a long soft cast.
- **Plate press** (`inset 0 1px 0 rgba(242,236,223,0.16), 0 8px 20px -14px rgba(43,58,74,0.85)`): the atelier button, whose inset top highlight is what makes it read as a struck metal plate.

### Named Rules
**The Diffuse-Light Rule.** Every shadow carries a downward offset and a blur radius several times that offset. A zero-offset coloured halo is not depth in this system, and a hard offset shadow (`4px 4px 0`) belongs to a neobrutalist world this project is not.

## Shapes

The application's form language is **quietly rounded**: one radius token, `--radius: 0.625rem` (10px), with a scale derived from it (`sm` 6px, `md` 8px, `lg` 10px, `xl` 14px). The bare `rounded` utility resolves to the 10px step and is what almost everything uses — buttons, inputs, cards, badges, avatarless tiles. Pills and fully-round shapes are reserved for genuinely circular things: status dots, the theme toggle, the floating bubble.

Borders are always hairlines (1px). Cards prefer a `ring-1` over a `border` so the edge does not affect layout. Dividers are 1px rules in Hairline Grey, and the home page uses bare `h-px` spans in the same role.

`/design` has effectively **no radius**: the Plate control is `rounded-[1px]`, frames and rules are square. That squareness is load-bearing — it is what makes the page read as printed rather than rendered.

### Named Rules
**The One-Radius Rule.** Use `rounded` (10px). Reach for another step only when the element is genuinely smaller or larger than a control, and never introduce `rounded-full` on a rectangle. The toast banner (16px) is the one deliberate exception: it quotes a system notification, not a control (see The Banner Exception).

## Components

### Buttons
Two implementations exist, and they are not interchangeable:
- `components/animate-ui/components/buttons/button.tsx` — the **product** button. It is what the home page and the auth pages use, and what new feature work should use.
- `components/ui/global/button.tsx` — a shadcn-generation button retained for the header and older surfaces. Do not mix the two in one view.

- **Shape:** 10px radius (`rounded`), 36px tall at default size, `8px 16px` padding.
- **Primary:** Signal Orange fill with near-white text, `shadow-xs`, hover at 90% opacity. Reserved for the single most important action on a surface.
- **Outline:** bone-white fill, warm greige border (`#d8d2ca`), `#292929` text, hover fill `#f5f2ed`; in dark mode a translucent input-tinted fill with the border token. This is the workhorse — both auth forms submit through it, deliberately, so sign-in and registration read as one family rather than competing for the accent.
- **Ghost:** no fill until hover. Header icons and toolbars.
- **States:** focus shows a 3px `ring-ring/50` ring; disabled drops to 50% opacity and removes pointer events; loading is expressed by disabling the control and swapping the label, never by a spinner replacing the text. Forms that submit to the API — log in, register, create project — go one step further: the button only disables and keeps its label ("Log in" stays "Log in"), and the loading state is a toast that resolves in place into the outcome (see Toast).

### Cards / Containers
- **Corner Style:** 10px (`rounded`).
- **Background:** `bg-card` — pure white on light, graphite on dark.
- **Border:** `ring-1 ring-foreground/10`, a hairline that does not shift layout.
- **Shadow Strategy:** flat by default; only focused single-task surfaces take Card lift (see Elevation).
- **Internal Padding:** driven by `--card-spacing` (16px default, 12px at `size="sm"`), applied by `CardHeader` / `CardContent` / `CardFooter` rather than by hand.

### Chips
- **Style:** a hairline outline pill, not a filled tag — `1px` border in `foreground/10`, 10px radius, `4px 8px` padding, 11px label **in Geist Mono**, Quiet Grey. The mono is the point: it marks the content as machine fact (a dependency, a version) rather than prose.
- **Use:** read-only metadata that belongs to an object, above all a project's stack ("Next.js", "TypeScript"). They sit in a wrapped row with `8px` gaps, and a run longer than three collapses into a muted `+N` in the same mono.
- **State:** none. These are labels, not filters. A chip that can be selected needs the accent and a real pressed state, and none exists yet — build it deliberately rather than tinting this one.

### Inputs / Fields
- **Style:** 36px tall, 10px radius, hairline border, transparent-to-white fill (`dark:bg-input/30`), 14px text from `md` up.
- **Focus:** border shifts to the ring colour plus a 3px `ring-ring/50` halo — the same focus language as buttons.
- **Error:** `aria-invalid` drives a destructive border and ring; the message renders beneath the field in 12px Alarm Red, naming the problem ("Password must be at least 8 characters"), not just flagging it.
- **Composition:** every field is `Label` + control + optional error inside a `space-y-2` group; groups are separated by `space-y-4`. Labels may carry a 14px lucide icon before the text.
- **Selection:** input text selection is themed `#29588f` on white — one of several browser surfaces this system themes rather than leaving to the platform.

### Navigation
- Fixed header, hairline bottom border, bone-white fill, 56/82px tall, springing out of view after 1.2s of scroll idle and returning on any scroll or hover.
- The logo sits left; search, GitHub count, account and theme toggle sit right as 25px ghost icon buttons separated by vertical rules, each with a tooltip.
- The home page carries a vertical section-nav rail on the right edge; `/design` carries its own rail with a serif wordmark and an `01 / 05` scene counter.

### Toast
The app's one notification surface: `components/ui/global/sonner.tsx`, styled in `app/globals.css` under "Toast", and mounted once in the root layout. It is sonner running `unstyled` — the library keeps positioning, stacking and swipe-to-dismiss, and every visual is ours. It deliberately quotes an iPhone notification banner.

- **Placement:** top-center, 96px down on desktop and 64px on mobile so it clears the fixed header; bottom-right belongs to MessageDock. `372px` wide from 601px up, full width minus 10px gutters below that.
- **Material:** frosted. The page ground at 76% (`--background`, `--card` in dark) under `blur(24px) saturate(180%)`, a 0.5px hairline edge and a 0.5px top highlight, over a soft shadow with a downward offset. Where `backdrop-filter` is unsupported the ground turns solid, so the text never sits on bare page.
- **Shape:** 16px radius, 64px minimum height.
- **Anatomy:** a 52px icon slot on the left, where Catronaut acts the outcome out. On the right a header row, **Fiurozz** at 14px semibold with a muted *now* at its end, above the message at 14px regular. The header and *now* are CSS generated content; *now* carries an empty alt so screen readers skip it.
- **Status:** every type is told by Catronaut, never by a coloured badge: pixel canvases in `components/ui/catronaut/` (`loading`, `success`, `error`, `warning`, `info`, sharing `toast-sprites.ts`), traced from the team's design sheets and drawn at `scale={1}` so one art pixel is one CSS pixel. Loading spins an orbit around the helmet, its back half passing behind it. Success wears `^ ^` eyes under a heart bubble that drifts up while sparkles twinkle. Error wears `x x` eyes and a sad bubble, and jolts every few seconds as the zap marks beside him flash. Warning is wide-eyed with a glint on the visor, under a warning-sign bubble that hops twice every couple of seconds. Info has curious arch eyes and an "i" bubble that floats gently among four twinkling stars. The banner itself stays neutral; the mascot's orange is the only colour in it.
- **Motion:** enters sliding down while scaling from 0.96, 560ms on the house curve. Stacked banners collapse to their shells. There is no close button: swipe up, as on iOS, or let it time out. Reduced motion keeps only the fade.
- **Use:** request outcomes in client components. Call `toast.loading()` when the request starts, then `toast.success()` or `toast.error()` with the same `id`, so one banner resolves in place rather than stacking a second. Field-level validation still renders beneath its field; the toast carries the request's outcome, not a list of field errors. Never `alert()`.

**The Banner Exception.** Frosted material and a 16px radius are sanctioned for the toast and for nothing else. It reads as a system notification precisely because no other surface in the app looks like one — a second frosted panel would spend that signal.

### Signature component — the project artifact
One project rendered as the page it would really get, not an illustration of one. Introduced on the home hero, and now the card every project listing uses (`components/ui/project/project-card.tsx`) — one anatomy, two instances. Three bands, separated by hairlines and read top to bottom:

1. **Cover** — full bleed and the tallest band on the card, sized by context: a fixed `188px`/`216px` on the hero's single showcase card, or `aspect-video` on a grid card so it scales with the masonry's own flex-basis span rather than letterboxing a wide card or starving a narrow one. `object-cover`, cropped from the top so a page's header (or a listing's subject) survives rather than the empty middle, with a `bg-primary/10` field behind it as the load-in colour. It scales to `1.03`–`1.05` on card hover, on the house ease. A **Featured** flag, when true, sits top-left on the cover as a solid `bg-primary` pill in sans (not mono — it is an editorial claim, not a data fact; see The Narrow-Mono Rule). The cover is the card's weight; it is never a small mark floating in an empty tint, and never a synthesized mockup where a real capture exists.
2. **Meta** — the name at 16–24px semibold on the left with a lowercase mono descriptor right-aligned on the same baseline (the hero's `developer showcase`; a grid card's own subcategory, e.g. `Online Store`), a one-to-two-line summary beneath it, then the stack as mono chips. Chips past the third collapse into a muted `+N` rather than wrapping to a second row.
3. **Footer** — who made it, on the left, and the `ArrowUpRight` on the right. The hero's single card has no per-item author photo, so it marks the slot with a small accent diamond (a `6px` square turned 45°, not a glyph) beside the mono handle; a grid card has a real author per project, so its diamond is replaced by their avatar (`size-5`, circular, ring-1) — same slot, same job, the marker upgraded to the photo once the data exists.

**The Narrow-Mono Rule, applied here.** Mono marks a fact: a descriptor, a dependency, a handle, a `+N` count. It never marks a claim. That is the line between the meta row's mono descriptor and the cover's sans "Featured" pill.

It rests on Card lift and deepens to `0 28px 70px -30px` on hover while the arrow nudges up and right; the whole card is one focusable link with the standard 3px ring.

The rule it exists to enforce: **the hero shows the product, and the product is a project page.** The sample it carries is Fiurozz's own project — real tagline, real stack, real handle — so the most prominent thing on the home page invents nothing. If it is ever swapped for another project, that project has to be real too, or the caption under it has to say plainly that it is an example.

### Signature component — the Plate (`/design` only)
The atelier's call-to-action, ported from the original static page. Square (`1px` radius), Archivo uppercase at `0.14em` tracking, ink fill with paper text, an inset top highlight and a long soft shadow. It carries a hand-drawn nib icon that lifts and rotates `-6°` on hover while the plate itself rises 2px over 500ms on the house easing curve. Three variants: `default` (ink), `ink` (terracotta `#9C4C34`), and `large` (paper on a dark ground, `0.2em` tracking).

### Signature component — Catronaut
The mascot ships as pixel-grid canvas components (`idle`, `happy`, `coding`, and the toast set `loading`, `success`, `error`, `warning`, `info`) rendered at `scale` — `0.3` inside a 40px icon badge, larger when it is the subject. It is the brand's face: it appears in the home feature list, in the register card's title badge, and as the painter inside the `/design` hero plate. It is never replaced by a generic user or sparkle icon.

**The Sticker Rim.** Every Catronaut keeps one palette in both themes — warm inks `#0a0a09`–`#2e2f30`, helmet whites `#e8e5e0`/`#fbfaf8`, and orange `#f57626` for inner ears, badges and bubbles. The dark theme never inverts the character; it adds a 1px greige rim (`#d8d2ca`, the Greige Edge) around the silhouette so the black suit stays separate from a near-black page. Both versions are pre-rendered once by `components/ui/catronaut/sprite-canvas.ts` and picked per frame, so a theme switch applies immediately. Every Catronaut also honours `prefers-reduced-motion` by drawing a single still frame. Sprites traced from a source image must not keep its transparency checkerboard: clear it before shipping (`happy` once carried one that only showed on dark).

### Signature component — the atelier workspace
`/design/[projectId]` (`views/Workspace.tsx`) is where "Start designing" lands — a file tree, tabs, a code pane and a chat, in the same ivory-and-ink world as the landing page rather than the application's own chrome. It is the atelier's one Operate-mode surface: the world stays fixed, but the grammar bends to a working tool — mono for anything that is a filename or code, hairline-bordered `1px`-radius panels instead of the landing page's plates, and a calmer, UI-scale motion register (`duration-300`, still the house ease) in place of the page's staged reveals.

**The code pane is ink at four weights, not a borrowed editor theme.** `ctr-terracotta`, `ctr-ochre` and `ctr-sage` read beautifully as swatches but fail 4.5:1 at code size on `ctr-paper-lift`; the four hues that clear it — `ctr-ink` (plain text, 10.5:1), `ctr-ink-soft` (comments, functions, 6.0:1), `ctr-terracotta-ink` (strings, 6.7:1) and `ctr-desk` (keywords, 8.0:1) — are the whole syntax palette. Measure before picking a code-highlight colour from the swatch tier; it is tuned for small decorative fills, not for paragraphs of 13px text.

**The workspace is fixed-light for the same reason `/design` is.** It sets `document.body.style.backgroundColor` on mount exactly as `Design.tsx` does, and loads its own copies of the three atelier fonts (`next/font/google` calls are idempotent on an identical config, so this costs nothing extra) — the site's dark-mode toggle never reaches either surface.

**`Files`' own highlight pill is hover-only** (`FilesHighlight` defaults to `hover: true`), so it never marks which file is actually open in the editor — that has to be computed from `activeFile` and applied as a real class per row, the way the tab bar already does, not assumed to come free from the primitive. The file tree's own header links back to `/design`, not `/home`: this surface is reached only from the atelier, so its way out returns there rather than dropping the visitor into an unrelated part of the site.

**A third trap, this time in `Files`.** `FileItem`'s `className` prop (and its `{...props}` spread, `aria-current` included) reaches `FileLabelPrimitive` — the text span — not the row. A background or `aria-current` meant to mark the whole item ends up sized to the label instead, which reads as "only the word is selected" next to a hover state that correctly fills the row. `FileItem` now takes `active`/`activeClassName` (default `bg-accent`, so any other consumer's behaviour is unchanged) applied to the row itself, and forwards `aria-current` there too; the file tree passes its own atelier fill through `activeClassName` rather than through `className`.

**Two more traps `Sidebar` hides, both worth knowing before recolouring it again.** `Sidebar`'s own `className` prop lands on the fixed outer `sidebar-container` box; its child `sidebar-inner` then paints its own opaque `bg-sidebar` over that entire area regardless, so a colour passed to `<Sidebar className>` is never actually visible — the file tree's real fill is a plain div wrapped around its own children instead. And the Fiurozz mark (`components/icons/logo.tsx`) sets `text-black dark:text-white dark:opacity-60` on itself and reads `currentColor` locally, so a colour applied to its *wrapping* element never reaches it — the override has to land on the icon's own `className` (`text-ctr-ink dark:text-ctr-ink dark:opacity-100`), the one time this file intentionally fights a `dark:` class rather than just not using one.

### Motion
One curve carries the whole product: `cubic-bezier(0.16, 1, 0.3, 1)`, an exponential ease-out, exposed on `/design` as `--ease-ctr` and written literally in the application's Framer Motion transitions. Entrances animate opacity, a small `y` offset and a blur, 0.4–0.9s, staggered ~0.18s for headline lines. Interface transitions stay at 150–250ms.

**Entrances are orchestrated, not hand-timed.** A region enters as one variant tree — a container holding `staggerChildren` and `delayChildren`, children sharing a single `piece` variant — rather than as a set of siblings each carrying its own `delay`. The home hero runs two: the copy column at `0.12s` steps after a `0.3s` lead, and the project artifact assembling itself in reading order at `0.09s` steps after `0.35s`, so cover, name, author, stack and README arrive the way a published page fills in. Any orchestrating container must pass `useReducedMotion()` into its `initial` so a reduced-motion visitor starts at the resting state.

**The variant-label trap.** A wrapper that animates to a variant *label* hands that label to every motion descendant, and a child animating to a plain object is stranded at its initial values — invisible, with no error. Inside such a wrapper, give the nested tree its own variant names and an explicit `animate`, which stops the inheritance at that node. This is why the hero's inner trees use `rest`/`enter` and `hidden`/`shown` rather than reusing the wrapper's `initial`/`leaving`. The home page's full-screen section changes are the one exception, running 0.9s on `cubic-bezier(0.76, 0, 0.24, 1)` because they move a whole viewport.

`/design` runs a different engine: Lenis smooth scroll stepped by the GSAP ticker (one clock for scroll and ScrollTrigger), a 700px cap on how far the page may lag the wheel, pinned scenes, and reveals gated on scroll progress. All of it is disabled below 1000px and under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep the two worlds sealed. `ctr-*` tokens, EB Garamond, Archivo and Courier Prime belong to `/design` and nowhere else; the application's tokens and Lexend Deca never appear on `/design`.
- **Do** reach for `var(--primary)` (`bg-primary`, `text-primary`) so the accent flips from Signal Orange to Ember Red with the theme.
- **Do** reserve the accent for primary actions, live state and at most one emphasized word per view. Everything else is neutral.
- **Do** reserve the header's height on every new page (`pt-14 md:pt-[82px]`, or `pt-20 md:pt-28` on centred single-card pages).
- **Do** start multi-column form rows at one column (`grid-cols-1 sm:grid-cols-2`).
- **Do** wrap fields in a real `<form>` with `onSubmit`, `id`/`htmlFor` pairs, `autoComplete`, and `aria-invalid` on failed fields — Enter must submit.
- **Do** ship every interactive state: hover, focus ring, disabled, loading (label swap; for API-backed forms, a disabled button plus a resolving toast), error, empty.
- **Do** use the authored assets — the Catronaut components, the painted plate, the desk photograph — where a generic icon or stock image would otherwise land.
- **Do** honour `prefers-reduced-motion`, as `/design` already does, before adding any scroll-driven or pinned animation.
- **Do** theme the browser's own surfaces: selection colour, focus ring, scrollbar (`thin-scrollbar` / `no-scrollbar`), caret.
- **Do** give a shared primitive with more than one consumer an override prop for its world-specific colours (see `Files`' `highlightClassName`) rather than editing its default — the default is the other consumers' contract.
- **Do** pick code-syntax and other small-text colours by measured contrast against their real background, not by which swatch looks closest in the palette list.

### Don't:
- **Don't** blend the worlds — no ivory paper, Garamond or terracotta inside the application, and no orange accent, 10px radius or Lexend Deca inside `/design`.
- **Don't** reintroduce the disconnected space theme. The star field, nebula blobs, Saturn and satellite art were removed from the auth pages on purpose; the celestial motif lives in the Catronaut mascot and the home page's planet, not in a decorative background layer.
- **Don't** use gradient text, or glass and backdrop blur as decoration. Emphasis comes from weight, size and colour; blur is for a specific effect, not atmosphere. The toast banner's frosted material is that specific effect, and the only one (see The Banner Exception).
- **Don't** substitute emoji or unicode glyphs for icons. Icons come from `lucide-react` or authored SVG at a consistent stroke weight.
- **Don't** hard-code `#ffa951` or `#bb2233`; that silently breaks the other theme.
- **Don't** reach for a Lexend Deca weight outside the loaded 200/300/400/500/600/700, or use `font-mono` as a "technical" flavour on ordinary text.
- **Don't** nest a card inside a card, or use a grid of identical icon-heading-text tiles as a page's whole structure.
- **Don't** put an eyebrow label above a new heading, or give a section an `N° 0x` counter. Scenes 02–05 carry the old pattern; nothing new joins them.
- **Don't** hand-time an entrance with per-element `delay` values, or let a decorative image land inside a column of type (see The Horizon Rule).
- **Don't** add a `tailwind.config.js`. Tokens live in `app/globals.css` under `@theme inline`; a config file would split the source of truth.
- **Don't** nest GSAP pins on `/design`. Pinning writes a transform, the transform becomes a containing block, and the inner pin silently stops being fixed.
- **Don't** describe Catronaut as a working feature in any UI copy. It is a landing page; see PRODUCT.md.
