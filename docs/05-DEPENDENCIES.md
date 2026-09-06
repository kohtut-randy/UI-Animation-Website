# 05 · Dependencies, versions, and tooling

All versions were resolved live against the npm registry in September 2026. Pin them exactly.


| Package | Version | Project |
|---|---|---|
| `react`, `react-dom` | 19.2.8 | both |
| `typescript` | ^7.0.2 (fallback ^5.9 if any tooling rejects it) | both |
| `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/postcss` | 4.3.3 | both |
| `vite` | 8.2.2 | Part 1 |
| `gsap` | 3.15.0 | Part 1 |
| `@gsap/react` | 2.1.2 | Part 1 |
| `lenis` | 1.3.26 | Part 1 |
| `next` | 16.3.4 | Part 2 |
| `@faker-js/faker` | 10.6.0 | Part 2 (dev/seed only) |
| `yup` | 1.7.1 | Part 2 |
| `clsx` + `tailwind-merge` | 2.1.1 / 3.6.0 | both |

**Deliberately not installed.** No UI kit (no Radix), no icon library, no animation library, no
data-fetching library, no table/grid library, no virtualization library, no date library. Every
control, icon, transition, and fetch hook is hand-built. That is the point of the exercise, and it
is the strongest single signal in both repos. The full runtime dependency list is:

- **Project 1**: `react`, `react-dom`, `gsap`, `@gsap/react`, `lenis`, `clsx`, `tailwind-merge`
- **Project 2**: `react`, `react-dom`, `next`, `yup`, `clsx`, `tailwind-merge` (+ `@faker-js/faker` as a devDependency, used only to generate the seed data)

`clsx` + `tailwind-merge` stay because `twMerge` resolves real Tailwind class-conflict bugs that a
hand-rolled `cn` cannot, and the team's own `cn` helper is exactly `twMerge(clsx(...args))`.

### ⚠ Verified TypeScript 7 constraint, and the mitigation

`typescript-eslint@8.69.0` declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"`, so
**TypeScript 7.0.2 is outside the supported range.** `typescript@7.0.2` does ship a working `tsc`
binary, so `tsc --noEmit` is fine. The mitigation, in order:

1. Pin `typescript@^7.0.2` and use it for `typecheck` and `build`.
2. Configure ESLint **without type-aware rules** — flat config uses `tseslint.configs.recommended`,
   **not** `recommendedTypeChecked`, and no `parserOptions.projectService`. With no type-aware rules
   the peer mismatch is inert (an install warning, nothing at runtime).
3. If the package manager hard-fails on the peer range, fall back to `typescript@^5.9.3`. **No source
   changes are required** — nothing in either plan uses TS-7-only syntax.

Also note `vite@8.2.2` requires Node `^20.19.0 || >=22.12.0`, so both READMEs state **Node 22 LTS**.

### Full dev dependency set (both projects)

`typescript@^7.0.2` · `eslint@10.9.1` · `typescript-eslint@8.69.0` ·
`eslint-plugin-react-hooks@7.1.1` · `prettier@3.9.6` · `@types/react@19.2.18` ·
`@types/react-dom@19.2.5`. Project 1 adds `vite@8.2.2`, `@vitejs/plugin-react@6.1.1`,
`@tailwindcss/vite@4.3.3`, `@fontsource-variable/*`. Project 2 adds `@tailwindcss/postcss@4.3.3`
and `@faker-js/faker@10.6.0`.

Project 1 keeps `class-variance-authority@0.7.1` (the team uses `cva` for primitives with real
variant axes). Neither project installs an icon library — icons are hand-authored inline SVG
components following the team's `*SVG.tsx` convention.

### Prettier config (the team's, verbatim — both repos)

```json
{ "semi": false, "printWidth": 140, "singleQuote": true, "arrowParens": "avoid", "jsxSingleQuote": true }
```

No semicolons, single quotes in TS **and** JSX (`className='flex'`), 140-column lines, no parens on
single arrow params. Import style is absolute-from-`src` via `baseUrl: "src"` (Project 1 uses
`vite-tsconfig-paths`; Project 2 uses `tsconfig` `paths`), with relative imports only for siblings
inside the same module.

---

## Requirement traceability

Every line below is lifted from the assessment document. The build is not done until each row
is checked. `[bonus]` marks items the document called optional and the user elevated to required.

### Part 1 — UI Animation Challenge

**Scope**
- [ ] One page only. No full website, no routing, no real navigation, no working CTAs
- [ ] Exactly 3 of the reference's ~7 slides: **loading screen → hero → collection section**
- [ ] Buttons/links clickable with hover/mouse-over states, navigating nowhere

**Tech**
- [ ] A CSS framework for styling (Tailwind v4)
- [ ] Responsive support: Desktop / Tablet / Mobile
- [ ] `[bonus]` GSAP + ScrollTrigger for scroll-driven animation
- [ ] `[bonus]` Lenis for smooth scrolling

**Animation & transitions**
- [ ] On load: loading screen / preloader, followed by an entrance reveal
- [ ] On scroll: scroll-triggered reveals (fade / scale / translate)
- [ ] On scroll: parallax
- [ ] On scroll: pinned section
- [ ] On hover: interactive elements respond to mouse-over
- [ ] On resize: layout adapts smoothly when shrinking and expanding across breakpoints

**Performance**
- [ ] Animate `transform` and `opacity`; no layout-triggering properties animated
- [ ] Target 60fps; no forced reflows; no unnecessary re-renders
- [ ] Lazy-load heavy media
- [ ] `[bonus]` Honor `prefers-reduced-motion`

**Edge cases**
- [ ] Correct behavior across all three breakpoints
- [ ] Graceful degradation of animations on lower-powered / mobile devices
- [ ] Slow asset loading covered by the loading state

**Deliverables**
- [ ] Public GitHub repository
- [ ] README: setup instructions
- [ ] README: which 3 slides were implemented
- [ ] README: libraries chosen and why
- [ ] README: approach to animation, smooth scroll, and responsiveness
- [ ] README: performance notes
- [ ] README: assumptions made
- [ ] Deployed website (Vercel), live URL submitted

### Part 2 — Component Engineering Challenge

**Hard constraint**
- [ ] Table built from scratch; no table/grid library anywhere in `package.json`

**Tech**
- [ ] React / Next.js
- [ ] TypeScript, table generic over its row type
- [ ] Driven by column definitions, not hard-coded columns
- [ ] Mock JSON data / mocked API calls modelled as real production endpoints, with artificial latency

**Sorting**
- [ ] Client-side sorting: click a column header to cycle asc / desc / none
- [ ] `[bonus]` Server-side sorting: controlled mode, table emits sort change, parent supplies sorted data

**Pagination**
- [ ] Client-side pagination: page size + page navigation over the full dataset
- [ ] `[bonus]` Server-side pagination: controlled mode, table emits page/size change, parent supplies page + total count

**Expandable rows — BOTH modes**
- [ ] (a) Inline child rows supplied with the parent in the data
- [ ] (b) On-demand child rows fetched lazily on expand, with their own skeleton/spinner loading state
- [ ] (b) Sensible error state if the child fetch fails
- [ ] Expanded content renders below the parent row, spanning the table width
- [ ] Smooth expand/collapse transition

**Sticky / pinned column**
- [ ] At least one column pinned left, fixed during horizontal scroll
- [ ] Visual cue (shadow/divider) when content scrolls beneath the pinned column

**Skeleton loading**
- [ ] Skeleton rows that match the column layout, not just a spinner

**States**
- [ ] Loading, empty, and error states consistent with the dashboard

**Component API**
- [ ] Column definitions describe: key/accessor, header label, custom cell render, sortable flag, width, pinned flag
- [ ] Controlled and uncontrolled sort
- [ ] Controlled and uncontrolled pagination
- [ ] Renders the class timetable view AND at least one differently-shaped dataset
- [ ] Semantic markup
- [ ] Keyboard focus on interactive controls
- [ ] Appropriate ARIA

**Edge cases**
- [ ] Empty dataset
- [ ] Empty child lists
- [ ] Failed initial fetch
- [ ] Failed on-demand child fetch
- [ ] Slow fetches (skeletons must appear)
- [ ] Pinned column behavior on narrow / mobile viewports
- [ ] Large datasets stay smooth (no laggy sort/scroll)
- [ ] Invalid sort key
- [ ] Out-of-range page

**UI / UX**
- [ ] Clean spacing and clear hierarchy in a SaaS-style layout
- [ ] Hover states on rows and on interactive headers
- [ ] Subtle transitions on expand/collapse and on sort
- [ ] Responsive on tablet and mobile
- [ ] No slow rendering or laggy interaction

**Deliverables**
- [ ] Public GitHub repository
- [ ] Class timetable view as real usage
- [ ] Demo page: same component, second differently-shaped dataset, server-side mode, on-demand mode
- [ ] README: setup instructions
- [ ] README: component API design and how column definitions work
- [ ] README: client-side vs server-side strategy (sort & pagination)
- [ ] README: expandable-rows design for both inline and on-demand modes
- [ ] README: sticky-column approach
- [ ] README: state management decision and why
- [ ] README: tradeoffs considered and assumptions made
- [ ] Deployed website (Vercel), live URL submitted
