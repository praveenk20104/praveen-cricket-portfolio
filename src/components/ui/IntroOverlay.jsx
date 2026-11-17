import { profile } from '../../data/profile'

// Broadcast graphics for the opening: a cinematic title while the floodlights come on,
// a LIVE channel bug, the "new batter" lower third, and a skip button.
// All of them are animated by the intro timeline in App.jsx.
export default function IntroOverlay({ onSkip, active }) {
  return (
    <>
      <div className="intro-title pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: 0 }} aria-hidden="true">
        <p className="eyebrow">Under lights · New Delhi</p>
        <p className="mt-3 font-display text-[clamp(3rem,10vw,9rem)] leading-[0.9] text-white neon-text">{profile.name.toUpperCase()}</p>
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.35em] text-white/90">The innings begins</p>
      </div>

      <div className="intro-live pointer-events-none fixed right-4 top-4 z-20 flex items-center gap-2 md:right-6 md:top-6" style={{ opacity: 0 }} aria-hidden="true">
        <span className="flex items-center gap-2 rounded bg-[#e5142e] px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
        </span>
        <span className="rounded bg-[#0a0508]/90 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.18em] text-white">Night match</span>
      </div>

      <div className="intro-l3 pointer-events-none fixed bottom-[13%] left-0 z-20 flex flex-col items-start gap-1" style={{ opacity: 0 }} aria-hidden="true">
        <div className="l3 flex items-center gap-2 bg-[#ff1f3d] py-1.5 pl-5 pr-10 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-white md:pl-12">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> New batter in · No. 19
        </div>
        <div className="l3 bg-white py-2 pl-5 pr-12 font-display text-4xl tracking-wide text-[#0a0508] md:pl-12 md:text-6xl">{profile.name.toUpperCase()}</div>
        <div className="l3 bg-[#0a0508]/90 py-2 pl-5 pr-10 font-mono text-xs uppercase tracking-[0.16em] text-white md:pl-12 md:text-sm">
          {profile.role} · {profile.location}
        </div>
      </div>

      {active && (
        <button
          onClick={onSkip}
          className="intro-skip glass-strong fixed bottom-5 right-5 z-50 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white hover:text-[#ff3350]"
        >
          Skip intro ›
        </button>
      )}
    </>
  )
}
