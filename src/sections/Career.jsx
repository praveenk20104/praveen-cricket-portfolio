import { career, certifications, education } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

function MiniList({ title, tag, items }) {
  return (
    <div>
      <p className="label mb-3 !text-white">{title}</p>
      <ul className="space-y-3">
        {items.map((e) => (
          <li key={e.title} className="flex items-start justify-between gap-4 border-b border-dashed border-white/15 pb-3">
            <span>
              <span className="mr-2 rounded bg-[#ff1f3d]/20 px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#ff7083] ring-1 ring-[#ff1f3d]/50">
                {tag}
              </span>
              <span className="text-[0.98rem] font-medium text-white">{e.title}</span>
              <span className="mt-0.5 block text-sm text-white/80">{e.org}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-white/75">{e.period}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Career() {
  return (
    <section id="career" className="relative flex min-h-screen items-center px-5 py-24 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <Eyebrow no="05">Career scorecard</Eyebrow>
        <h2 data-reveal className="h-display mt-5 text-[clamp(2.6rem,5.6vw,5.2rem)]">
          The innings <span className="neon-red">so far.</span>
        </h2>

        <div data-reveal className="glass-strong mt-8 overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/15 bg-[#ff1f3d]/15 px-5 py-3 md:px-8">
            <span className="label !text-white">Batting · Professional XI</span>
            <span className="label flex items-center gap-2 !text-[#ff4a62]">
              <span className="red-dot !h-1.5 !w-1.5" /> Live
            </span>
          </div>
          {career.map((c) => (
            <div key={c.role} className="grid gap-4 border-b border-white/15 px-5 py-6 md:grid-cols-12 md:px-8">
              <div className="md:col-span-4">
                <p className="font-display text-3xl tracking-wide text-white md:text-4xl">{c.role}</p>
                <p className="mt-1 text-base font-medium text-white">{c.org}</p>
                <p className="label mt-1.5">
                  {c.place} · {c.period}
                </p>
                <span
                  className={`mt-3 inline-block rounded-md px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.18em] ${
                    c.live ? 'bg-[#ff1f3d] text-white shadow-[0_0_18px_rgba(255,31,61,0.6)]' : 'border border-white/35 text-white/90'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <ul className="space-y-2 md:col-span-8">
                {c.points.slice(0, 4).map((p) => (
                  <li key={p} className="flex gap-3 text-[0.98rem] leading-relaxed text-white/92">
                    <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff1f3d]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="grid gap-6 px-5 py-6 md:grid-cols-2 md:px-8">
            <MiniList title="Education" tag="Degree" items={education} />
            <MiniList title="Certifications" tag="Certified" items={certifications} />
          </div>
        </div>
      </div>
    </section>
  )
}
