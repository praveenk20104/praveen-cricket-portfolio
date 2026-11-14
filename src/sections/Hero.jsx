import { profile } from '../data/profile'
import { scrollToId, isTouch } from '../lib/store'
import Magnetic from '../components/ui/Magnetic'

const Chars = ({ text, className = '' }) => (
  <span className={`inline-block overflow-hidden pb-[0.06em] align-bottom ${className}`} aria-hidden="true">
    {text.split('').map((c, i) => (
      <span key={i} className="hero-char inline-block will-change-transform" style={{ transform: 'translateY(110%)' }}>
        {c}
      </span>
    ))}
  </span>
)

export default function Hero() {
  return (
    <section id="hero" className="relative flex h-[100svh] min-h-[600px] flex-col justify-between px-5 pb-8 pt-24 md:px-12 md:pt-32">
      <div className="text-center">
        <p className="hero-fade eyebrow flex items-center justify-center gap-3" style={{ opacity: 0 }}>
          <span className="red-dot" /> Live from {profile.location} · Portfolio 2026
        </p>
        <h1 className="mt-4 font-display leading-[0.86] tracking-[0.01em] text-[clamp(4rem,17vw,9.6rem)] md:text-[clamp(4rem,9vw,9.6rem)]">
          <span className="sr-only">{profile.name}</span>
          <span className="neon-text block md:inline">
            <Chars text={profile.first} />
          </span>
          <span className="hidden md:inline"> </span>
          <span className="text-stroke block md:inline">
            <Chars text={profile.last} />
          </span>
        </h1>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
        <div className="hero-fade text-center md:text-left" style={{ opacity: 0 }}>
          <p className="eyebrow">Currently batting as</p>
          <p className="mt-2 font-display text-2xl tracking-wide md:text-4xl">
            Data Analyst <span className="text-[#ff1f3d]">&</span> MIS Executive
          </p>
        </div>

        <div className="hero-fade flex flex-wrap items-center justify-center gap-3" style={{ opacity: 0 }}>
          <Magnetic>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('projects')
              }}
              className="glass neon-edge inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-white"
            >
              View projects <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resume}
              download
              className="inline-flex items-center gap-2 rounded-full bg-[#ff1f3d] px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,31,61,0.55)]"
            >
              Resume <span aria-hidden>↓</span>
            </a>
          </Magnetic>
        </div>

        <div className="hero-fade hidden flex-col items-end gap-2 md:flex" style={{ opacity: 0 }}>
          <p className="eyebrow">{isTouch ? 'Swipe the ball · Scroll' : 'Move · Drag the ball · Scroll'}</p>
          <span className="relative h-12 w-[1px] overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-[#ff1f3d]" />
          </span>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  )
}
