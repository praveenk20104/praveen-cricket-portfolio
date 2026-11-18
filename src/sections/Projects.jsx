import { useEffect, useRef } from 'react'
import { projects, profile } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'
import { isTouch, reducedMotion } from '../lib/store'
import { shatter } from '../lib/shatter'

function ProjectRow({ project: p, flip }) {
  const shot = useRef()
  const layer = useRef()
  const last = useRef(0)

  // hover: the cursor becomes a bat and the glass over the screenshot shatters
  useEffect(() => {
    if (isTouch) return
    const el = shot.current
    const enter = (e) => {
      const now = performance.now()
      if (reducedMotion || now - last.current < 800) return
      last.current = now
      const r = el.getBoundingClientRect()
      shatter(el, layer.current, e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('mouseenter', enter)
    return () => el.removeEventListener('mouseenter', enter)
  }, [])

  return (
    <article data-reveal="pop" className="glass-strong neon-edge grid gap-6 rounded-[2rem] p-4 md:p-6 lg:grid-cols-12 lg:gap-8">
      <div className={`relative lg:col-span-7 ${flip ? 'lg:order-2' : ''}`} style={{ perspective: '900px' }}>
        <a
          ref={shot}
          href={p.link}
          target="_blank"
          rel="noreferrer"
          data-cursor="bat"
          aria-label={`${p.title}: open the project on GitHub`}
          className="group relative block overflow-hidden rounded-2xl border border-white/15 bg-black"
        >
          <img
            src={p.image}
            alt={`Screenshot of the ${p.title} dashboard`}
            loading="lazy"
            width="1400"
            height="790"
            className="aspect-[16/9] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-[#ff1f3d] px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white">
            Real dashboard
          </span>
        </a>
        <div ref={layer} className="pointer-events-none absolute inset-0 z-10 rounded-2xl" style={{ perspective: '700px' }} />
      </div>

      <div className="flex flex-col lg:col-span-5 lg:py-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl leading-none text-[#ff3350]">{p.no}</span>
          <span className="label !text-[#ff7083]">{p.tagline}</span>
        </div>
        <h3 className="mt-3 font-display text-3xl leading-[1.02] tracking-wide text-white md:text-[2.5rem]">{p.title}</h3>
        <p className="body mt-3">{p.text}</p>
        <ul className="mt-4 space-y-2">
          {p.points.map((pt) => (
            <li key={pt} className="flex gap-3 text-[0.97rem] leading-relaxed text-white/90">
              <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff1f3d]" />
              {pt}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-4">
          {p.metric.map((m) => (
            <div key={m.l}>
              <div className="font-display text-3xl tracking-wide text-white">{m.v}</div>
              <div className="label !text-[0.68rem]">{m.l}</div>
            </div>
          ))}
        </div>
        <Chips items={p.stack} className="mt-5" />
        <a
          href={p.link}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-max items-center gap-2 rounded-full border border-[#ff1f3d]/70 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-white transition hover:bg-[#ff1f3d]"
        >
          View on GitHub ↗
        </a>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="relative px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Eyebrow no="07">Match-winning knocks</Eyebrow>
            <h2 data-reveal className="h-display mt-5 text-[clamp(2.7rem,6vw,5.6rem)]">
              Projects that <span className="neon-red">hit</span> the boundary.
            </h2>
          </div>
          <p data-reveal className="body max-w-sm !text-[0.95rem]">
            {isTouch ? 'Tap a screenshot to open the full project on GitHub.' : 'Hover a screenshot: your cursor becomes the bat. Click to open the project on GitHub.'}
          </p>
        </div>

        <div className="mt-12 space-y-8 md:space-y-10">
          {projects.map((p, i) => (
            <ProjectRow key={p.title} project={p} flip={i % 2 === 1} />
          ))}
        </div>

        <div data-reveal className="mt-10 flex justify-center">
          <a href={profile.github} target="_blank" rel="noreferrer" className="glass neon-edge rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-white">
            All repositories on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  )
}
