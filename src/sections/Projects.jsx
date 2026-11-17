import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, profile } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'
import { isTouch, reducedMotion } from '../lib/store'
import { hitSix } from '../lib/sixFx'

function ProjectCard({ project: p }) {
  const card = useRef()
  const shot = useRef()
  const layer = useRef()
  const last = useRef(0)

  useEffect(() => {
    if (reducedMotion) return
    const fire = (x, y) => {
      const now = performance.now()
      if (now - last.current < 900) return
      last.current = now
      hitSix(layer.current, x, y)
      gsap.fromTo(shot.current, { scale: 0.965 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    }

    // phones and tablets: hit one six as each card scrolls into view
    if (isTouch) {
      const st = ScrollTrigger.create({
        trigger: card.current,
        start: 'top 70%',
        once: true,
        onEnter: () => setTimeout(() => fire(shot.current.offsetWidth * 0.42, shot.current.offsetHeight * 0.62), 350),
      })
      return () => st.kill()
    }

    // desktop: the cursor is the bat. Touch the screenshot to hit the ball; the card tilts in 3D
    const el = card.current
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 9)
      rx(-py * 7)
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    const enterShot = (e) => {
      const r = shot.current.getBoundingClientRect()
      fire(e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    shot.current.addEventListener('mouseenter', enterShot)
    const s = shot.current
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      s.removeEventListener('mouseenter', enterShot)
    }
  }, [])

  return (
    <div data-reveal="pop" style={{ perspective: '1200px' }}>
      <article ref={card} className="glass-strong neon-edge group relative flex h-full flex-col rounded-[1.75rem] p-4 md:p-5" style={{ transformStyle: 'preserve-3d' }}>
        {/* light glare that follows the cursor */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,49,80,0.16), transparent 60%)' }}
        />
        <div className="relative">
          <a
            ref={shot}
            href={p.link}
            target="_blank"
            rel="noreferrer"
            data-cursor="bat"
            aria-label={`${p.title}: open the project on GitHub`}
            className="relative block overflow-hidden rounded-2xl border border-white/15 bg-black"
          >
            <img
              src={p.image}
              alt={`Screenshot of the ${p.title} dashboard`}
              loading="lazy"
              width="1400"
              height="790"
              className="aspect-[16/9] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute left-3 top-3 rounded-md bg-[#ff1f3d] px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white">
              Real dashboard
            </span>
          </a>
          <div ref={layer} className="fx-layer" aria-hidden="true" />
        </div>

        <div className="mt-5 flex items-center gap-3" style={{ transform: 'translateZ(30px)' }}>
          <span className="font-display text-3xl leading-none text-[#ff3350]">{p.no}</span>
          <span className="label !text-[#ff7083]">{p.tagline}</span>
        </div>
        <h3 className="mt-2 font-display text-[1.9rem] leading-[1.04] tracking-wide text-white md:text-[2.2rem]" style={{ transform: 'translateZ(40px)' }}>
          {p.title}
        </h3>
        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-white/92">{p.text}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-4">
          {p.metric.map((m) => (
            <div key={m.l}>
              <div className="font-display text-2xl tracking-wide text-white md:text-3xl">{m.v}</div>
              <div className="label !text-[0.64rem]">{m.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <Chips items={p.stack} />
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#ff1f3d]/70 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white transition hover:bg-[#ff1f3d]"
          >
            GitHub ↗
          </a>
        </div>
      </article>
    </div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="relative px-5 py-24 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Eyebrow no="06">Match-winning knocks</Eyebrow>
            <h2 data-reveal className="h-display mt-5 text-[clamp(2.6rem,5.6vw,5.2rem)]">
              Projects that <span className="neon-red">hit</span> the boundary.
            </h2>
          </div>
          <p data-reveal className="body max-w-sm !text-[0.95rem]">
            {isTouch ? 'Tap a dashboard to open the full project on GitHub.' : 'Your cursor is the bat: touch a dashboard to hit it for six. Click to open the project on GitHub.'}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:gap-6 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>

        <div data-reveal className="mt-8 flex justify-center">
          <a href={profile.github} target="_blank" rel="noreferrer" className="glass neon-edge rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-white">
            All repositories on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  )
}
