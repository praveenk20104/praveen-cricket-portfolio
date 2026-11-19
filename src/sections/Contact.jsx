import { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../data/profile'
import Magnetic from '../components/ui/Magnetic'
import { Eyebrow } from '../components/ui/Bits'
import { emit, isTouch, reducedMotion, scrollToId } from '../lib/store'
import { EASE } from '../lib/motion'

/* ---------- simple line icons (drawn here, no icon library) ---------- */
const Icon = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
      <path d="M10.5 18.2h3" />
      <path d="M10 5.2h4" opacity="0.6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="9.5" width="3.2" height="10" rx="0.6" />
      <circle cx="5.6" cy="5.9" r="1.9" />
      <path d="M10 9.5h3v1.5c.6-1 1.8-1.8 3.4-1.8 2.6 0 3.6 1.7 3.6 4.4v5.9h-3.2v-5.4c0-1.3-.4-2.2-1.6-2.2-1.3 0-2 .9-2 2.3v5.3H10z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m13.5 4.5-3 15" opacity="0.75" />
    </svg>
  ),
}

// The same four channels orbit the match ball in the 3D scene (ContactOrbit.jsx): hovering a card
// lights up its orb in the stadium.
const channels = [
  { id: 'email', label: 'Email', value: profile.email, href: `mailto:${profile.email}`, action: 'Write', color: '#ffa23a', copy: profile.email },
  { id: 'phone', label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}`, action: 'Call', color: '#2fd27a', copy: profile.phone },
  { id: 'linkedin', label: 'LinkedIn', value: 'praveen-kumar-590517277', href: profile.linkedin, action: 'Connect', color: '#4d86ff' },
  { id: 'github', label: 'GitHub', value: 'praveenk20104', href: profile.github, action: 'Follow', color: '#f4f1ea' },
]

/* ---------- a contact card that tilts in 3D under the mouse, with a glare and a layered icon ---------- */
function ContactCard({ c, i }) {
  const ref = useRef()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = ref.current
    const focus = () => emit('contactFocus', i)
    const blur = () => emit('contactFocus', -1)
    if (isTouch || reducedMotion) {
      el.addEventListener('pointerdown', focus)
      el.addEventListener('focusin', focus)
      el.addEventListener('focusout', blur)
      return () => {
        el.removeEventListener('pointerdown', focus)
        el.removeEventListener('focusin', focus)
        el.removeEventListener('focusout', blur)
      }
    }
    let raf = 0
    const t = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    const loop = () => {
      cur.x += (t.x - cur.x) * 0.16
      cur.y += (t.y - cur.y) * 0.16
      el.style.setProperty('--tx', cur.x.toFixed(4))
      el.style.setProperty('--ty', cur.y.toFixed(4))
      raf = Math.abs(t.x - cur.x) + Math.abs(t.y - cur.y) > 0.001 ? requestAnimationFrame(loop) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      t.x = px - 0.5
      t.y = py - 0.5
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      kick()
    }
    const enter = () => {
      el.classList.add('is-hot')
      focus()
    }
    const leave = () => {
      el.classList.remove('is-hot')
      t.x = 0
      t.y = 0
      kick()
      blur()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', enter)
    el.addEventListener('focusout', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', enter)
      el.removeEventListener('focusout', leave)
    }
  }, [i])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.copy)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = c.copy
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    emit('cheer', i)
    setTimeout(() => setCopied(false), 1700)
  }

  const external = c.href.startsWith('http')
  return (
    <li ref={ref} className="cc" data-id={c.id} style={{ "--c": c.color }}>
      <div className="cc-inner">
        <span className="cc-border" aria-hidden />
        <span className="cc-bg" aria-hidden />
        <span className="cc-num" aria-hidden>
          0{i + 1}
        </span>
        <span className="cc-shine" aria-hidden />

        <a
          className="cc-link"
          href={c.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          aria-label={`${c.label}: ${c.value}`}
          onClick={() => emit('cheer', i)}
        />

        <div className="cc-top">
          <span className="cc-icon" aria-hidden>
            <span className="cc-orbit" />
            <span className="cc-orb">{Icon[c.id]}</span>
          </span>
          {c.copy && (
            <button type="button" className="cc-copy" onClick={copy} aria-label={`Copy ${c.label.toLowerCase()}`}>
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          )}
        </div>

        <div className="cc-text">
          <span className="cc-label">{c.label}</span>
          <span className="cc-value" title={c.value}>
            {c.value}
          </span>
        </div>
        <span className="cc-go" aria-hidden>
          {c.action} <span className="cc-arrow">→</span>
        </span>
      </div>
    </li>
  )
}

/* ---------- headline: words flip up in 3D, like a scoreboard turning over ---------- */
function FlipWords({ text, className = '' }) {
  return text.split(' ').map((w, i, a) => (
    <Fragment key={i}>
      <span className="flip-mask">
        <span className={`flip-word ${className}`}>{w}</span>
      </span>
      {i < a.length - 1 ? ' ' : ''}
    </Fragment>
  ))
}

export default function Contact() {
  const root = useRef()
  const subject = encodeURIComponent("Let's work together (via your portfolio)")

  useEffect(() => {
    if (reducedMotion) return
    const q = gsap.utils.selector(root)
    const words = q('.flip-word')
    const cards = q('.cc')
    gsap.set(words, { rotationX: -95, yPercent: 40, opacity: 0, transformOrigin: '50% 100% -0.4em', transformPerspective: 700 })
    gsap.set(cards, { rotationX: -55, y: 70, z: -160, opacity: 0, transformPerspective: 1000, transformOrigin: '50% 0%' })
    const tl = gsap
      .timeline({ paused: true })
      .to(words, { rotationX: 0, yPercent: 0, opacity: 1, duration: 1.0, ease: EASE.out, stagger: 0.07 })
      .to(cards, { rotationX: 0, y: 0, z: 0, opacity: 1, duration: 1.1, ease: EASE.out, stagger: 0.1, clearProps: 'transform' }, 0.35)
      .call(() => emit('cheer', -1), null, 0.9)
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top 70%',
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    })
    return () => {
      st.kill()
      tl.kill()
    }
  }, [])

  return (
    <section
      id="contact"
      ref={root}
      className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-28 portrait:pt-[40svh] md:px-12 lg:px-16"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end landscape:justify-center">
        <div className="max-w-2xl portrait:glass-strong portrait:rounded-3xl portrait:p-5 md:portrait:p-8 landscape:max-w-[min(42rem,52vw)]">
          <Eyebrow no="10">Next innings</Eyebrow>
          <h2 className="h-display mt-5 text-[clamp(2.6rem,6.2vw,5.8rem)] !leading-[0.92]">
            <FlipWords text="Ready for the" />
            <br />
            <FlipWords text="next innings?" className="neon-text" />
          </h2>
          <p className="h-display mt-3 text-2xl md:text-4xl">
            <FlipWords text="Let's" /> <FlipWords text="connect." className="accent-text" />
          </p>

          <p data-reveal className="status-pill mt-5">
            <span className="status-pill__dot" />
            Open to Data Analyst &amp; MIS roles · {profile.location}
          </p>

          {/* four ways to reach me: 3D cards */}
          <div className="mt-6">
            <p className="label mb-3">Pick your shot</p>
            <ol className="cc-grid">
              {channels.map((c, i) => (
                <ContactCard key={c.id} c={c} i={i} />
              ))}
            </ol>
          </div>

          <div data-reveal className="mt-7 flex flex-wrap items-center gap-3 md:gap-4">
            <Magnetic strength={0.4}>
              <a
                href={`mailto:${profile.email}?subject=${subject}`}
                onClick={() => emit('cheer', 0)}
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
