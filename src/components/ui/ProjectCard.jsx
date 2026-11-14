import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { isTouch, reducedMotion } from '../../lib/store'

/* Small decorative neon charts — one style per project */
function MiniChart({ type }) {
  const common = { fill: 'none', stroke: '#ff1f3d', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 240 110" className="h-full w-full" style={{ filter: 'drop-shadow(0 0 8px rgba(255,31,61,0.6))' }}>
      <g stroke="rgba(255,255,255,0.08)">
        {[20, 45, 70, 95].map((y) => (
          <line key={y} x1="0" x2="240" y1={y} y2={y} />
        ))}
      </g>
      {type === 'bars' &&
        [38, 62, 50, 84, 70, 92, 58, 76].map((h, i) => (
          <rect
            key={i}
            x={10 + i * 28}
            y={100 - h}
            width="16"
            height={h}
            rx="3"
            fill={i === 5 ? '#ff1f3d' : 'rgba(255,31,61,0.35)'}
            stroke="none"
          />
        ))}
      {type === 'line' && (
        <>
          <path d="M5 85 L35 70 L65 76 L95 48 L125 56 L155 30 L185 40 L235 14" {...common} />
          <path d="M5 95 L35 88 L65 90 L95 72 L125 80 L155 62 L185 66 L235 50" {...common} stroke="rgba(255,255,255,0.45)" />
          {[[95, 48], [155, 30], [235, 14]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="4" fill="#ff1f3d" stroke="none" />
          ))}
        </>
      )}
      {type === 'donut' && (
        <g transform="translate(70 55)">
          <circle r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="14" fill="none" />
          <circle r="36" stroke="#ff1f3d" strokeWidth="14" fill="none" strokeDasharray="140 226" transform="rotate(-90)" />
          <circle r="36" stroke="rgba(255,31,61,0.45)" strokeWidth="14" fill="none" strokeDasharray="50 226" strokeDashoffset="-142" transform="rotate(-90)" />
          <g transform="translate(80 -30)" fill="rgba(255,255,255,0.6)">
            {[0, 20, 40].map((y, i) => (
              <rect key={y} x="0" y={y} width={[90, 64, 40][i]} height="8" rx="4" fill={i === 0 ? '#ff1f3d' : 'rgba(255,255,255,0.3)'} />
            ))}
          </g>
        </g>
      )}
      {type === 'scatter' &&
        [[20, 80], [40, 64], [55, 72], [70, 50], [88, 58], [104, 38], [120, 46], [140, 30], [160, 42], [178, 22], [196, 34], [220, 16], [60, 88], [150, 66], [200, 60]].map(
          ([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 6 : 4} fill={i % 3 === 0 ? '#ff1f3d' : 'rgba(255,255,255,0.5)'} stroke="none" />
        )}
    </svg>
  )
}

/* Build glass shards radiating from the impact point */
function shatter(card, layer, x, y) {
  const w = card.offsetWidth
  const h = card.offsetHeight
  const pieces = 11
  const R = Math.hypot(w, h)
  const frag = document.createDocumentFragment()
  const shards = []
  let a0 = Math.random() * Math.PI * 2
  for (let i = 0; i < pieces; i++) {
    const a1 = a0 + ((Math.PI * 2) / pieces) * (0.7 + Math.random() * 0.6)
    const r1 = 26 + Math.random() * 40
    const pts = [
      [x, y],
      [x + Math.cos(a0) * r1, y + Math.sin(a0) * r1],
      [x + Math.cos(a0) * R, y + Math.sin(a0) * R],
      [x + Math.cos(a1) * R, y + Math.sin(a1) * R],
      [x + Math.cos(a1) * r1 * 1.1, y + Math.sin(a1) * r1 * 1.1],
    ]
    const el = document.createElement('div')
    el.className = 'shard'
    el.style.clipPath = `polygon(${pts.map(([px, py]) => `${px}px ${py}px`).join(',')})`
    const mid = (a0 + a1) / 2
    shards.push({ el, dx: Math.cos(mid), dy: Math.sin(mid) })
    frag.appendChild(el)
    a0 = a1
  }
  // crack lines
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'crack')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  for (let i = 0; i < 9; i++) {
    const a = Math.random() * Math.PI * 2
    let px = x
    let py = y
    let d = `M${px} ${py}`
    const segs = 4 + Math.floor(Math.random() * 4)
    for (let s = 0; s < segs; s++) {
      const len = 14 + Math.random() * 34
      const aa = a + (Math.random() - 0.5) * 0.7
      px += Math.cos(aa) * len
      py += Math.sin(aa) * len
      d += ` L${px.toFixed(1)} ${py.toFixed(1)}`
    }
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', d)
    p.setAttribute('fill', 'none')
    p.setAttribute('stroke', i % 3 === 0 ? 'rgba(255,60,90,0.9)' : 'rgba(255,255,255,0.75)')
    p.setAttribute('stroke-width', i % 3 === 0 ? '1.4' : '0.9')
    svg.appendChild(p)
  }
  frag.appendChild(svg)
  layer.appendChild(frag)

  const paths = svg.querySelectorAll('path')
  paths.forEach((p) => {
    const L = p.getTotalLength()
    p.style.strokeDasharray = L
    p.style.strokeDashoffset = L
  })
  const created = [...shards.map((s) => s.el), svg]
  const tl = gsap.timeline({ onComplete: () => created.forEach((el) => el.remove()) })
  tl.to(paths, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.out', stagger: 0.012 })
    .to(svg, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.35)
    .fromTo(
      shards.map((s) => s.el),
      { opacity: 0.9, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0 },
      {
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
        x: (i) => shards[i].dx * (40 + Math.random() * 70),
        y: (i) => shards[i].dy * (40 + Math.random() * 70) + 20,
        z: () => 60 + Math.random() * 140,
        rotationX: () => (Math.random() - 0.5) * 90,
        rotationY: () => (Math.random() - 0.5) * 90,
        rotationZ: () => (Math.random() - 0.5) * 30,
        stagger: 0.01,
      },
      0.05
    )
}

export default function ProjectCard({ project }) {
  const wrap = useRef()
  const card = useRef()
  const layer = useRef()
  const last = useRef(0)

  useEffect(() => {
    if (isTouch) return
    const el = card.current
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 12)
      rx(-py * 10)
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
    const enter = (e) => {
      const now = performance.now()
      if (reducedMotion || now - last.current < 700) return
      last.current = now
      const r = el.getBoundingClientRect()
      shatter(el, layer.current, e.clientX - r.left, e.clientY - r.top)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  const p = project
  return (
    <div ref={wrap} className="relative" style={{ perspective: '1100px' }} data-reveal="pop">
      <a
        ref={card}
        href={p.link}
        target="_blank"
        rel="noreferrer"
        data-cursor="bat"
        aria-label={`${p.title} — open on GitHub`}
        className="glass neon-edge group relative block overflow-hidden rounded-3xl p-6 md:p-7"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* cursor-follow glow */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(255,31,61,0.18), transparent 60%)' }}
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#ff1f3d]">{p.no}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65 transition-colors group-hover:border-[#ff1f3d] group-hover:text-white">
            GitHub ↗
          </span>
        </div>

        <div className="mt-5 h-32 rounded-2xl border border-white/8 bg-black/30 p-3 md:h-36" style={{ transform: 'translateZ(30px)' }}>
          <MiniChart type={p.chart} />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff4a5f]">{p.tagline}</p>
        <h3 className="mt-2 font-display text-[1.9rem] leading-none tracking-wide md:text-4xl" style={{ transform: 'translateZ(40px)' }}>
          {p.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-[15px]">{p.text}</p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <ul className="flex flex-wrap gap-2">
            {p.stack.map((t) => (
              <li key={t} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
                {t}
              </li>
            ))}
          </ul>
          <div className="flex gap-5">
            {p.metric.map((m) => (
              <div key={m.l} className="text-right">
                <div className="font-display text-2xl tracking-wide">{m.v}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">{m.l}</div>
              </div>
            ))}
          </div>
        </div>

      </a>
      {/* shatter layer lives outside the card so shards can fly beyond its edges */}
      <div ref={layer} className="pointer-events-none absolute inset-0 z-10 rounded-3xl" style={{ perspective: '700px' }} />
    </div>
  )
}
