# 00 · Assessment Requirements (traceability checklist)

Source: `../Engineering Assessment (Frontend React_Next.js).pdf`

Every line below is lifted from that PDF. The build is not done until each row is checked.
`[bonus]` marks items the PDF called optional and which the project owner elevated to **required
scope**, so they are treated as mandatory.

> **Status for this repo (`crux-landing`, Part 1): every requirement is implemented and
> verified.** Part 2's rows belong to the companion repo, `crux-timetable`, and are left
> unticked here. Verification evidence (measured numbers, edge cases exercised, axe and
> Lighthouse results) is in this repo's README.


Every line below is lifted from the assessment document. The build is not done until each row
is checked. `[bonus]` marks items the document called optional and the user elevated to required.

### Part 1 — UI Animation Challenge

**Scope**
- [x] One page only. No full website, no routing, no real navigation, no working CTAs
- [x] Exactly 3 of the reference's ~7 slides: **loading screen → hero → collection section**
- [x] Buttons/links clickable with hover/mouse-over states, navigating nowhere

**Tech**
- [x] A CSS framework for styling (Tailwind v4)
- [x] Responsive support: Desktop / Tablet / Mobile
- [x] `[bonus]` GSAP + ScrollTrigger for scroll-driven animation
- [x] `[bonus]` Lenis for smooth scrolling

**Animation & transitions**
- [x] On load: loading screen / preloader, followed by an entrance reveal
- [x] On scroll: scroll-triggered reveals (fade / scale / translate)
- [x] On scroll: parallax
- [x] On scroll: pinned section
- [x] On hover: interactive elements respond to mouse-over
- [x] On resize: layout adapts smoothly when shrinking and expanding across breakpoints

**Performance**
- [x] Animate `transform` and `opacity`; no layout-triggering properties animated
- [x] Target 60fps; no forced reflows; no unnecessary re-renders
- [x] Lazy-load heavy media
- [x] `[bonus]` Honor `prefers-reduced-motion`

**Edge cases**
- [x] Correct behavior across all three breakpoints
- [x] Graceful degradation of animations on lower-powered / mobile devices
- [x] Slow asset loading covered by the loading state

**Deliverables**
- [ ] Public GitHub repository _(remote not added yet)_
- [x] README: setup instructions
- [x] README: which 3 slides were implemented
- [x] README: libraries chosen and why
- [x] README: approach to animation, smooth scroll, and responsiveness
- [x] README: performance notes
- [x] README: assumptions made
- [ ] Deployed website (Vercel), live URL submitted _(vercel.json ready; deploy pending)_

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

---
