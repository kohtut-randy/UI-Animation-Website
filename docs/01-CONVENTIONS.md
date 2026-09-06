# 01 · Coding Conventions (both repos)

These are binding for every file in both projects. They come from the project owner's team
standards plus their explicit preferences. When this document and your instincts disagree, this
document wins.


Source: `business-portal-js/.claude/skills/{frontend-conventions,clean-code,pre-code-review}`.
These are the user's team standards. The demo repos follow them so the code reads like the
work he already ships. `historian` and `token-efficiency` are agent-workflow skills, not code
conventions, so they do not apply to the builds.

> **Public-repo boundary.** The conventions come from a private employer codebase and these
> repos are public. Follow the conventions; carry over **no** Rezerv code, copy, branding,
> endpoint names, or domain logic. Everything is written fresh for the fictional CRUX gym.

### Layered architecture (never skip a layer)

| Layer | Responsibility | May use |
|---|---|---|
| UI | Pure presentational components | UI components, styling, props. No data or state management |
| Business | Feature/domain logic; composes UI components | Data hooks, local state, business utils |
| Data | Fetch / cache / mutate | API layer only; returns usable data to Business |
| API | Raw REST calls | `fetch` with error handling. No formatting or transforms |
| State | Client-only shared state | Consumed by UI/Business; side-effect free; never fetches |
| Model/Schema | Types, unions, yup schemas, constants | Any layer |
| Storage | Wraps `localStorage`/`sessionStorage`/cookies | get/set/remove; called only from Business or State, never from components |

Prohibited: APIs or data hooks inside UI components; DOM access from Business/Data;
`localStorage` straight from a component or hook; business logic in the API layer; UI → API.

### Component classification decides the folder

- **UI component** — generic, presentation-only, knows nothing about app state, routes, or
  APIs. Lives in `src/shared/components/`. Anti-patterns: calling APIs, reading context,
  conditional business logic, hardcoded domain text.
- **Business component** — feature-aware, orchestrates logic and state, tied to one module.
  Lives in `src/modules/[module]/components/`.

**Consequence for Part 2:** the generic `DataTable` is a UI component, so it sits in
`src/shared/components/DataTable/` with zero knowledge of classes, attendees, or the gym. The
timetable view that consumes it is a Business component in `src/modules/timetable/components/`.

### Standard module shape (the team's "Pattern A", used by 5 of their 7 modules)

```
src/modules/[module]/
  pages/        route-level composition
  components/   feature-aware business components
  hooks/        module hooks, including the data-fetching wrappers
  constants/    or constants.ts
  types/        or xxx.types.ts
  utils/
  index.ts      barrel - RE-EXPORT ONLY, never define
```

Barrels at the module, `components/`, and `hooks/` levels. Module-scoped hooks and components
are module-prefixed (`useTimetableClassesQuery`, `TimetableClassRow`).

### Naming

- Shared/global symbols: generic and descriptive (`Button`, `useDebounce`, `formatDate`, `cn`).
- Module-scoped symbols: prefixed with the module name.
- Event handlers: `handle` + action (`handleSortChange`, `handleClickExpand`).
- Constants: `ALL_CAPS_WITH_UNDERSCORES`.
- Suffixes: `Query` for query hooks, `xxxService.ts` for API services, `xxxValidation.ts` for
  yup schemas, `xxx.types.ts` for type modules, `XxxRequest`/`XxxResponse`/`XxxDTO` for API types.
- File name matches the exported symbol. One component per file.

### TypeScript

- **Never use `interface`. `type` only, everywhere, with no exceptions.** Extension is done with an
  intersection (`type A = B & { ... }`), not `extends`. This is stricter than the team's own rule
  (which allowed `interface` for extension) and is a hard requirement here. Consequence: any design
  that *needs* declaration merging is dropped rather than worked around — so there is no
  consumer-extensible `ColumnMeta`, which is simpler anyway.
- Never `any` — use `unknown`, `never`, or generics.
- Props are `ComponentNameProps`, declared with `type` (`DataTableProps<T>`, `HeroProps`).
- Literal unions over `enum` (`type SortDirection = 'asc' | 'desc' | null`).
- Built-in utility types (`Partial`, `Omit`, `Pick`, `Record`) over hand-rolled equivalents.
- Always type: props; params and return types of exported functions; API DTOs; custom hook
  inputs **and** return types; context values.
- Let inference work: `useState` initial values, inline callbacks, locals, obvious internals.
- Do not over-engineer types. `ColumnDef<T>` earns its generic; keep everything around it plain.
  No conditional/mapped-type gymnastics where an alias works.

### Naming — plain words, short names

Naming is optimised for a reader skimming the file for the first time, not for precision. Rules:

- **Use everyday English.** If a shorter, more common word means the same thing, use it.
- **No jargon or academic terms in identifiers.** Concepts can be explained in a comment; the
  identifier stays plain. ("Precomputed sort keys", not "Schwartzian transform".)
- **One word per concept, used everywhere.** The column prop is `sticky`, so the hook is
  `useStickyColumns` and the CSS class is `.dt-cell-sticky` — never `pinned` in one place and
  `sticky` in another.
- **Short over complete.** `useCloseOnOutside`, not `useDismissableLayerController`.
- Predictable beats clever: a reader should be able to guess the name before finding it.

Renames applied throughout this spec, and the reason each is simpler:

| Instead of | Use | Why |
|---|---|---|
| `useControllableState` | `useControlledState` | one syllable shorter, same meaning |
| `usePinnedColumns` | `useStickyColumns` | matches the `sticky` column prop |
| `useTableA11yStatus` | `useTableMessage` | says what it produces, no initialism |
| `useDismissable` | `useCloseOnOutside` | says what it does |
| `EllipsisWithTooltip` | `TruncatedText` | plain words |
| `KineticText` | `RevealText` | plain, and matches `Reveal` |
| `EmptyIllustration` | `EmptyIcon` | shorter, accurate |
| `SortablePrimitive` | `SortValue` | plain |
| `Comparator<V>` | `Compare<V>` | plain |
| `PaginationState` | `PageState` | shorter |
| `sortAccessor` | `sortValue` | says what it returns |
| `OnDemandExpansion` | `LazyExpand` | `lazy` is the common word |
| `ExpansionConfig` | `ExpandConfig` | shorter |
| `ExpandedContentContext` | `ExpandContext` | shorter |
| `progressTrickle` | `progressFloor` | says what it is |
| `assertPinnableAncestors` | `checkPinParents` | plain |
| `createMotionMedia` / `MotionConditions` | `motionMedia` / `MediaFlags` | shorter |
| `runBootSequence` | `startBoot` | shorter |
| `decorRegistry` | `idleLoops` | says what it holds |
| `withLatency` | `delayResponse` | plain |
| `chaos.ts` | `testFlags.ts` | plain |
| `getMockDb` | `getMockData` | plain |
| `onTransitionEndOnce` | `onTransitionEnd` | the "once" is the only behaviour |

### DRY, and where duplication is still correct

One source of truth for each of: the sort comparator (shared verbatim by the client table and the
API routes, so client and server orderings cannot diverge), the column layout maths (computed once
per render, passed down, never recomputed per row), the outside-close behaviour (one
`useCloseOnOutside` used by every menu, popover and sheet), the text-truncation behaviour (one
`TruncatedText`), the scroll lock (one module, two drivers), and every constant.

The one **deliberate** duplication is `tokens.css`, copied byte-identical between the two repos
because they are separate repos with no shared package. Both files carry the same header comment
naming the canonical source, and `docs/02-BRAND-TOKENS.md` is the copy protocol. This is documented
as a considered tradeoff, with the note that a published package is the right answer above two
consumers.

Extensibility test each design must pass: adding a column type, a new page, or a second dataset
should require **no change** to the table's internals. That is why the domain lives entirely in
column definitions and the table knows nothing about classes, attendees, or the gym.

### Exports — resolved conflict

Their conventions skill (the stated **target** for new code) says named exports only. Their
existing `src/modules` code default-exports per file and re-exports as named from the barrel,
recorded as legacy. These repos are greenfield, so they follow the target: **named exports
everywhere**, with one framework-forced carve-out for Next.js `pages/*.tsx` route files, which
must default-export. Those stay thin — a default export rendering a named module page component.
This mirrors their own carve-out for lazy-loaded route pages.

Similarly, shared UI goes in `src/shared/components/` (the target), not their legacy
`src/components-v3/`.

### State management — React built-ins only

`useState` / `useReducer` / `useContext` / `useMemo` / `useCallback`. No React Query, Jotai,
Recoil, Redux, or Zustand in either repo. Their rules still bind:

- One responsibility per `useEffect` — never fetch + sync + update in one effect.
- Local UI state (toggles, form state) stays `useState`.
- Avoid derived state; compute with `useMemo` or selectors.
- Co-locate state with usage; do not lift unless needed.
- Do not scatter shared-state updates; centralize them in one hook.

### React/hook anti-patterns their reviewer hunts (`exhaustive-deps` is off, so deps are manual)

Stale closures; missing cleanup for timers, subscriptions and listeners; effects doing more than
one job; derived state stored in state; `setState` after unmount; conditional or looped hooks;
render-time side effects; prop/state mutation; index-as-key on reorderable lists; stale UI after
a mutation with no cache invalidation.

Two bite these builds directly: Part 2's on-demand child fetch must abort and must not
`setState` after unmount, and row keys must come from a stable `getRowId`, never an array index.
Part 1's Lenis instance and GSAP contexts must clean up, and must survive StrictMode double-invoke.

### Clean-code rules

- No broad `catch`. Catch only what you can handle; let real bugs propagate. Never wrap large blocks.
- No over-defensive conditionals: no null checks for values that cannot be null, no impossible
  branches. Flatten nesting with early returns.
- Centralize configuration. No repeated literals anywhere: page sizes, latencies, breakpoints,
  z-index layers, column widths, skeleton row counts, easings, durations, staggers, ScrollTrigger
  offsets, and Lenis config all become named constants in one place.
- No dead code, no `console.log`, no commented-out blocks, no unused exports.
- Comments are short and explain **why**, not what. Lowercase tags: `todo:` / `ref:` / `perf:`.
- Notification copy never contains "success" or "successfully" (house rule): `'Saved.'`.
- `prefer-const` and camelCase are lint-enforced.

### Timezone is a blocking concern in the booking domain

Their reviewer treats a timezone-naive date as a **blocking** finding because the product is a
booking app. Part 2 is literally a class timetable, so:

- Class times carry an explicit studio timezone: a UTC instant plus an IANA zone.
- All display formatting goes through one centralized formatter with an explicit `timeZone`
  option via `Intl.DateTimeFormat`. No date library needed, and no bare `new Date()` for display.
- Sorting by time sorts the underlying instant, never the formatted string.

### Per-repo `docs/ARCHITECTURE.md`

Their reviewer treats a module's own `docs/ARCHITECTURE.md` as the source of truth that
overrides general rules. Each demo repo gets one, documenting the layers, the public component
API, and the boundary rules. The README links to it and stays focused on the assessment's
required sections.

### Quality gate before each commit

The team gates commits on a passing `pre-code-review`: zero blocking findings, and
should-fix findings either fixed or explicitly deferred. Apply the same bar here — run
`/code-review` (or the equivalent self-review pass) on each step's diff before committing, and
verify with the repo's own typecheck/build command.

---
