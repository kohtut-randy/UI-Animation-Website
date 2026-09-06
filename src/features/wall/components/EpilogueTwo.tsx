export const EpilogueTwo = () => {
  return (
    <section data-epilogue-two className='relative h-[320svh] bg-[#120d0b] text-chalk-100'>
      <div className='sticky top-0 flex h-svh items-center overflow-hidden'>
        <div aria-hidden='true' className='absolute inset-0 bg-[linear-gradient(180deg,#161a20_0%,#20252b_48%,#32130f_100%)]' />

        {/* Sun - now moves further down on mobile/tablet */}
        <div
          data-epilogue-two-sun
          aria-hidden='true'
          className='absolute left-[64%] size-[clamp(7rem,18vw,15rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb15b]/80 shadow-[0_0_35px_#ed6835,0_0_130px_rgba(211,67,27,0.7)] sun-position'
        />

        {/* Horizon line - matches sun position */}
        <div aria-hidden='true' className='absolute inset-x-0 h-px bg-[#f7b36a]/45 shadow-[0_0_22px_#d3431b] horizon-position' />

        <div
          aria-hidden='true'
          className='absolute left-[72%] top-1/2 h-[70vh] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-jug-400/70 to-transparent'
        />
        <div
          data-epilogue-two-smoke
          aria-hidden='true'
          className='absolute bottom-[40%] left-[55%] h-24 w-56 rounded-[50%] bg-[#b7a69c]/10 blur-2xl'
        />
        <div
          data-epilogue-two-smoke
          aria-hidden='true'
          className='absolute bottom-[36%] left-[66%] h-32 w-72 rounded-[50%] bg-[#857d7c]/10 blur-3xl'
        />
        <div
          data-epilogue-two-smoke
          aria-hidden='true'
          className='absolute bottom-[31%] left-[48%] h-20 w-64 rounded-[50%] bg-[#d2b8a4]/10 blur-2xl'
        />
        <div
          data-epilogue-two-ember
          aria-hidden='true'
          className='absolute left-[calc(72%-10px)] top-1/2 size-5 -translate-y-1/2 rotate-[-18deg] bg-[#ffdca0] shadow-[0_0_12px_#ffb23e,0_0_42px_#d3431b]'
        />
        <div data-epilogue-two-copy className='gutter relative z-10 max-w-[34rem]'>
          <p className='eyebrow mb-6 text-eyebrow text-jug-400'>The bell</p>
          <h2 className='max-w-[9ch] font-display text-display-lg'>The sun sets behind the bell.</h2>
          <p className='mt-7 max-w-[27ch] text-lede text-chalk-100/62'>
            When the battle fades to embers, the keeper rings once through the ash. The sound points him toward the trail above the smoking
            village.
          </p>
        </div>
      </div>

      <style>{`
        .sun-position {
          top: calc(58% + 4vh);
        }
        .horizon-position {
          top: calc(58% + 4vh);
        }
        
        @media (max-width: 1024px) {
          .sun-position {
            top: calc(58% + 12vh);
          }
          .horizon-position {
            top: calc(58% + 12vh);
          }
        }
        
        @media (max-width: 640px) {
          .sun-position {
            top: calc(58% + 20vh);
          }
          .horizon-position {
            top: calc(58% + 20vh);
          }
        }
      `}</style>
    </section>
  )
}
