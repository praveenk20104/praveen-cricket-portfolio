import { services } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'

const icons = {
  sheet: <path d="M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M15 4v16" />,
  report: <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 17v-4M12 17v-7M15 17v-2" />,
  analytics: <path d="M3 20h18M5 16l4-5 4 3 6-8M19 6h-4M19 6v4" />,
  dashboard: <path d="M3 4h18v12H3zM8 20h8M12 16v4M7 12V9M11 12V7M15 12v-2" />,
}

export default function Services() {
  return (
    <section id="services" className="relative flex min-h-screen items-center px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Eyebrow no="03">What I bring to the team</Eyebrow>
        <h2 data-reveal className="h-display mt-5 max-w-4xl text-[clamp(2.7rem,6vw,5.6rem)]">
          Four ways I <span className="accent-text">score</span> for your business.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5" style={{ perspective: '1400px' }}>
          {services.map((s, i) => (
            <article
              key={s.title}
              data-reveal="pop"
              data-delay={(i % 2) * 0.12}
              data-cursor="hover"
              className="glass-strong neon-edge group relative overflow-hidden rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-2 md:p-8"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-india/25 opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-india/50 bg-india/15 shadow-[0_0_20px_rgba(47,107,255,0.35)]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#ffa23a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {icons[s.icon]}
                  </svg>
                </span>
                <span className="font-display text-3xl text-white/25">{s.no}</span>
              </div>
              <h3 className="mt-6 font-display text-3xl tracking-wide text-white md:text-4xl">{s.title}</h3>
              <p className="body mt-3">{s.text}</p>
              <Chips items={s.tags} className="mt-5" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
