@AGENTS.md

# Fiurozz — frontend

A platform where developers publish projects, discover other builders' work, and connect. This repo is the **frontend only**; a separate backend answers at `NEXT_PUBLIC_BE_URL`.

Read these before design or product work — they are the authority, this file is only the map:

- **`PRODUCT.md`** — who this is for, what actually ships vs. what is only planned, what must never be claimed.
- **`DESIGN.md`** (+ `.impeccable/design.json`) — the visual system: tokens, type, components, and the two-worlds boundary.

**The one product fact that trips everyone up:** Catronaut, the AI design agent, **does not exist**. `/design` is a landing page for it. The home page's code sample and "AI Agent is thinking…" chip are illustrative UI. Never write copy, docs, comments or a PR description implying Fiurozz can generate interfaces today.

## Stack

Next.js 16.2.10 (App Router, Turbopack) · React 19.2.4 · TypeScript · Tailwind CSS v4 · zustand · framer-motion + motion · GSAP + ScrollTrigger + Lenis (`/design` only) · zod · date-fns · echarts · shadcn-style + Base UI + Radix + a local `animate-ui` family.

```bash
npm run dev     # next dev  — see the dev-server rule below
npm run build
npm run lint    # eslint
npx tsc --noEmit -p .   # typecheck (no dedicated script)
```

## Layout of the repo

| Path | What lives there |
|---|---|
| `app/` | Routes only. A `page.tsx` fetches and delegates; it holds no UI. |
| `views/` | The page components (`Home`, `Login`, `Projects`, `Design`, `Profile`, `Workspace`…). This is where page UI actually lives. |
| `components/ui/global/` | Shared shadcn-style primitives: `button`, `input`, `card`, `select`, `header`, `logo`… |
| `components/animate-ui/` | The animated component family (its own `Button`, icons, tabs, code block). |
| `components/ui/home/`, `ui/design/`, `ui/catronaut/` | Section components per surface, plus the pixel-art mascot. |
| `services/` | API layer. `api-core` / `client` / `gateway-client` plus one service per domain. Every response is an `ApiEnvelope` (`success`, `message`, `data`). |
| `actions/` | Server actions. |
| `lib/` | `utils`, `constanst.ts` (sic), `store/user-store.ts`, token-refresh helpers. |
| `hooks/`, `mock-data/` | Shared hooks; development fixtures — **never present `mock-data/` as real activity**. |
| `proxy.ts` | Route protection and token refresh. In Next 16 this replaces `middleware.ts`. |

## Conventions and traps

**Next 16 is not the Next.js you remember.** APIs and file conventions differ from most training data — middleware is `proxy.ts` at the root. Read `node_modules/next/dist/docs/` before writing framework code, and heed deprecation notices. (This is also the standing instruction in `AGENTS.md`.)

**One dev server, ever.** Never start a second `next dev` and never delete `.next/dev/lock` — it corrupts the Turbopack cache. Check `http://localhost:3000` before starting anything.

**Design tokens live in `app/globals.css`** under `@theme inline` and `:root` / `.dark`. There is no `tailwind.config.js`, and adding one would split the source of truth.

**Two `Button` implementations exist.** `components/animate-ui/components/buttons/button` is the product button used by the home and auth pages; `components/ui/global/button` is an older shadcn generation kept for the header. Don't mix them inside one view.

**Two visual worlds, deliberately separate.** The application (bone white, Lexend Deca, orange/ember accent) and `/design` (ivory paper, EB Garamond, `ctr-*` tokens, three route-scoped fonts). Never let one bleed into the other — `DESIGN.md` owns the boundary.

**The header is fixed** (56px mobile / 82px from `md`) and renders on every `(main)` route. Each page reserves that height itself; a page starting at `p-8` slides underneath it.

**`/design` is GSAP-pinned and Lenis-driven.** Never nest a pin inside another pin: pinning writes a transform, the transform becomes a containing block, and the inner pin silently stops being fixed. All of its choreography is disabled below 1000px and under `prefers-reduced-motion`.

**Forms** use `zod` + a local `errors` state object, inside a real `<form onSubmit>` with `id`/`htmlFor`, `autoComplete` and `aria-invalid`. Loading is a disabled button with a swapped label, not a spinner.

**Language.** UI copy is English. Source comments are Vietnamese or English; match the file you are editing.

## Exploring the codebase

A knowledge graph of this repo lives in `graphify-out/`. Before exploring for a new feature or a cross-file question, read `graphify-out/GRAPH_REPORT.md` and try `/graphify query "<question>"` before broad grepping. Treat it as a map, not the truth: it reflects the code at the last scan, so confirm in the real files before editing, and re-run `/graphify` (update) after large changes.

## Verifying UI work

The dev server is usually already running on `http://localhost:3000`. When taking screenshots, let entrance motion settle first (framer-motion reveals run 0.4–0.9s; `/design` needs a scroll to advance its pinned timeline) — a capture taken too early shows a half-faded page and reads as a bug that isn't there.
