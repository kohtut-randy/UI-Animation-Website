import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

/* Dev-only proof sheet for the token layer. It exists to answer three questions that
   a screenshot of the landing page cannot:

   1. Does every semantic token actually resolve? An unresolved var() is invisible in
      product code (it just falls back to `initial`), so this page reads the computed
      value and marks blanks in red.
   2. Does `[data-theme='light']` really re-point the semantics? That only works because
      the map lives in `@theme inline`, so the toggle here is a regression test for it.
   3. Does the type scale ride the fluid root font-size? The live readout of the root
      px value and each step's computed size shows it moving as you resize.

   Reachable at /tokens.html in dev only. Not part of the production bundle. */

const PRIMITIVE_RAMPS = [
  { name: 'granite', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50] },
  { name: 'chalk', steps: [50, 100, 200, 300] },
  { name: 'crimp', steps: [400, 500, 600] },
  { name: 'jug', steps: [400, 500, 600] },
  { name: 'sloper', steps: [400, 500, 600] },
  { name: 'pinch', steps: [400, 500, 600] },
  { name: 'pocket', steps: [400, 500, 600] },
  { name: 'volume', steps: [400, 500, 600] },
] as const

const SEMANTIC_GROUPS = [
  {
    label: 'surface',
    tokens: ['surface', 'surface-raised', 'surface-sunken', 'surface-inverse', 'surface-hover', 'surface-subtle'],
  },
  { label: 'ink', tokens: ['ink', 'ink-muted', 'ink-subtle', 'ink-inverse'] },
  { label: 'line', tokens: ['line', 'line-strong', 'border-subtle'] },
  { label: 'brand', tokens: ['brand', 'brand-hover', 'brand-ink', 'accent'] },
  { label: 'state', tokens: ['focus', 'ring', 'success', 'warning', 'danger', 'info'] },
] as const

/* Tailwind scans source text for literal candidates, so the whole class name has to
   appear here as a string. A `text-${step}` template would generate nothing. */
const TYPE_STEPS = [
  { token: '--text-display-2xl', className: 'font-display text-display-2xl' },
  { token: '--text-display-xl', className: 'font-display text-display-xl' },
  { token: '--text-display-lg', className: 'font-display text-display-lg' },
  { token: '--text-display-md', className: 'font-display text-display-md' },
  { token: '--text-lede', className: 'text-lede' },
  { token: '--text-eyebrow', className: 'eyebrow text-eyebrow' },
] as const

const EASES = ['power2-out', 'power3-out', 'power4-out', 'expo-out', 'power3-in-out', 'back-out'] as const

/* Every list handed to useLiveVars is a module constant. An inline array would be a new
   reference on every render, so the effect would re-subscribe and re-setState forever. */
const TYPE_TOKENS = TYPE_STEPS.map(step => step.token)
const SEMANTIC_TOKENS = SEMANTIC_GROUPS.flatMap(group => group.tokens).map(token => `--${token}`)
const SPACE_TOKENS = ['--space-gutter', '--space-section', '--space-stack']
const DURATION_TOKENS = ['--duration-fast', '--duration-base', '--duration-slow', '--duration-curtain']

type Resolved = Record<string, string>

const readVars = (names: readonly string[]): Resolved => {
  const styles = getComputedStyle(document.documentElement)
  return Object.fromEntries(names.map(name => [name, styles.getPropertyValue(name).trim()]))
}

/** Re-reads on every resize so the fluid scale can be watched live. */
const useLiveVars = (names: readonly string[]): Resolved => {
  const [resolved, setResolved] = useState<Resolved>({})

  useEffect(() => {
    const read = () => setResolved(readVars(names))
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [names])

  return resolved
}

type Readout = { rootFontSize: string; width: number }

const useReadout = (): Readout => {
  const [readout, setReadout] = useState<Readout>({ rootFontSize: '', width: 0 })

  useEffect(() => {
    const read = () => setReadout({ rootFontSize: getComputedStyle(document.documentElement).fontSize, width: window.innerWidth })
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  return readout
}

type SwatchProps = { name: string; value: string }

const Swatch = ({ name, value }: SwatchProps) => (
  <div className='flex min-w-0 flex-col gap-1'>
    <div className='h-14 rounded-lg border border-line' style={{ background: `var(${name})` }} />
    <code className='truncate text-[11px] text-ink'>{name}</code>
    <code className={value ? 'truncate text-[10px] text-ink-subtle' : 'text-[10px] font-bold text-danger'}>{value || 'UNRESOLVED'}</code>
  </div>
)

type PanelProps = { title: string; children: ReactNode }

const Panel = ({ title, children }: PanelProps) => (
  <section className='flex flex-col gap-4 border-t border-line pt-8'>
    <h2 className='eyebrow text-eyebrow text-ink-muted'>{title}</h2>
    {children}
  </section>
)

export const TokenPreview = () => {
  const [light, setLight] = useState(false)
  const readout = useReadout()
  const typeSizes = useLiveVars(TYPE_TOKENS)
  const spaces = useLiveVars(SPACE_TOKENS)
  const durations = useLiveVars(DURATION_TOKENS)
  const semantics = useLiveVars(SEMANTIC_TOKENS)

  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark'
  }, [light])

  const unresolved = SEMANTIC_TOKENS.filter(name => semantics[name] === '').length

  return (
    <main className='page gutter flex flex-col gap-8 bg-surface py-12 text-ink'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow text-eyebrow text-brand'>CRUX tokens</p>
          <h1 className='font-display text-display-md'>Token proof sheet</h1>
        </div>
        <div className='nums flex flex-wrap items-center gap-4 text-sm text-ink-muted'>
          <span>
            root <b className='text-ink'>{readout.rootFontSize}</b>
          </span>
          <span>
            viewport <b className='text-ink'>{readout.width}px</b>
          </span>
          <span className={unresolved ? 'font-bold text-danger' : 'text-success'}>{unresolved} unresolved</span>
          <button
            type='button'
            onClick={() => setLight(value => !value)}
            className='rounded-pill border border-line-strong px-4 py-2 text-ink transition-colors duration-(--duration-fast) hover:bg-surface-hover'
          >
            {light ? 'light' : 'dark'}
          </button>
        </div>
      </header>

      <Panel title='Semantics (the only layer product code may use)'>
        {SEMANTIC_GROUPS.map(group => (
          <div key={group.label} className='flex flex-col gap-2'>
            <h3 className='text-xs text-ink-subtle'>{group.label}</h3>
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6'>
              {group.tokens.map(token => (
                <Swatch key={token} name={`--${token}`} value={semantics[`--${token}`] ?? ''} />
              ))}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title='Primitives (brand ramps, never referenced by product code)'>
        {PRIMITIVE_RAMPS.map(ramp => (
          <div key={ramp.name} className='flex flex-col gap-2'>
            <h3 className='text-xs text-ink-subtle'>{ramp.name}</h3>
            <div className='flex gap-1'>
              {ramp.steps.map(step => (
                <div
                  key={step}
                  className='nums h-12 flex-1 rounded text-center text-[9px] leading-[3rem] text-ink-inverse'
                  style={{ background: `var(--color-${ramp.name}-${step})` }}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title='Type scale (resize to watch it ride the fluid root)'>
        {TYPE_STEPS.map(step => (
          <div key={step.token} className='flex flex-col gap-1 border-b border-line pb-4'>
            <code className='nums text-[11px] text-ink-subtle'>
              {step.token} = {typeSizes[step.token] || 'UNRESOLVED'}
            </code>
            <p className={step.className}>Crux the crux</p>
          </div>
        ))}
      </Panel>

      <Panel title='Space, radius, shadow'>
        <div className='nums grid grid-cols-1 gap-3 text-xs md:grid-cols-3'>
          {SPACE_TOKENS.map(name => (
            <div key={name} className='flex flex-col gap-1'>
              <code className='text-ink-subtle'>
                {name} = {spaces[name] || 'UNRESOLVED'}
              </code>
              <div className='h-3 rounded bg-brand' style={{ width: `var(${name})` }} />
            </div>
          ))}
        </div>
        <div className='flex flex-wrap gap-4'>
          <div className='grid size-32 place-items-center rounded-card bg-surface-raised text-xs shadow-card'>radius-card</div>
          <div className='grid size-32 place-items-center rounded-pill bg-surface-raised text-xs shadow-hold'>radius-pill</div>
        </div>
      </Panel>

      <Panel title='Motion (CSS eases twinned with constants/motion.ts)'>
        <div className='nums grid grid-cols-2 gap-2 text-[11px] md:grid-cols-3'>
          {EASES.map(ease => (
            <code key={ease} className='rounded border border-line px-2 py-1 text-ink-muted'>
              --ease-{ease}
            </code>
          ))}
          {DURATION_TOKENS.map(name => (
            <code key={name} className='rounded border border-line px-2 py-1 text-ink-muted'>
              {name} = {durations[name] || 'UNRESOLVED'}
            </code>
          ))}
        </div>
      </Panel>
    </main>
  )
}
