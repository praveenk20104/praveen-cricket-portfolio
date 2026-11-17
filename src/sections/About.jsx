import { profile, stats, strengths } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'
import { isTouch } from '../lib/store'

// The match-ball shot: the 3D ball spins on the right, the story sits on the left
export default function About() {
  return (
    <section id="about" className="relative flex min-h-[115svh] flex-col justify-end px-5 py-24 md:px-12 lg:px-16 landscape:min-h-[115vh] landscape:justify-center">
      <div className="max-w-2xl portrait:glass-strong portrait:rounded-3xl portrait:p-5 md:portrait:p-8">
        <Eyebrow no="01">The new ball</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(2.9rem,7vw,6.6rem)]">
          New ball. <span className="neon-red">New innings.</span>
        </h2>
        <p data-reveal className="body mt-5 max-w-xl">
          {profile.summary}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 md:max-w-xl md:gap-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal data-delay={i * 0.06} className="glass rounded-2xl p-4 md:p-5">
              <div className="font-display text-4xl tracking-wide text-white md:text-5xl">{s.value}</div>
              <div className="label mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div data-reveal className="mt-6">
          <p className="label mb-3">Known in the dressing room for</p>
          <Chips items={strengths} />
        </div>
        <p data-reveal className="eyebrow mt-6">
          {isTouch ? '↔ Swipe the ball to spin it' : '↔ Drag the ball to spin it'}
        </p>
      </div>
    </section>
  )
}
