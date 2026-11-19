import { gamePlan } from '../data/profile'
import { Eyebrow, BallIcon } from '../components/ui/Bits'

export default function GamePlan() {
  return (
    <section id="gameplan" className="relative flex min-h-screen items-center px-5 py-24 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Eyebrow no="04">The game plan</Eyebrow>
        <h2 data-reveal className="h-display mt-5 max-w-4xl text-[clamp(2.6rem,5.6vw,5.2rem)]">
          Five overs. <span className="accent-text">One decision.</span>
        </h2>
        <p data-reveal className="body mt-4 max-w-xl">How every piece of work moves from raw data to a result the business can use.</p>

        <div className="relative mt-10">
          {/* the seam line the overs sit on, with a ball running along it */}
          <div className="pointer-events-none absolute inset-x-[10%] top-[1.6rem] hidden h-px bg-gradient-to-r from-transparent via-saffron to-transparent lg:block" aria-hidden="true">
            <span className="seam-runner absolute -top-[5px] left-0 h-[11px] w-[11px] rounded-full bg-white shadow-[0_0_14px_#ffa23a,0_0_30px_#ffa23a]" />
          </div>

          <ol className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {gamePlan.map((g, i) => (
              <li
                key={g.over}
                data-reveal="pop"
                data-delay={i * 0.08}
                className={`glass-strong neon-edge relative flex flex-col rounded-2xl p-4 md:p-5 ${i === gamePlan.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff4a5c,#a50f1b_55%,#3a0408)] shadow-[0_0_24px_rgba(255,31,61,0.5)]">
                    <span className="absolute inset-y-1.5 left-[30%] border-l border-dashed border-[#f4e9d6]/70" />
                    <span className="relative font-display text-2xl text-white">{g.over}</span>
                  </span>
                  <span className="label !text-[0.68rem]">Over</span>
                </div>
                <h3 className="mt-3 font-display text-[1.45rem] leading-tight tracking-wide text-white md:text-2xl">{g.title}</h3>
                <p className="mt-1.5 text-[0.92rem] leading-snug text-white/88">{g.text}</p>
                <p className="mt-auto flex items-center gap-2 pt-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-saffron">
                  <BallIcon className="h-2.5 w-2.5" /> {g.tools}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
