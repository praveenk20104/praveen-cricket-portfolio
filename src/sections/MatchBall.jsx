import { stats } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'
import { isTouch } from '../lib/store'

export default function MatchBall() {
  return (
    <section id="matchball" className="relative flex min-h-[115svh] flex-col justify-end px-5 py-24 md:px-12 lg:px-16 landscape:min-h-[120vh] landscape:justify-center">
      <div className="max-w-2xl">
        <Eyebrow no="01">The new ball</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(3rem,7.4vw,7rem)]">
          New ball. <br />
          <span className="neon-red">New innings.</span>
        </h2>
        <p data-reveal className="body mt-5 max-w-lg">
          Every dataset is a fresh match. I read the conditions, pick the right shots and turn raw numbers into decisions a
          business can act on.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:max-w-xl md:gap-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal data-delay={i * 0.08} className="glass rounded-2xl p-4 md:p-5">
              <div className="font-display text-4xl tracking-wide text-white md:text-5xl">{s.value}</div>
              <div className="label mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
        <p data-reveal className="eyebrow mt-6">
          {isTouch ? '↔ Swipe the ball to spin it' : '↔ Drag the ball to spin it'}
        </p>
      </div>
    </section>
  )
}
