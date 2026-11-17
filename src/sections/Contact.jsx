import { profile } from '../data/profile'
import Magnetic from '../components/ui/Magnetic'
import { Eyebrow } from '../components/ui/Bits'
import { scrollToId } from '../lib/store'

const socials = [
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
  { label: `Call ${profile.phone}`, href: `tel:${profile.phone.replace(/\s/g, '')}` },
]

export default function Contact() {
  const subject = encodeURIComponent("Let's work together (via your portfolio)")
  return (
    <section id="contact" className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-28 md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end landscape:justify-center">
        <div className="max-w-3xl portrait:glass-strong portrait:rounded-3xl portrait:p-6 md:portrait:p-9">
          <Eyebrow no="09">Next innings</Eyebrow>
          <h2 data-reveal className="h-display mt-5 text-[clamp(3rem,7.6vw,7.2rem)] !leading-[0.9]">
            Ready for the <br />
            <span className="neon-text">next innings?</span>
          </h2>
          <p data-reveal className="h-display mt-4 text-2xl md:text-4xl">
            Let&apos;s <span className="neon-red">connect.</span>
          </p>
          <p data-reveal className="body mt-5 max-w-lg">
            Need dashboards that management actually reads, reports that build themselves, or a fresh analyst for your team?
            I&apos;m padded up and ready to bat.
          </p>

          <div data-reveal className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.4}>
              <a
                href={`mailto:${profile.email}?subject=${subject}`}
                className="cta-btn relative inline-flex items-center gap-3 px-8 py-5 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_50px_rgba(255,31,61,0.55)] md:px-10 md:py-6"
              >
                <span className="cta-pulse" />
                <span className="cta-pulse" />
                Send an email
                <span aria-hidden className="text-lg">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href={profile.resume} download className="glass neon-edge inline-flex items-center gap-2 rounded-full px-7 py-5 font-mono text-xs uppercase tracking-[0.18em] text-white">
                Download resume ↓
              </a>
            </Magnetic>
          </div>

          <div data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm tracking-[0.06em] text-white/90">
            <a href={`mailto:${profile.email}`} className="text-white underline decoration-[#ff1f3d] underline-offset-4 hover:text-[#ff3350]">
              {profile.email}
            </a>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-[#ff3350]">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-14 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-white/70 md:flex-row">
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
