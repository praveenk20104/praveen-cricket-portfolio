import { profile, services, stats } from '../data/profile'

const icons = {
  sheet: (
    <path d="M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M15 4v16" />
  ),
  report: (
    <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 17v-4M12 17v-7M15 17v-2" />
  ),
  analytics: (
    <path d="M3 20h18M5 16l4-5 4 3 6-8M19 6h-4M19 6v4" />
  ),
}

export default function About() {
  return (
    <section id="about" className="relative min-h-screen px-5 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <p data-reveal className="eyebrow flex items-center gap-3">
          <span className="font-mono text-[#ff1f3d]">01</span> The Pitch Report
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 data-reveal className="font-display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.92] tracking-wide lg:col-span-7">
            I read the data <br className="hidden md:block" />
            like a <span className="text-[#ff1f3d] neon-text">pitch</span> before <br className="hidden md:block" />
            every innings.
          </h2>
          <div data-reveal className="glass-strong rounded-3xl p-6 md:p-8 lg:col-span-5 lg:self-end">
            <p className="text-base leading-relaxed text-white/80 md:text-lg">{profile.summary}</p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              Now: MIS Executive · Rahul Trivedi &amp; Associates
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal data-delay={i * 0.08} className="glass rounded-2xl p-5 md:p-6">
              <div className="font-display text-4xl tracking-wide text-white md:text-5xl">{s.value}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{s.label}</div>
            </div>
          ))}
        </div>

        <p data-reveal className="eyebrow mt-20">What I bring to the team</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5" style={{ perspective: '1200px' }}>
          {services.map((s, i) => (
            <article
              key={s.title}
              data-reveal="pop"
              data-delay={i * 0.12}
              data-cursor="hover"
              className="glass neon-edge group relative overflow-hidden rounded-3xl p-7 transition-transform duration-500 hover:-translate-y-2 md:p-8"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ff1f3d]/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-40" />
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ff1f3d]/40 bg-[#ff1f3d]/10 shadow-[0_0_20px_rgba(255,31,61,0.25)]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#ff4a5f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {icons[s.icon]}
                  </svg>
                </span>
                <span className="font-mono text-xs text-white/40">{s.no}</span>
              </div>
              <h3 className="mt-8 font-display text-3xl tracking-wide">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-[15px]">{s.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <li key={t} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
