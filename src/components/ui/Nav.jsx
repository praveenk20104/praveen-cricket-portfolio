import { useEffect, useState } from 'react'
import { onSectionChange, scrollToId } from '../../lib/store'
import { profile } from '../../data/profile'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Career' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]
const INDEX = { hero: 0, about: 1, skills: 2, career: 3, projects: 4, contact: 5 }

export default function Nav() {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => onSectionChange(setActive), [])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header className="nav-intro pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 md:pt-6" style={{ opacity: 0 }}>
        <nav className="glass pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full py-2 pl-3 pr-2 md:pl-4">
          <a href="#hero" onClick={go('hero')} className="flex items-center gap-3" aria-label="Back to top">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff4a5c,#a50f1b_55%,#3a0408)] shadow-[0_0_18px_rgba(255,31,61,0.55)]">
              <span className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-[#f4e9d6]/80" />
            </span>
            <span className="font-display text-lg tracking-wider">
              PK<span className="text-[#ff1f3d]">.</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  className={`relative rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    active === INDEX[l.id] ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {active === INDEX[l.id] && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-[#ff1f3d]/15 ring-1 ring-[#ff1f3d]/50" />
                  )}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={profile.resume}
              download
              className="hidden rounded-full bg-[#ff1f3d] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white shadow-[0_0_24px_rgba(255,31,61,0.5)] transition hover:bg-[#ff3b55] sm:inline-block"
            >
              Resume ↓
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-px w-5 bg-white transition ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-px w-5 bg-white transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`glass-strong fixed inset-0 z-30 flex flex-col justify-center px-8 transition-all duration-500 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <p className="eyebrow mb-6">Field placements</p>
        {LINKS.map((l, i) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            onClick={go(l.id)}
            className="flex items-baseline gap-4 border-b border-white/10 py-4 font-display text-5xl tracking-wide"
          >
            <span className="font-mono text-xs text-[#ff1f3d]">0{i + 1}</span>
            {l.label}
          </a>
        ))}
        <a href={profile.resume} download className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-[#ff1f3d]">
          Download resume ↓
        </a>
      </div>
    </>
  )
}
