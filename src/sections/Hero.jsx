import { useState } from 'react'
import { profile, playerCard } from '../data/profile'
import { scrollToId } from '../lib/store'
import Magnetic from '../components/ui/Magnetic'

const Chars = ({ text }) => (
  <span className="hero-clip inline-block overflow-hidden pb-[0.06em] align-bottom" aria-hidden="true">
    {text.split('').map((c, i) => (
      <span key={i} className="hero-char inline-block will-change-transform" style={{ transform: 'translateY(110%)' }}>
        {c}
      </span>
    ))}
  </span>
)

// Shows public/profile.jpg when it exists, otherwise a "PK" badge
function Photo() {
  const [ok, setOk] = useState(true)
  return (
    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-[radial-gradient(circle_at_30%_20%,#5a0a14,#14060a_70%)] lg:h-40 lg:w-32">
      {ok ? (
        <img src={profile.photo} alt={profile.name} onError={() => setOk(false)} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <span className="font-display text-4xl tracking-wider text-white lg:text-6xl">
            PK<span className="text-[#ff1f3d]">.</span>
          </span>
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-[#ff1f3d] py-0.5 text-center font-mono text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white md:text-[0.65rem]">
        Not out
      </span>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] flex-col px-5 pb-6 pt-24 portrait:min-h-[max(100svh,48rem)] md:px-12 md:pb-10 md:pt-28 lg:px-16 short:!pb-4 short:!pt-[4.8rem]">
      {/* soft dark gradient behind the text only: the batter stays fully lit */}
      <div className="hero-fade pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-[64%] bg-gradient-to-r from-[#050206]/92 via-[#050206]/60 to-transparent landscape:block" style={{ opacity: 0 }} />
      <div className="hero-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38%] bg-gradient-to-b from-[#050206]/85 to-transparent landscape:hidden" style={{ opacity: 0 }} />
      <div className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[48%] bg-gradient-to-t from-[#050206]/95 via-[#050206]/70 to-transparent landscape:hidden" style={{ opacity: 0 }} />

      <div className="landscape:max-w-[56%]">
        <p className="hero-fade eyebrow flex items-center gap-3" style={{ opacity: 0 }}>
          <span className="red-dot" /> Live from {profile.location}
        </p>
        <h1 style={{ opacity: 0 }} className="hero-title mt-3 font-display leading-[0.9] tracking-[0.01em] text-[clamp(3.4rem,17vw,7.5rem)] landscape:text-[clamp(2.7rem,6.3vw,6.6rem)]">
          <span className="sr-only">{profile.name}</span>
          <span className="neon-text block landscape:inline">
            <Chars text={profile.first} />
          </span>
          <span className="hidden landscape:inline"> </span>
          <span className="neon-red block landscape:inline">
            <Chars text={profile.last} />
          </span>
        </h1>
        <p className="hero-fade h-display mt-3 text-2xl md:text-3xl lg:text-[2.1rem] short:!mt-1" style={{ opacity: 0 }}>
          Data Analyst <span className="text-[#ff3350]">&</span> MIS Executive
        </p>
      </div>

      <div className="mt-auto max-w-[37.5rem] landscape:mt-6 landscape:max-w-[min(37.5rem,54vw)] short:!mt-3">
        <div className="hero-fade glass-strong neon-edge rounded-3xl p-4 md:p-5" style={{ opacity: 0 }}>
          <div className="flex gap-4 md:gap-5">
            <Photo />
            <div className="min-w-0 flex-1">
              <p className="label !text-[#ff4a62]">Player profile</p>
              <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2.5 lg:grid-cols-2 short:!grid-cols-3 short:gap-x-4">
                {playerCard.map((row, i) => (
                  <div key={row.k} className={i === 0 || i === 3 || i === 4 ? 'hidden lg:block' : ''}>
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/65">{row.k}</dt>
                    <dd className="text-[0.92rem] font-medium leading-snug text-white">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="hero-fade mt-4 flex flex-wrap items-center gap-3" style={{ opacity: 0 }}>
          <Magnetic>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('projects')
              }}
              className="glass neon-edge inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white"
            >
              View projects <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resume}
              download
              className="inline-flex items-center gap-2 rounded-full bg-[#ff1f3d] px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_30px_rgba(255,31,61,0.55)]"
            >
              Resume <span aria-hidden>↓</span>
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="hero-fade absolute bottom-8 right-8 hidden flex-col items-end gap-2 lg:landscape:flex" style={{ opacity: 0 }}>
        <p className="eyebrow">Scroll to start the innings</p>
        <span className="relative h-12 w-px overflow-hidden bg-white/25">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-[#ff1f3d]" />
        </span>
      </div>
    </section>
  )
}
