export const KineticBridge = () => (
  <section data-kinetic className='relative h-[210svh] bg-[#08090c] text-chalk-100'>
    <div className='sticky top-0 flex h-svh flex-col justify-center overflow-hidden'>
      <p className='eyebrow gutter mb-7 text-eyebrow text-jug-400'>The last ember</p>
      <div className='border-y border-chalk-100/15 py-4 md:py-6'>
        <p
          data-kinetic-row='left'
          className='whitespace-nowrap font-display text-[clamp(4.5rem,14vh,18rem)] font-extrabold leading-[0.76] tracking-[-0.075em] md:text-[clamp(6rem,18vw,18rem)]'
        >
          CARRIES CARRIES CARRIES
        </p>
        <p
          data-kinetic-row='right'
          className='whitespace-nowrap font-display text-[clamp(4.5rem,14vh,18rem)] font-extrabold leading-[0.76] tracking-[-0.075em] text-transparent [-webkit-text-stroke:1px_rgba(245,241,232,0.72)] md:text-[clamp(6rem,18vw,18rem)]'
        >
          THE WAY THE WAY THE WAY
        </p>
        <p
          data-kinetic-row='left'
          className='whitespace-nowrap font-display text-[clamp(4.5rem,14vh,18rem)] font-extrabold leading-[0.76] tracking-[-0.075em] md:text-[clamp(6rem,18vw,18rem)]'
        >
          HOME HOME HOME HOME
        </p>
      </div>
      <span
        data-kinetic-blade
        aria-hidden='true'
        className='absolute left-[18%] top-1/2 h-[2px] w-[68vw] origin-left rotate-[-22deg] bg-[linear-gradient(90deg,transparent,#fb9b00_34%,#fff0cf_52%,transparent)] shadow-[0_0_18px_rgba(251,155,0,0.42)]'
      />
    </div>
  </section>
)
