/* A quiet frame for the story. There is no fake site navigation because the brief asks
   for one page and no real navigation. */
export const Header = () => (
  <header className='absolute inset-x-0 top-0 z-30'>
    <div className='gutter flex items-center justify-between py-6 md:py-8'>
      <span className='max-w-[7ch] origin-left font-display text-xl font-extrabold leading-[0.95] tracking-[-0.05em] text-chalk-100 sm:max-w-none sm:text-2xl'>
        THE LAST EMBER
      </span>
      {/* <span className='eyebrow max-w-[12ch] text-right text-eyebrow leading-[1.25] text-chalk-100/70 sm:max-w-none'>An original scroll tale</span> */}
    </div>
  </header>
)
