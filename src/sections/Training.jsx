import { certifications, education, ticker } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

function Card({ tag, item }) {
  return (
    <li data-reveal className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-md bg-[#ff1f3d]/20 px-2 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#ff7083] ring-1 ring-[#ff1f3d]/50">{tag}</span>
        {item.period && <span className="label">{item.period}</span>}
      </div>
      <h3 className="mt-4 font-display text-2xl leading-tight tracking-wide text-white md:text-[1.7rem]">{item.title}</h3>
      <p className="mt-1.5 text-base text-white/90">{item.org}</p>
    </li>
  )
}

export default function Training() {
  const row = [...ticker, ...ticker]
  return (
    <section id="training" className="relative flex min-h-screen flex-col justify-center py-28">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-12 lg:px-16">
        <Eyebrow no="08">The training camp</Eyebrow>
        <h2 data-reveal className="h-display mt-5 max-w-4xl text-[clamp(2.7rem,6vw,5.6rem)]">
          Nets, drills and <span className="neon-red">degrees.</span>
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p data-reveal className="eyebrow mb-4">Education</p>
            <ul className="space-y-4">
              {education.map((e) => (
                <Card key={e.title} tag="Degree" item={e} />
              ))}
            </ul>
          </div>
          <div>
            <p data-reveal className="eyebrow mb-4">Certifications</p>
            <ul className="space-y-4">
              {certifications.map((e) => (
                <Card key={e.title} tag="Certified" item={e} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* stadium-style scrolling board */}
      <div data-reveal className="mt-16 overflow-hidden border-y border-white/15 bg-[#0a0508]/85 py-4" aria-hidden="true">
        <div className="marquee">
          {row.map((t, i) => (
            <span key={i} className="flex items-center font-display text-4xl tracking-wide text-white md:text-6xl">
              <span className="px-6 md:px-9">{t}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff1f3d] shadow-[0_0_12px_#ff1f3d]" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
