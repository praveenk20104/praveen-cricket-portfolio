import gsap from 'gsap'

// Glass-shatter burst: shards fly out from the point of impact and crack lines race across the card.
export function shatter(card, layer, x, y) {
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
    p.setAttribute('stroke', i % 3 === 0 ? 'rgba(255,60,90,0.9)' : 'rgba(255,255,255,0.8)')
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
  gsap
    .timeline({ onComplete: () => created.forEach((el) => el.remove()) })
    .to(paths, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.out', stagger: 0.012 })
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
