export type StoryPanelProps = {
  index: number
  chapter: string
  title: string
  copy: string
  image: string
  imagePosition?: string
  tone: 'dark' | 'light'
  effect: 'embers' | 'rain' | 'snow' | 'paper' | 'shuriken' | 'battle'
}

export const StoryPanel = ({ index, chapter, title, copy, image, imagePosition = 'center', tone, effect }: StoryPanelProps) => (
  <article data-story-panel className='relative h-[230svh] bg-granite-950'>
    <div data-story-frame className='sticky top-0 h-svh overflow-hidden'>
      <div data-story-image className='absolute inset-[-8%]'>
        <img
          src={image}
          alt=''
          width={1672}
          height={941}
          loading={index === 0 ? 'eager' : 'lazy'}
          className='size-full object-cover'
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <div
        className={`absolute inset-0 ${
          tone === 'dark'
            ? 'bg-[linear-gradient(90deg,rgba(5,7,10,0.9)_0%,rgba(5,7,10,0.45)_48%,rgba(5,7,10,0.08)_78%),linear-gradient(0deg,rgba(5,7,10,0.72),transparent_60%)]'
            : 'bg-[linear-gradient(90deg,rgba(246,236,210,0.84)_0%,rgba(246,236,210,0.22)_48%,transparent_74%),linear-gradient(0deg,rgba(20,17,13,0.35),transparent_48%)]'
        }`}
      />

      <StoryAtmosphere effect={effect} />
      <div data-story-wash aria-hidden='true' className='absolute inset-0 origin-left bg-granite-950' />
      <div
        data-story-foreground
        aria-hidden='true'
        className='absolute -bottom-[7%] -left-[5%] h-[30%] w-[110%] bg-[radial-gradient(ellipse_at_bottom,rgba(3,4,6,0.9),transparent_68%)]'
      />

      <div
        data-story-copy
        className={`gutter absolute inset-x-0 bottom-[8%] z-10 max-w-[60rem] sm:bottom-[11%] ${tone === 'dark' ? 'text-chalk-100' : 'text-granite-950'}`}
      >
        <div data-story-meta className='mb-7 flex items-center gap-4'>
          <span className='nums font-mono text-xs opacity-60'>0{index + 1}</span>
          <span className='h-px w-14 bg-current opacity-35' />
          <p className='eyebrow text-eyebrow opacity-65'>{chapter}</p>
        </div>
        <h2 data-story-title className='max-w-[10ch] font-display text-display-lg'>
          {title}
        </h2>
        <p data-story-body className='mt-6 max-w-[31ch] text-lede opacity-75'>
          {copy}
        </p>
      </div>

      <span
        data-story-mark
        aria-hidden='true'
        className={`absolute right-[-4%] top-[14%] font-display text-[clamp(7rem,34vw,24rem)] font-extrabold leading-none sm:right-[4%] sm:top-[10%] sm:text-[clamp(9rem,24vw,24rem)] ${
          tone === 'dark' ? 'text-chalk-100/5' : 'text-granite-950/7'
        }`}
      >
        0{index + 1}
      </span>
    </div>
  </article>
)
import { StoryAtmosphere } from './StoryAtmosphere'
