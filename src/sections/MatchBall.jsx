import { newBall } from '../data/profile'
import { Eyebrow, BallIcon } from '../components/ui/Bits'
import { isTouch } from '../lib/store'

export default function MatchBall() {
  return (
    <section id="matchball" className="relative flex min-h-[115svh] flex-col justify-end px-5 py-24 portrait:pt-[46svh] md:px-12 lg:px-16 landscape:min-h-[125vh] landscape:justify-center">
      <div className="max-w-2xl landscape:max-w-[min(42rem,52vw)]">
        <Eyebrow no="01">The new ball</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(3rem,7.4vw,7rem)]">
          New ball. <br />
          <span className="accent-text">New innings.</span>
        </h2>
        <div data-reveal className="glass-strong mt-6 rounded-3xl p-5 md:p-6">
        <p className="body !text-[1.08rem] md:!text-[1.18rem]">{newBall.plain}</p>

        {/* experience badge styled like a match ball */}
        <div className="mt-5 flex items-center gap-4">
          <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff4a5c,#a50f1b_55%,#3a0408)] shadow-[0_0_40px_rgba(255,31,61,0.55)] md:h-24 md:w-24">
            <span className="absolute inset-y-2 left-[30%] border-l-2 border-dashed border-[#f4e9d6]/70" />
            <span className="relative font-display text-3xl text-white md:text-4xl">{newBall.experience}</span>
          </span>
          <div>
            <p className="font-display text-2xl tracking-wide text-white md:text-3xl">Years in data &amp; MIS</p>
            <p className="label mt-1">Analysis · Dashboards · Automated reporting</p>
          </div>
        </div>

        </div>

        {/* "this over": three deliveries that explain the job */}
        <div data-reveal className="mt-7 flex items-center gap-3">
          <span className="label !text-white">This over</span>
          <span className="flex gap-1.5">
            {newBall.balls.map((b) => (
              <BallIcon key={b.title} className="h-3 w-3" />
            ))}
          </span>
        </div>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {newBall.balls.map((b, i) => (
            <li key={b.title} data-reveal="pop" data-delay={i * 0.1} className="glass-strong neon-edge rounded-2xl p-4 md:p-5">
              <div className="flex items-center gap-2.5">
                <BallIcon className="h-6 w-6" />
                <span className="label !text-saffron">Ball {i + 1}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight tracking-wide text-white">{b.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/88">{b.text}</p>
            </li>
          ))}
        </ol>

        <p data-reveal className="eyebrow mt-6">
          {isTouch ? '↔ Swipe the ball to spin it' : '↔ Drag the ball to spin it'}
        </p>
      </div>
    </section>
  )
}
