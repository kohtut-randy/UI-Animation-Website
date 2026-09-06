import { useEffect, useRef, useState } from 'react'
import { ANTICIPATE_PIN, EASE_LINEAR, SCROLL_TRIGGER_START_PIN, SCRUB_SOFT } from 'constants/index'
import { gsap, ScrollTrigger, useGSAP } from 'motion/gsapClient'
import { addMotionMedia, motionMedia } from 'motion/motionMedia'
import { nextFrames } from 'shared/lib'

/* Dev-only harness for the one assumption the animation plan rests on:

   every section hook is written as
     useGSAP(() => { const media = motionMedia(); ...; return () => media.revert() })

   and that only works if `useGSAP` invokes a returned cleanup. It does, because
   `useGSAP` wraps `gsap.context()`, but "it should" is not a verification. This page
   mounts and unmounts a section that creates a real pin, then reads back the counters
   that would expose a leak:

     ScrollTrigger.getAll().length -> must return to its baseline
     pin-spacer elements in the DOM -> must return to zero

   The cycle runs by itself on load so it can be checked headlessly, and React
   StrictMode double-invokes the mount, so a passing run also covers the double-invoke
   case that would otherwise leave an orphaned pin behind. */

const PIN_DISTANCE_PX = 600
const SETTLE_FRAMES = 8

type Counts = { triggers: number; spacers: number; tweens: number }
type Step = 'baseline' | 'mounted' | 'unmounted' | 'done'

const readCounts = (): Counts => ({
  triggers: ScrollTrigger.getAll().length,
  spacers: document.querySelectorAll('.pin-spacer, [data-pin-spacer]').length,
  tweens: gsap.globalTimeline.getChildren(false, true, true).length,
})

/** A miniature of the real wall section: one pin, one scrubbed x tween. */
const PinnedSection = () => {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = motionMedia()

      addMotionMedia(media, scope.current!, (flags, context) => {
        const track = context.selector?.('[data-probe-track]')[0] as HTMLElement | undefined
        if (!track) return

        if (flags.reduce) {
          gsap.set(track, { x: 0 })
          return
        }

        gsap.to(track, {
          x: -PIN_DISTANCE_PX,
          ease: EASE_LINEAR,
          scrollTrigger: {
            trigger: scope.current,
            start: SCROLL_TRIGGER_START_PIN,
            end: `+=${PIN_DISTANCE_PX}`,
            pin: true,
            anticipatePin: ANTICIPATE_PIN,
            scrub: SCRUB_SOFT,
          },
        })
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <div ref={scope} className='grid h-[60vh] place-items-center overflow-hidden bg-surface-raised'>
      <div data-probe-track className='flex gap-4'>
        {[0, 1, 2, 3].map(index => (
          <div key={index} className='grid size-32 place-items-center rounded-card bg-brand text-brand-ink'>
            {index}
          </div>
        ))}
      </div>
    </div>
  )
}

type Report = { baseline: Counts; after: Counts; clean: boolean }

export const MotionProbe = () => {
  const [step, setStep] = useState<Step>('baseline')
  const [counts, setCounts] = useState<Counts>({ triggers: 0, spacers: 0, tweens: 0 })
  const [report, setReport] = useState<Report | null>(null)
  const baseline = useRef<Counts | null>(null)

  // One job: keep the live readout in step with GSAP's own frame loop.
  useEffect(() => {
    const tick = () => setCounts(readCounts())
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  // One job: drive the mount/unmount cycle. `cancelled` covers a StrictMode re-run
  // landing while an await is still in flight.
  useEffect(() => {
    let cancelled = false

    const advance = async (): Promise<void> => {
      await nextFrames(SETTLE_FRAMES)
      if (cancelled) return

      if (step === 'baseline') {
        baseline.current = readCounts()
        setStep('mounted')
        return
      }
      if (step === 'mounted') {
        setStep('unmounted')
        return
      }
      if (step === 'unmounted') {
        const before = baseline.current
        const after = readCounts()
        if (before) setReport({ baseline: before, after, clean: after.triggers <= before.triggers && after.spacers === 0 })
        setStep('done')
      }
    }

    void advance()
    return () => {
      cancelled = true
    }
  }, [step])

  return (
    <main className='page gutter flex flex-col gap-6 py-12'>
      <header className='flex flex-col gap-2'>
        <p className='eyebrow text-eyebrow text-brand'>CRUX motion</p>
        <h1 className='font-display text-display-md'>useGSAP cleanup probe</h1>
        <p className='max-w-prose text-sm text-ink-muted'>
          Records a baseline, mounts a pinned section, unmounts it, then checks that the ScrollTrigger count came back and no pin-spacer was
          left in the DOM.
        </p>
      </header>

      <div className='flex flex-wrap items-center gap-4'>
        <span className='eyebrow text-eyebrow text-ink-muted'>step {step}</span>
        {report && (
          <span
            data-probe-result={report.clean ? 'clean' : 'leaked'}
            className={report.clean ? 'text-lede font-bold text-success' : 'text-lede font-bold text-danger'}
          >
            {report.clean ? 'CLEAN: cleanup ran' : 'LEAKED: cleanup did not run'}
          </span>
        )}
        <button
          type='button'
          onClick={() => {
            setReport(null)
            setStep('baseline')
          }}
          className='rounded-pill border border-line-strong px-5 py-2 transition-colors duration-(--duration-fast) hover:bg-surface-hover'
        >
          run again
        </button>
      </div>

      <dl className='nums grid grid-cols-3 gap-4 border-y border-line py-4 text-sm'>
        {(
          [
            ['ScrollTriggers', counts.triggers, report?.baseline.triggers],
            ['pin-spacers', counts.spacers, report?.baseline.spacers],
            ['live tweens', counts.tweens, report?.baseline.tweens],
          ] as const
        ).map(([label, value, base]) => (
          <div key={label} className='flex flex-col'>
            <dt className='text-xs text-ink-subtle'>{label}</dt>
            <dd className='font-display text-display-md'>{value}</dd>
            <dd className='text-xs text-ink-subtle'>baseline {base ?? '?'}</dd>
          </div>
        ))}
      </dl>

      {step === 'mounted' && <PinnedSection />}
      <div className='h-[150vh]' />
    </main>
  )
}
