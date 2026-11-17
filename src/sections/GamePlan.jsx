import { gamePlan } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

// Low camera down the pitch: the Hawk-Eye tracked deliveries fly between the title and the cards
export default function GamePlan() {
  return (
    <section id="gameplan" className="relative flex min-h-screen flex-col justify-between gap-10 px-5 py-24 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Eyebrow no="03">The game plan</Eyebrow>
        <h2 data-reveal className="h-display mt-5 max-w-3xl text-[clamp(2.6rem,5.6vw,5.2rem)]">
          Five overs from raw data to a <span className="neon-red">decision.</span>
        </h2>
        <p data-reveal className="label mt-4 !text-white/85">Ball tracking on: watch every delivery hit the stumps</p>
      </div>
      <ol className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:-mx-12 md:px-12 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {gamePlan.map((g, i) => (
          <li
            key={g.over}
            data-reveal
            data-delay={i * 0.07}
            className="glass-strong w-[78%] shrink-0 snap-start rounded-3xl p-5 sm:w-[46%] lg:w-auto"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl leading-none text-[#ff3350]">{g.over}</span>
              <span className="label !text-[0.65rem]">Over</span>
            </div>
            <h3 className="mt-3 font-display text-2xl leading-tight tracking-wide text-white">{g.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-white/90">{g.text}</p>
            <p className="label mt-3 !text-[0.68rem] !text-white/80">{g.tools}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
