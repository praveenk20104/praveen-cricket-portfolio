import { profile } from '../data/profile'
import Magnetic from '../components/ui/Magnetic'
import { scrollToId } from '../lib/store'

const socials = [
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
  { label: 'Call', href: `tel:${profile.phone.replace(/\s/g, '')}` },
]

export default function Contact() {
  const subject = encodeURIComponent("Let's work together — from your portfolio")
  return (
    <section id="contact" className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-28 md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end md:justify-center">
        <div className="max-w-3xl max-md:glass-strong max-md:rounded-3xl max-md:p-6">
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span className="font-mono text-[#ff1f3d]">05</span> Next innings
          </p>
          <h2 data-reveal className="mt-5 font-display text-[clamp(3rem,8.5vw,8rem)] leading-[0.88] tracking-wide">
            Ready for the <br />
            <span className="neon-text">next innings?</span>
          </h2>
          <p data-reveal className="mt-5 font-display text-2xl tracking-wide text-white/85 md:text-4xl">
            Let&apos;s <span className="text-stroke">connect.</span>
          </p>
          <p data-reveal className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
            Need dashboards that management actually reads, reports that build themselves, or a fresh analyst for your
            team? I&apos;m padded up and ready to bat.
          </p>

          <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.4}>
              <a
                href={`mailto:${profile.email}?subject=${subject}`}
                className="cta-btn relative inline-flex items-center gap-3 px-8 py-5 font-mono text-sm uppercase tracking-[0.22em] text-white shadow-[0_0_50px_rgba(255,31,61,0.55)] md:px-10 md:py-6"
              >
                <span className="cta-pulse" />
                <span className="cta-pulse" />
                Send an email
                <span aria-hidden className="text-lg">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={profile.resume}
                download
                className="glass neon-edge inline-flex items-center gap-2 rounded-full px-7 py-5 font-mono text-xs uppercase tracking-[0.2em] text-white"
              >
                Download resume ↓
              </a>
            </Magnetic>
          </div>

          <div data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.18em] text-white/55">
            <a href={`mailto:${profile.email}`} className="text-white/80 hover:text-[#ff1f3d]">
              {profile.email}
            </a>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-[#ff1f3d]">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-16 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:flex-row">
        <span>© {new Date().getFullYear()} {profile.name} · {profile.location}</span>
        <button onClick={() => scrollToId('hero')} className="hover:text-white">
          Back to the toss ↑
        </button>
      </footer>
    </section>
  )
}
