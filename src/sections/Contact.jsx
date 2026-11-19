import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../data/profile'
import Magnetic from '../components/ui/Magnetic'
import { Eyebrow, BallIcon } from '../components/ui/Bits'
import { emit, reducedMotion, scrollToId } from '../lib/store'
import { EASE } from '../lib/motion'

const battingOrder = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
  { label: 'LinkedIn', value: 'praveen-kumar-590517277', href: profile.linkedin },
  { label: 'GitHub', value: 'praveenk20104', href: profile.github },
]

// DRS: the third umpire reviews the decision, check by check, then shows it on the big screen
const checks = [
  { k: 'Ball tracking', v: 'Skills in line' },
  { k: 'UltraEdge', v: '2+ years of real work' },
  { k: 'Impact', v: 'Dashboards that get used' },
]

function DrsReview() {
  const root = useRef()
  useEffect(() => {
    const q = gsap.utils.selector(root)
    const rows = q('.drs-row')
    const reset = () => {
      rows.forEach((r) => (r.dataset.state = 'pending'))
      gsap.set(q('.drs-decision-final'), { autoAlpha: 0, scale: 0.85 })
      gsap.set(q('.drs-decision-wait'), { autoAlpha: 1 })
    }
    reset()
    if (reducedMotion) {
      rows.forEach((r) => (r.dataset.state = 'done'))
      gsap.set(q('.drs-decision-final'), { autoAlpha: 1, scale: 1 })
      gsap.set(q('.drs-decision-wait'), { autoAlpha: 0 })
      return
    }
    const tl = gsap.timeline({ paused: true })
    rows.forEach((row, i) => {
      tl.fromTo(row.querySelector('.drs-scan'), { xPercent: -100 }, { xPercent: 100, duration: 0.55, ease: EASE.inOut }, i * 0.7)
      tl.call(() => (row.dataset.state = 'done'), null, i * 0.7 + 0.5)
    })
    tl.to(q('.drs-decision-wait'), { autoAlpha: 0, duration: 0.2 }, rows.length * 0.7 + 0.2)
      .to(q('.drs-decision-final'), { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '<')
      .call(() => emit('hired'), null, '<0.1')
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top 80%',
      onEnter: () => (reset(), tl.restart()),
      onEnterBack: () => (reset(), tl.restart()),
    })
    return () => {
      st.kill()
      tl.kill()
    }
  }, [])

  return (
    <div ref={root} data-reveal className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-[#060a18]/95">
      <div className="flex items-center justify-between bg-india px-4 py-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">Third umpire · DRS review</span>
        <span className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white">
          <span className="red-dot !h-1.5 !w-1.5" /> Live
        </span>
      </div>
      <p className="border-b border-white/10 px-4 py-2.5 text-sm text-white/85">
        Reviewing: <span className="font-semibold text-white">should you hire {profile.name}?</span>
      </p>
      <ul>
        {checks.map((c) => (
          <li key={c.k} className="drs-row relative flex items-center justify-between gap-3 overflow-hidden border-b border-white/10 px-4 py-2.5" data-state="pending">
            <span className="drs-scan pointer-events-none absolute inset-0" />
            <span className="relative">
              <span className="label block !text-[0.65rem]">{c.k}</span>
              <span className="text-[0.95rem] text-white">{c.v}</span>
            </span>
            <span className="drs-status relative rounded px-2 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors">
              ✓ Clear
            </span>
          </li>
        ))}
      </ul>
      <div className="relative grid h-20 place-items-center">
        <p className="drs-decision-wait font-mono text-xs uppercase tracking-[0.3em] text-white/70">
          Decision pending<span className="animate-pulse">…</span>
        </p>
        <div className="drs-decision-final absolute inset-2 flex items-center justify-center gap-4 rounded-xl bg-[#138808] shadow-[0_0_40px_rgba(19,136,8,0.55)]">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/90">Decision</span>
          <span className="font-display text-4xl tracking-[0.08em] text-white md:text-5xl">HIRED ✓</span>
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  const subject = encodeURIComponent("Let's work together (via your portfolio)")
  return (
    <section id="contact" className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-28 portrait:pt-[44svh] md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end landscape:justify-center">
        <div className="max-w-2xl portrait:glass-strong portrait:rounded-3xl portrait:p-5 md:portrait:p-8 landscape:max-w-[min(40rem,50vw)]">
          <Eyebrow no="10">Next innings</Eyebrow>
          <h2 data-reveal className="h-display mt-5 text-[clamp(2.9rem,7vw,6.6rem)] !leading-[0.9]">
            Ready for the <br />
            <span className="neon-text">next innings?</span>
          </h2>
          <p data-reveal className="h-display mt-3 text-2xl md:text-4xl">
            Let&apos;s <span className="accent-text">connect.</span>
          </p>

          <DrsReview />

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
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-india/15"
                  >
                    <span className="w-6 font-mono text-xs text-saffron">0{i + 1}</span>
                    <BallIcon className="h-3.5 w-3.5" />
                    <span className="w-20 font-mono text-xs uppercase tracking-[0.14em] text-white/75">{b.label}</span>
                    <span className="min-w-0 flex-1 truncate text-[0.95rem] text-white">{b.value}</span>
                    <span className="text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-saffron" aria-hidden>
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
