import { profile } from '../../data/profile'

// Broadcast "lower third" shown while the batter walks out, plus a skip button.
// Both are animated by the intro timeline in App.jsx.
export default function IntroOverlay({ onSkip, active }) {
  return (
    <>
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
