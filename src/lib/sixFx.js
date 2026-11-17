import gsap from 'gsap'

// "Hit for six": the bat meets the ball where the cursor touched the card. The ball rockets
// away into the distance (real 3D depth via CSS perspective) with a glowing trail, sparks and
// a shockwave burst from the point of impact, and a broadcast-style SIX! badge flips in.
const el = (cls, parent) => {
  const d = document.createElement('div')
  d.className = cls
  parent.appendChild(d)
  return d
}

export function hitSix(layer, x, y) {
  const w = layer.offsetWidth
  const h = layer.offsetHeight
  const made = []
  const add = (cls) => {
    const d = el(cls, layer)
    made.push(d)
    return d
  }
  const tl = gsap.timeline({ onComplete: () => made.forEach((d) => d.remove()) })

  // impact flash + two shockwave rings
  const flash = add('fx-flash')
  gsap.set(flash, { x, y, xPercent: -50, yPercent: -50 })
  tl.fromTo(flash, { scale: 0.2, opacity: 1 }, { scale: 1.7, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0)
  ;['fx-ring', 'fx-ring fx-ring--white'].forEach((cls, i) => {
    const r = add(cls)
    gsap.set(r, { x, y, xPercent: -50, yPercent: -50 })
    tl.fromTo(r, { scale: 0.3, opacity: 1 }, { scale: 5 + i, opacity: 0, duration: 0.75, ease: 'power3.out' }, i * 0.07)
  })

  // sparks fly out from the bat
  for (let i = 0; i < 18; i++) {
    const s = add('fx-spark')
    const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3
    const dist = 60 + Math.random() * 90
    gsap.set(s, { x, y, rotation: (a * 180) / Math.PI + 90, xPercent: -50, yPercent: -50 })
    tl.to(s, { x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist, opacity: 0, scaleY: 0.3, duration: 0.5 + Math.random() * 0.35, ease: 'power3.out' }, 0)
  }

  // the ball: off the card towards the far stands, shrinking into the distance
  const dx = w - x + 140 + Math.random() * 120
  const rise = 260 + h * 0.5
  const path = (u, o) => {
    o.x = x + dx * u
    o.y = y - rise * u + 120 * u * u
    o.z = -620 * u
    o.rotation = 1080 * u
    o.scale = 1 - 0.3 * u
    return o
  }
  const ghosts = [0, 1, 2, 3, 4, 5].map((k) => {
    const b = add(k === 0 ? 'fx-ball' : 'fx-ball fx-ball--ghost')
    gsap.set(b, { x, y, opacity: k === 0 ? 1 : 0.55 - k * 0.08, scale: k === 0 ? 1 : 1 - k * 0.1 })
    return { b, lag: k * 0.045, base: k === 0 ? 1 : 0.55 - k * 0.08 }
  })
  const o = {}
  const prog = { u: 0 }
  tl.to(
    prog,
    {
      u: 1.25,
      duration: 1.15,
      ease: 'none',
      onUpdate: () => {
        ghosts.forEach(({ b, lag, base }) => {
          const u = Math.max(0, Math.min(1, prog.u - lag))
          path(u, o)
          gsap.set(b, { x: o.x, y: o.y, z: o.z, rotation: o.rotation, scale: o.scale * (lag ? 1 - lag * 2 : 1), opacity: base * (1 - Math.max(0, (u - 0.7) / 0.3)) })
        })
      },
    },
    0.02
  )

  // broadcast badge
  const six = Math.random() < 0.7
  const badge = add('fx-six')
  badge.innerHTML = `<span class="fx-six__big">${six ? 'SIX!' : 'FOUR!'}</span><span class="fx-six__small">${six ? 'Maximum · 6 runs' : 'Boundary · 4 runs'}</span>`
  tl.fromTo(badge, { rotationX: -100, scale: 0.6, opacity: 0, transformOrigin: '50% 100%' }, { rotationX: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, 0.12)
  tl.to(badge, { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' }, 1.25)
  return tl
}
