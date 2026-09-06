import { useHeroMotion } from 'features/hero/hooks'
import { RevealText, ScrollCue } from 'shared/components'
import { Header } from './Header'
import { HeroWeather } from './HeroWeather'

const HEADLINE_MOBILE = ['Walk', 'into', 'the storm.'] as const
const HEADLINE_DESKTOP = ['Walk into', 'the storm.'] as const

export const Hero = () => {
  const scope = useHeroMotion()

  return (
    <section ref={scope} id='hero' className='relative h-[190svh] bg-granite-950 text-chalk-100'>
      <div className='sticky top-0 isolate h-svh overflow-hidden'>
        <Header />

        <div data-hero-scene aria-hidden='true' className='absolute inset-[-8%] -z-20'>
          <img
            data-hero-image
            src='/ronin-sword-hero.jpg'
            alt=''
            width={1672}
            height={941}
            fetchPriority='high'
            className='size-full object-cover object-[62%_center] md:object-center'
          />
        </div>
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,10,0.84)_0%,rgba(5,7,10,0.42)_46%,rgba(5,7,10,0.06)_80%),linear-gradient(0deg,rgba(5,7,10,0.8)_0%,transparent_48%)]'
        />
        <HeroWeather />
        <div
          data-hero-mist
          aria-hidden='true'
          className='absolute inset-x-[-10%] bottom-[8%] z-[1] h-[38%] bg-[radial-gradient(ellipse_at_center,rgba(225,220,207,0.2),transparent_68%)] blur-2xl'
        />

        <div className='gutter relative z-10 flex min-h-dvh flex-col justify-end pb-12 pt-32 md:pb-16 lg:pb-20'>
          <div data-hero-content className='max-w-[64rem]'>
            <p data-hero-eyebrow className='eyebrow mb-5 text-eyebrow text-jug-400'>
              Chapter one · Exile
            </p>
            <h1 className='font-display text-display-xl text-chalk-100'>
              <RevealText lines={HEADLINE_MOBILE} className='md:hidden' />
              <RevealText lines={HEADLINE_DESKTOP} className='hidden md:flex' />
            </h1>
            <p data-hero-lede className='mt-7 max-w-[34ch] text-lede text-chalk-100/74'>
              When his village falls, a nameless ronin carries its final ember toward the Shrine of First Light.
            </p>
            <div data-hero-cta className='mt-8 flex items-center gap-5'>
              {/* <Button tone='brand' size='lg'>
                Begin the journey
              </Button> */}
              <span className='eyebrow hidden text-eyebrow text-chalk-100/55 sm:block'>Scroll to travel</span>
            </div>
          </div>

          <ScrollCue className='absolute bottom-12 right-6 hidden text-chalk-100 lg:flex' />
        </div>

        <div
          data-hero-foreground
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-[linear-gradient(180deg,transparent,rgba(4,5,7,0.82))]'
        />
      </div>
    </section>
  )
}
