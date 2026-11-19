import { career } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

export default function Career() {
  return (
    <section id="career" className="relative flex min-h-screen items-center px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <Eyebrow no="07">Career scorecard</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(2.7rem,6vw,5.6rem)]">
          The innings <span className="accent-text">so far.</span>
        </h2>

        <div data-reveal className="glass-strong mt-10 overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/15 bg-india/15 px-5 py-3 md:px-8">
            <span className="label !text-white">Batting · Professional XI</span>
            <span className="label flex items-center gap-2 !text-saffron">
              <span className="red-dot !h-1.5 !w-1.5" /> Live
            </span>
          </div>
          {career.map((c) => (
            <div key={c.role} className="grid gap-5 border-b border-white/15 px-5 py-7 last:border-b-0 md:grid-cols-12 md:px-8">
              <div className="md:col-span-4">
                <p className="font-display text-3xl tracking-wide text-white md:text-4xl">{c.role}</p>
                <p className="mt-1 text-base font-medium text-white">{c.org}</p>
                <p className="label mt-1.5">
                  {c.place} · {c.period}
                </p>
                <span
                  className={`mt-4 inline-block rounded-md px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.18em] ${
                    c.live ? 'bg-[#ff1f3d] text-white shadow-[0_0_18px_rgba(255,31,61,0.6)]' : 'border border-white/35 text-white/90'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <ul className="space-y-3 md:col-span-8">
                {c.points.map((p) => (
                  <li key={p} className="body flex gap-3">
                    <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
