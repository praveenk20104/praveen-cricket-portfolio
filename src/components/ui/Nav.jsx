import { useEffect, useState } from 'react'
import { onSectionChange, scrollToId } from '../../lib/store'
import { profile, sections } from '../../data/profile'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Career' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]
const indexOf = (id) => sections.findIndex((s) => s.id === id)

export default function Nav() {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => onSectionChange(setActive), [])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }
  // highlight the last nav link whose section we have reached
  const current = LINKS.reduce((acc, l) => (indexOf(l.id) <= active ? l.id : acc), null)

  return (
    <>
      <header className="nav-intro pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 md:px-4 md:pt-5" style={{ opacity: 0 }}>
        <nav className="glass-strong pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full py-2 pl-3 pr-2 md:pl-4">
          <a href="#hero" onClick={go('hero')} className="flex items-center gap-3" aria-label="Back to top">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff4a5c,#a50f1b_55%,#3a0408)] shadow-[0_0_18px_rgba(255,31,61,0.55)]">
              <span className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-[#f4e9d6]/80" />
            </span>
            <span className="font-display text-lg tracking-wider">
              PK<span className="text-saffron">.</span>
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  className={`relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                    current === l.id ? 'text-white' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {current === l.id && <span className="absolute inset-0 -z-10 rounded-full bg-india/20 ring-1 ring-india/60" />}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={profile.resume}
              download
              className="hidden rounded-full bg-[#ff1f3d] px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(255,31,61,0.5)] transition hover:bg-[#ff3b55] sm:inline-block"
            >
              Resume ↓
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 lg:hidden"
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

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-30 flex flex-col justify-center bg-[#07030a]/97 px-8 transition-all duration-500 lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <p className="eyebrow mb-4">Field placements</p>
        {LINKS.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="flex items-baseline gap-4 border-b border-white/15 py-3.5 font-display text-4xl tracking-wide text-white">
            <span className="font-mono text-xs text-saffron">0{i + 1}</span>
            {l.label}
          </a>
        ))}
        <a href={profile.resume} download className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-saffron">
          Download resume ↓
        </a>
      </div>
    </>
  )
}
