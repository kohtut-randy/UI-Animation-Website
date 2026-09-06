export const PathInterlude = () => (
  <section data-map className='relative h-[220svh] bg-[#ded6c5] text-granite-950'>
    <div className='sticky top-0 h-svh overflow-hidden'>
      <svg data-map-art aria-hidden='true' viewBox='0 0 1200 700' className='absolute inset-0 size-full' preserveAspectRatio='none'>
        <g fill='none' stroke='rgba(11,12,15,0.18)' strokeWidth='1.5'>
          <path data-map-contour d='M-80 170 C160 40 330 300 560 150 S920 20 1280 170' />
          <path data-map-contour d='M-100 235 C170 90 350 365 590 210 S960 85 1300 250' />
          <path data-map-contour d='M-80 520 C210 340 390 640 650 470 S980 335 1300 520' />
          <path data-map-contour d='M-100 585 C180 410 430 700 700 525 S1020 400 1300 600' />
        </g>
        <path
          data-map-route
          d='M80 590 C180 500 135 390 300 360 C455 330 435 190 600 210 C790 235 750 460 920 430 C1040 410 1080 275 1140 105'
          fill='none'
          stroke='#b94735'
          strokeLinecap='round'
          strokeWidth='5'
          vectorEffect='non-scaling-stroke'
        />
        <circle data-map-beacon cx='1140' cy='105' r='17' fill='#b94735' />
        <circle data-map-beacon-ring cx='1140' cy='105' r='36' fill='none' stroke='rgba(185,71,53,0.38)' strokeWidth='2' />
      </svg>

      <div className='gutter absolute inset-x-0 top-[10%] z-10 sm:top-[12%]'>
        <p className='eyebrow mb-5 text-eyebrow text-[#9e3b2d]'>The map</p>
        <h2 className='max-w-[8ch] font-display text-display-lg'>The map thins before the pass.</h2>
      </div>
      <p className='gutter absolute inset-x-0 bottom-[8%] z-10 ml-auto max-w-[34rem] text-lede text-granite-950/65 sm:bottom-[10%]'>
        The marked route climbs through the pass. The beacon sits on the far ridge, and this line is the only way there before dawn.
      </p>
    </div>
  </section>
)
