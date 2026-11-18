import { profile } from '../data/profile'
import Magnetic from '../components/ui/Magnetic'
import { Eyebrow, BallIcon } from '../components/ui/Bits'
import { scrollToId } from '../lib/store'

const battingOrder = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
  { label: 'LinkedIn', value: 'praveen-kumar-590517277', href: profile.linkedin },
  { label: 'GitHub', value: 'praveenk20104', href: profile.github },
]

const chase = [
  { k: 'Target', v: 'Your next data project' },
  { k: 'Need', v: '1 message' },
  { k: 'Status', v: 'Padded up' },
]

export default function Contact() {
  const subject = encodeURIComponent("Let's work together (via your portfolio)")
  return (
    <section id="contact" className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-28 portrait:pt-[44svh] md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end landscape:justify-center">
        <div className="max-w-2xl portrait:glass-strong portrait:rounded-3xl portrait:p-5 md:portrait:p-8 landscape:max-w-[min(40rem,50vw)]">
          <Eyebrow no="09">Next innings</Eyebrow>
          <h2 data-reveal className="h-display mt-5 text-[clamp(2.9rem,7vw,6.6rem)] !leading-[0.9]">
            Ready for the <br />
            <span className="neon-text">next innings?</span>
          </h2>
          <p data-reveal className="h-display mt-3 text-2xl md:text-4xl">
            Let&apos;s <span className="neon-red">connect.</span>
          </p>

          {/* TV-style "chase" graphic */}
          <div data-reveal className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-[#0a0508]/90">
            <div className="flex items-center justify-between bg-[#ff1f3d] px-4 py-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">The chase</span>
              <span className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
              </span>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-white/12">
              {chase.map((c) => (
                <div key={c.k} className="px-3 py-3 md:px-4">
                  <dt className="label !text-[0.65rem]">{c.k}</dt>
                  <dd className="mt-1 font-display text-lg leading-tight tracking-wide text-white md:text-xl">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-reveal className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
            <Magnetic strength={0.4}>
              <a
                href={`mailto:${profile.email}?subject=${subject}`}
                className="cta-btn relative inline-flex items-center gap-3 px-7 py-4 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_50px_rgba(255,31,61,0.55)] md:px-9 md:py-5"
              >
                <span className="cta-pulse" />
                <span className="cta-pulse" />
                Send an email
                <span aria-hidden className="text-lg">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href={profile.resume} download className="glass neon-edge inline-flex items-center gap-2 rounded-full px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white md:py-5">
                Download resume ↓
              </a>
            </Magnetic>
          </div>

          {/* contact details as a batting order */}
          <div data-reveal className="mt-7">
            <p className="label mb-2">Batting order</p>
            <ol className="divide-y divide-white/12 overflow-hidden rounded-2xl border border-white/12 bg-[#0a0508]/80">
              {battingOrder.map((b, i) => (
                <li key={b.label}>
                  <a
                    href={b.href}
                    target={b.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#ff1f3d]/15"
                  >
                    <span className="w-6 font-mono text-xs text-[#ff4a62]">0{i + 1}</span>
                    <BallIcon className="h-3.5 w-3.5" />
                    <span className="w-20 font-mono text-xs uppercase tracking-[0.14em] text-white/75">{b.label}</span>
                    <span className="min-w-0 flex-1 truncate text-[0.95rem] text-white">{b.value}</span>
                    <span className="text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-[#ff4a62]" aria-hidden>
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-12 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-white/70 md:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </span>
        <button onClick={() => scrollToId('hero')} className="hover:text-white">
          Back to the pavilion ↑
        </button>
      </footer>
    </section>
  )
}
