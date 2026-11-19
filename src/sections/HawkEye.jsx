import { hawkEye } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

export default function HawkEye() {
  return (
    <section id="hawkeye" className="relative flex min-h-[115svh] flex-col justify-end px-5 py-24 portrait:pt-[50svh] md:px-12 lg:px-16 landscape:min-h-[120vh] landscape:justify-center">
      <div className="max-w-xl landscape:max-w-[min(34rem,42vw)]">
        <Eyebrow no="06">Hawk-Eye on my data</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(2.6rem,5.6vw,5.2rem)]">
          Every ball tracked. <span className="accent-text">Every number too.</span>
        </h2>
        <div data-reveal className="glass-strong mt-6 rounded-3xl p-5 md:p-6">
          <p className="body">
            Hawk-Eye tracks each delivery to show where it pitched and where it was heading. I do the same with business data: track what
            happened, find the pattern, and show where it is going next.
          </p>
          <ol className="mt-5 grid grid-cols-3 gap-2">
            {hawkEye.steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-white/12 bg-white/5 p-3">
                <p className="font-mono text-[0.68rem] text-saffron">0{i + 1}</p>
                <p className="mt-1 font-display text-xl tracking-wide text-white">{s.title}</p>
                <p className="mt-1 text-[0.82rem] leading-snug text-white/85">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="label mt-5">The four tracked balls</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {hawkEye.balls.map((b) => (
              <li key={b.tool} className="flex items-center gap-2.5">
                <span className="h-1 w-7 rounded-full" style={{ background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
                <span className="text-[0.95rem] font-medium text-white">{b.tool}</span>
                <span className="text-xs text-white/65">{b.job}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/60">Solid line: what happened. Dashed line: the prediction.</p>
        </div>
      </div>
    </section>
  )
}
