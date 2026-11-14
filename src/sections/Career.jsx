import { career, certifications, education } from '../data/profile'

export default function Career() {
  return (
    <section id="career" className="relative min-h-screen px-5 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <p data-reveal className="eyebrow flex items-center gap-3">
          <span className="font-mono text-[#ff1f3d]">03</span> Career Scorecard
        </p>
        <h2 data-reveal className="mt-4 font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.92] tracking-wide">
          The innings <span className="text-[#ff1f3d] neon-text">so far.</span>
        </h2>

        <div data-reveal className="glass-strong mt-10 overflow-hidden rounded-3xl">
          {/* Scoreboard header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#ff1f3d]/10 px-5 py-3 md:px-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">Batting · Professional XI</span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff1f3d]">
              <span className="red-dot !h-1.5 !w-1.5" /> Live
            </span>
          </div>

          {career.map((c) => (
            <div key={c.role} className="grid gap-4 border-b border-white/10 px-5 py-7 md:grid-cols-12 md:px-8">
              <div className="md:col-span-4">
                <p className="font-display text-3xl tracking-wide">{c.role}</p>
                <p className="mt-1 text-sm text-white/70">{c.org}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
                  {c.place} · {c.period}
                </p>
                <span
                  className={`mt-4 inline-block rounded-md px-2.5 py-1 font-mono text-[11px] tracking-[0.2em] ${
                    c.live ? 'bg-[#ff1f3d] text-white shadow-[0_0_18px_rgba(255,31,61,0.6)]' : 'border border-white/20 text-white/70'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <ul className="space-y-2.5 md:col-span-8">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed text-white/75 md:text-[15px]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff1f3d]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="grid gap-6 px-5 py-7 md:grid-cols-2 md:px-8">
            <div>
              <p className="eyebrow">Education</p>
              <ul className="mt-3 space-y-3">
                {education.map((e) => (
                  <li key={e.title} className="flex items-baseline justify-between gap-4 border-b border-dashed border-white/10 pb-3">
                    <span>
                      <span className="block text-[15px] text-white">{e.title}</span>
                      <span className="text-xs text-white/55">{e.org}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-white/55">{e.period}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Certifications</p>
              <ul className="mt-3 space-y-3">
                {certifications.map((e) => (
                  <li key={e.title} className="flex items-baseline justify-between gap-4 border-b border-dashed border-white/10 pb-3">
                    <span>
                      <span className="block text-[15px] text-white">{e.title}</span>
                      <span className="text-xs text-white/55">{e.org}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-white/55">{e.period}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
