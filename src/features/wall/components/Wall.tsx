import { STORY_CHAPTER_COUNT } from 'constants/index'
import { useWallMotion } from 'features/wall/hooks'
import { Oath } from './Oath'
import { Epilogue } from './Epilogue'
import { EpilogueTwo } from './EpilogueTwo'
import { EpilogueThree } from './EpilogueThree'
import { KineticBridge } from './KineticBridge'
import { PathInterlude } from './PathInterlude'
import { StoryPanel } from './StoryPanel'
const STORY = [
  {
    chapter: 'The Cut',
    title: 'Steel spins out of the mist.',
    copy: 'A shuriken opens the air before the mark shows red. He drops beneath it, keeps one hand over the firebrand, and sees a masked swordsman step from the trees.',
    image: '/ember-shuriken.jpg',
    imagePosition: '54% center',
    tone: 'dark' as const,
    effect: 'shuriken' as const,
  },
  {
    chapter: 'The Pass',
    title: 'Fire and arrows fill the pass.',
    copy: 'Banners break rank as dust and flame fill the narrow rocks. He holds the rear long enough for the firebrand to stay dry, then follows the mountain road alone.',
    image: '/ember-battle.jpg',
    imagePosition: '50% center',
    tone: 'dark' as const,
    effect: 'battle' as const,
  },
  {
    chapter: 'The Bell',
    title: 'Embers drift where the village stood.',
    copy: 'Ash still rises past the bell tower and the gates stand open. The keeper gives him fresh oil and tells him the mountain beacon has not burned for three nights.',
    image: '/ember-village.jpg',
    imagePosition: '58% center',
    tone: 'dark' as const,
    effect: 'embers' as const,
  },
  {
    chapter: 'The Climb',
    title: 'Lightning splits the climbing rain.',
    copy: 'He wraps the firebrand beneath his coat and climbs by touch. Behind him, thunder washes away every footprint and every way back.',
    image: '/ember-storm.jpg',
    imagePosition: '48% center',
    tone: 'dark' as const,
    effect: 'rain' as const,
  },
  {
    chapter: 'The Crossing',
    title: 'Snow settles on the frozen river.',
    copy: 'A watchtower burns on the far bank. He leaves his pack in the water, crawls across the ice, and protects the last dry wick inside his sleeve.',
    image: '/ember-river.jpg',
    imagePosition: 'center',
    tone: 'dark' as const,
    effect: 'snow' as const,
  },
  {
    chapter: 'The Shrine',
    title: 'Paper lanterns catch the first light.',
    copy: 'At the shrine above the valley, he lights the oil and steps back. Paper and ash drift past the lamps that answer from the villages below, showing the way home.',
    image: '/ember-dawn.jpg',
    imagePosition: '52% center',
    tone: 'light' as const,
    effect: 'paper' as const,
  },
] as const

export const Wall = () => {
  const scope = useWallMotion()

  return (
    <section ref={scope} id='story' data-wall className='relative bg-granite-950'>
      <div
        data-story-hud
        className='pointer-events-none fixed inset-x-0 top-0 z-30 hidden items-center justify-between p-6 text-chalk-100 opacity-0 mix-blend-difference md:flex md:p-8'
      >
        <span className='eyebrow text-eyebrow'>The Last Ember</span>
        <div className='flex items-center gap-4'>
          <span data-wall-counter className='nums font-mono text-xs'>{`01 / ${String(STORY_CHAPTER_COUNT).padStart(2, '0')}`}</span>
          <span className='relative block h-px w-32 overflow-hidden bg-current/30'>
            <span data-wall-progress className='absolute inset-0 block origin-left scale-x-0 bg-current' />
          </span>
        </div>
      </div>

      <StoryPanel index={0} {...STORY[0]} />
      <PathInterlude />
      <StoryPanel index={1} {...STORY[1]} />
      <EpilogueTwo />
      <StoryPanel index={2} {...STORY[2]} />
      <Oath />
      <StoryPanel index={3} {...STORY[3]} />
      <EpilogueThree />
      <StoryPanel index={4} {...STORY[4]} />
      <KineticBridge />
      <StoryPanel index={5} {...STORY[5]} />
      <Epilogue />
    </section>
  )
}
