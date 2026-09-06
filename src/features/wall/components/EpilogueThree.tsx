export const EpilogueThree = () => {
  return (
    <section data-epilogue-three className='relative h-[320svh] bg-[#080b14] text-chalk-100'>
      <div className='sticky top-0 flex h-svh items-center overflow-hidden'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[radial-gradient(ellipse_at_73%_24%,rgba(238,221,176,0.16),transparent_22%),linear-gradient(180deg,#070a13_0%,#111a2c_54%,#26384a_100%)]'
        />
        <div
          data-epilogue-three-moon
          aria-hidden='true'
          className='absolute left-[73%] top-[52%] size-[clamp(7rem,18vw,15rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4e8c6] shadow-[0_0_22px_#f4e8c6,0_0_90px_rgba(244,232,198,0.55),0_0_180px_rgba(152,190,214,0.22)]'
        />
        <div
          aria-hidden='true'
          className='absolute inset-x-[-10%] bottom-[16%] h-[38%] bg-[#142331] [clip-path:polygon(0_62%,14%_38%,27%_56%,42%_20%,57%_50%,72%_30%,86%_54%,100%_24%,100%_100%,0_100%)]'
        />
        <div
          aria-hidden='true'
          className='absolute inset-x-[-10%] bottom-0 h-[29%] bg-[#05070b] [clip-path:polygon(0_48%,16%_28%,29%_46%,45%_14%,60%_40%,75%_20%,89%_38%,100%_16%,100%_100%,0_100%)]'
        />
        <div
          data-epilogue-three-smoke
          aria-hidden='true'
          className='absolute left-[-18%] top-[20%] h-[13%] w-[70%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(170,188,198,0.2)_0%,rgba(94,119,142,0.08)_52%,transparent_76%)] blur-xl'
        />
        <div
          data-epilogue-three-smoke
          aria-hidden='true'
          className='absolute right-[-20%] top-[34%] h-[17%] w-[76%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(135,163,177,0.18)_0%,rgba(70,97,120,0.08)_52%,transparent_76%)] blur-2xl'
        />
        <div
          data-epilogue-three-smoke
          aria-hidden='true'
          className='absolute left-[20%] top-[31%] h-[7%] w-[42%] rounded-[50%] bg-[#b7c9cc]/[0.12] blur-xl'
        />
        <div data-epilogue-three-copy className='gutter relative z-10 max-w-[34rem]'>
          <p className='eyebrow mb-6 text-eyebrow text-[#f4c77c]'>The moon</p>
          <h2 className='max-w-[9ch] font-display text-display-lg'>The moon finds him before the beacon does.</h2>
          <p className='mt-7 max-w-[29ch] text-lede text-chalk-100/62'>
            He crosses the broken river beneath a white sky. For one quiet breath, the moon lays a road across the ice and shows him where
            to climb.
          </p>
        </div>
      </div>
    </section>
  )
}
