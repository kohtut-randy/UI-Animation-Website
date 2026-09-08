import { cn } from 'shared/lib'
import type { HoldColor, HoldShape } from 'shared/types'

/* A climbing hold: hand-authored blob SVG. Four nested layers, each owning its own CSS transform so they can't overwrite each other: [data-hold-parallax] scroll parallax, [data-hold-float] idle loop, [data-hold-magnet] pointer magnetism (desktop only), and the static <svg> art. */

const SHAPE_PATHS: Record<HoldShape, string> = {
  // Deliberately lumpy: hand-tuned asymmetric blobs, not circles — plain ovals kept being the accidental result.
  'blob-a':
    'M154 80C155.5 94.8 137.4 109.5 126.1 121.5C114.8 133.4 99.8 152.2 86.3 151.7C72.8 151.3 57.9 129.8 45.2 118.6C32.5 107.5 12.3 96.9 10.2 84.9C8.1 72.9 22.6 59.8 32.5 46.7C42.4 33.7 55.6 9.1 69.7 6.7C83.8 4.4 102.9 20.5 116.9 32.7C131 44.9 152.5 65.2 154 80Z',
  'blob-b':
    'M137.1 90.1C134 107.3 133.7 132.4 122.4 140.6C111.2 148.8 87 141.9 69.6 139.1C52.1 136.3 25.2 135.1 17.7 123.6C10.3 112.1 21.4 87.4 24.9 70.3C28.3 53.2 27.7 29.6 38.7 21C49.7 12.5 73.6 16.3 90.8 18.9C107.9 21.6 133.7 25.1 141.4 37C149.2 48.8 140.3 72.8 137.1 90.1Z',
  'blob-c':
    'M142 80C142 96.6 140 128.6 128.9 138.2C117.7 147.8 92.3 139.8 74.9 137.8C57.6 135.8 36.3 137 24.8 126.3C13.4 115.6 3.1 88.4 6.3 73.6C9.5 58.7 30.7 48.1 44 37.1C57.4 26.1 72.2 7 86.4 7.3C100.5 7.6 119.8 26.7 129 38.9C138.3 51 142 63.4 142 80Z',
  'blob-d':
    'M147.7 104.6C142.5 117.2 119.2 123.3 103.7 130.8C88.2 138.2 68 153.6 54.7 149.5C41.4 145.4 31.5 122.1 23.8 106.2C16.1 90.3 2.8 67.3 8.6 54C14.3 40.7 41.9 32.9 58.3 26.2C74.6 19.6 93.8 9.3 106.6 14.2C119.4 19.1 128 40.5 134.8 55.6C141.7 70.7 152.8 92.1 147.7 104.6Z',
  'blob-e':
    'M147.7 85.9C145.8 101.2 130.5 111.6 118.8 123.1C107.1 134.6 91.3 155.4 77.4 155C63.5 154.5 47 133.1 35.4 120.1C23.9 107.2 8.9 93.3 8 77.5C7.2 61.6 18.2 34.2 30.5 25C42.8 15.8 65.4 21 82 22C98.7 23.1 119.4 20.7 130.4 31.4C141.3 42 149.7 70.6 147.7 85.9Z',
}

// Two ramp steps per hold so it reads as lit; literal class strings since Tailwind scans source text, not a `fill-${color}-500` template.
const SHAPE_FILL: Record<HoldColor, { body: string; edge: string }> = {
  crimp: { body: 'text-crimp-500', edge: 'text-crimp-600' },
  jug: { body: 'text-jug-500', edge: 'text-jug-600' },
  sloper: { body: 'text-sloper-500', edge: 'text-sloper-600' },
  pinch: { body: 'text-pinch-500', edge: 'text-pinch-600' },
  pocket: { body: 'text-pocket-500', edge: 'text-pocket-600' },
  volume: { body: 'text-volume-500', edge: 'text-volume-600' },
}

export type HoldProps = {
  color: HoldColor
  shape: HoldShape
  className?: string
  /** Rotation in degrees, baked into the SVG so it never touches a layer's transform. */
  spin?: number
}

export const Hold = ({ color, shape, className, spin = 0 }: HoldProps) => {
  const fill = SHAPE_FILL[color]

  return (
    <div data-hold-parallax className={cn('pointer-events-none', className)}>
      <div data-hold-float>
        <div data-hold-magnet>
          {/* Decorative: the hold carries no information the surrounding text does not. */}
          <svg viewBox='0 0 160 160' aria-hidden='true' focusable='false' className='size-full overflow-visible'>
            <g transform={`rotate(${spin} 80 80)`}>
              {/* The darker edge, offset a few px, is the whole shading trick: one path,
                  no gradient, no filter, nothing per-frame. */}
              <path d={SHAPE_PATHS[shape]} className={cn('fill-current', fill.edge)} transform='translate(5 7)' />
              <path d={SHAPE_PATHS[shape]} className={cn('fill-current', fill.body)} />
              {/* Chalk scuff and a bolt hole, so it reads as used gym kit. */}
              <ellipse cx='58' cy='52' rx='15' ry='10' className='fill-chalk-100/25' transform='rotate(-24 58 52)' />
              <circle cx='84' cy='86' r='7' className='fill-granite-950/45' />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
