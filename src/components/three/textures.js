import * as THREE from 'three'

// All textures are generated in code: zero downloads, instant load, crisp at any size.

function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function finish(tex, { srgb = false, repeat = false, aniso = 8 } = {}) {
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = aniso
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  else tex.wrapS = THREE.RepeatWrapping
  tex.needsUpdate = true
  return tex
}

/* ------------------------------------------------------------------ */
/*  CRICKET BALL — leather colour, bump (pores, seams) and rough/metal */
/* ------------------------------------------------------------------ */
export function createBallTextures(size = 2048) {
  const W = size
  const H = size / 2
  const k = W / 2048
  const rand = rng(11)

  const color = canvas(W, H)
  const bump = canvas(W, H)
  const rm = canvas(W, H) // G = roughness, B = metalness (three.js convention)
  const c = color.getContext('2d')
  const b = bump.getContext('2d')
  const r = rm.getContext('2d')

  // Base leather
  const g = c.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#5e070d')
  g.addColorStop(0.5, '#820b14')
  g.addColorStop(1, '#5a070d')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  b.fillStyle = 'rgb(128,128,128)'
  b.fillRect(0, 0, W, H)
  r.fillStyle = 'rgb(0,135,0)' // roughness ≈ 0.53
  r.fillRect(0, 0, W, H)

  // Polish / wear blotches (wrapped horizontally so there is no visible seam)
  const blot = (x, y, rad, col) => {
    for (const ox of [-W, 0, W]) {
      const gx = x + ox
      if (gx + rad < 0 || gx - rad > W) continue
      const rg = c.createRadialGradient(gx, y, 0, gx, y, rad)
      rg.addColorStop(0, col)
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = rg
      c.fillRect(gx - rad, y - rad, rad * 2, rad * 2)
    }
  }
  for (let i = 0; i < 160; i++) {
    const dark = rand() < 0.55
    blot(rand() * W, rand() * H, (0.015 + rand() * 0.07) * W, dark ? 'rgba(35,0,4,0.25)' : 'rgba(255,95,95,0.09)')
  }
  // Shiny side vs rough side (classic swing ball look)
  const shine = r.createLinearGradient(0, 0, W, 0)
  shine.addColorStop(0, 'rgba(0,70,0,0.55)')
  shine.addColorStop(0.5, 'rgba(0,150,0,0.35)')
  shine.addColorStop(1, 'rgba(0,70,0,0.55)')
  r.fillStyle = shine
  r.fillRect(0, 0, W, H)

  // Scuffs and scratches
  c.lineCap = b.lineCap = 'round'
  for (let i = 0; i < 320; i++) {
    const x = rand() * W
    const y = H * 0.08 + rand() * H * 0.84
    const len = (4 + rand() * 34) * k
    const a = rand() * Math.PI
    const lw = (0.6 + rand() * 1.8) * k
    const light = rand() < 0.45
    c.strokeStyle = light ? `rgba(235,150,150,${0.05 + rand() * 0.1})` : `rgba(25,0,3,${0.08 + rand() * 0.15})`
    c.lineWidth = lw
    c.beginPath()
    c.moveTo(x, y)
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    c.stroke()
    b.strokeStyle = `rgba(80,80,80,${0.25 + rand() * 0.3})`
    b.lineWidth = lw
    b.beginPath()
    b.moveTo(x, y)
    b.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    b.stroke()
  }

  // Quarter seams: top hemisphere at u = 0 / 0.5, bottom at u = 0.25 / 0.75 (they meet the main seam at 90°)
  const quarter = (x, y0, y1) => {
    for (const ox of [-W, 0, W]) {
      const gx = x + ox
      if (gx < -20 || gx > W + 20) continue
      c.strokeStyle = 'rgba(30,0,4,0.75)'
      c.lineWidth = 2.2 * k
      c.beginPath()
      c.moveTo(gx, y0)
      c.lineTo(gx, y1)
      c.stroke()
      b.strokeStyle = 'rgb(40,40,40)'
      b.lineWidth = 3.4 * k
      b.beginPath()
      b.moveTo(gx, y0)
      b.lineTo(gx, y1)
      b.stroke()
      // hidden stitch dimples either side
      for (let y = Math.min(y0, y1) + 6 * k; y < Math.max(y0, y1) - 6 * k; y += 9 * k) {
        for (const side of [-1, 1]) {
          const dx = side * 7 * k
          c.fillStyle = 'rgba(25,0,3,0.5)'
          c.fillRect(gx + dx - 1.2 * k, y, 2.4 * k, 4 * k)
          b.fillStyle = 'rgb(70,70,70)'
          b.fillRect(gx + dx - 1.2 * k, y, 2.4 * k, 4 * k)
        }
      }
    }
  }
  quarter(0, 0, H / 2)
  quarter(W * 0.5, 0, H / 2)
  quarter(W * 0.25, H / 2, H)
  quarter(W * 0.75, H / 2, H)

  // Main seam groove under the 3D stitches
  c.fillStyle = 'rgba(20,0,2,0.9)'
  c.fillRect(0, H / 2 - 2 * k, W, 4 * k)
  b.fillStyle = 'rgb(20,20,20)'
  b.fillRect(0, H / 2 - 3 * k, W, 6 * k)

  // Gold-foil stamp (also written into metalness so it really reflects)
  const stamp = (cx, cy, lines) => {
    for (const [ctx, mode] of [[c, 'color'], [b, 'bump'], [r, 'rm']]) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(0.78, 1) // counters equirect stretch at this latitude
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      if (mode === 'color') {
        const gold = ctx.createLinearGradient(0, -H * 0.06, 0, H * 0.06)
        gold.addColorStop(0, '#fff1b8')
        gold.addColorStop(0.45, '#d8a743')
        gold.addColorStop(1, '#8a5a17')
        ctx.fillStyle = gold
        ctx.strokeStyle = '#d8a743'
      } else if (mode === 'bump') {
        ctx.fillStyle = 'rgb(85,85,85)'
        ctx.strokeStyle = 'rgb(85,85,85)'
      } else {
        ctx.fillStyle = 'rgb(0,55,255)'
        ctx.strokeStyle = 'rgb(0,55,255)'
      }
      // crest
      ctx.lineWidth = 3 * k
      ctx.beginPath()
      ctx.arc(0, -H * 0.075, H * 0.03, 0, Math.PI * 2)
      ctx.stroke()
      ctx.font = `700 ${H * 0.03}px Georgia, 'Times New Roman', serif`
      ctx.fillText('PK', 0, -H * 0.073)
      lines.forEach((t, i) => {
        ctx.font = `${i === 0 ? 700 : 400} ${H * (i === 0 ? 0.034 : 0.022)}px Georgia, 'Times New Roman', serif`
        ctx.fillText(t, 0, i * H * 0.04)
      })
      ctx.restore()
    }
  }
  stamp(W * 0.25, H * 0.3, ['PRAVEEN KUMAR', '★ DATA ANALYST ★', '156g · MATCH BALL'])
  stamp(W * 0.5, H * 0.7 + H * 0.02, ['★ PREMIUM ★', 'MIS · BI · ANALYTICS'])

  // Per-pixel leather grain
  const addGrain = (ctx, amount, poreChance, poreDepth) => {
    const img = ctx.getImageData(0, 0, W, H)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * amount
      let v = n
      if (rand() < poreChance) v -= poreDepth
      d[i] = Math.max(0, Math.min(255, d[i] + v))
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + v))
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + v))
    }
    ctx.putImageData(img, 0, 0)
  }
  addGrain(c, 10, 0.05, 10)
  addGrain(b, 26, 0.07, 30)

  // Roughness noise (G channel only)
  {
    const img = r.getImageData(0, 0, W, H)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + (rand() - 0.5) * 40))
    r.putImageData(img, 0, 0)
  }

  return {
    map: finish(new THREE.CanvasTexture(color), { srgb: true }),
    bumpMap: finish(new THREE.CanvasTexture(bump)),
    roughMetalMap: finish(new THREE.CanvasTexture(rm)),
  }
}

/* ------------------------------------------------------------------ */
/*  PITCH — clay strip, cracks, foot marks and creases                 */
/* ------------------------------------------------------------------ */
export const PITCH = { width: 3.05, length: 24, stumpZ: 10.06 }

export function createPitchTexture(w = 512, h = 4096) {
  const rand = rng(5)
  const cv = canvas(w, h)
  const c = cv.getContext('2d')
  const px = (x) => ((x + PITCH.width / 2) / PITCH.width) * w
  const pz = (z) => ((z + PITCH.length / 2) / PITCH.length) * h
  const mx = w / PITCH.width // px per metre (x)
  const mz = h / PITCH.length // px per metre (z)

  c.fillStyle = '#94794f'
  c.fillRect(0, 0, w, h)
  // tonal variation
  for (let i = 0; i < 900; i++) {
    const x = rand() * w
    const y = rand() * h
    const rad = 10 + rand() * 60
    const rg = c.createRadialGradient(x, y, 0, x, y, rad)
    const t = rand()
    rg.addColorStop(0, t < 0.4 ? 'rgba(70,52,28,0.18)' : t < 0.8 ? 'rgba(220,196,150,0.12)' : 'rgba(80,110,50,0.12)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = rg
    c.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  // grassy edges
  for (const side of [0, 1]) {
    const gr = c.createLinearGradient(side ? w : 0, 0, side ? w - 60 : 60, 0)
    gr.addColorStop(0, 'rgba(60,90,40,0.55)')
    gr.addColorStop(1, 'rgba(60,90,40,0)')
    c.fillStyle = gr
    c.fillRect(side ? w - 60 : 0, 0, 60, h)
  }
  // foot-marks / rough near both ends
  for (const end of [-1, 1]) {
    for (let i = 0; i < 220; i++) {
      const z = end * (7.4 + rand() * 2.4)
      const x = (rand() - 0.5) * 1.8
      const rad = 2 + rand() * 5
      c.fillStyle = `rgba(${rand() < 0.5 ? '60,42,22' : '200,175,130'},${0.05 + rand() * 0.1})`
      c.beginPath()
      c.ellipse(px(x), pz(z), rad, rad * 1.6, rand() * Math.PI, 0, Math.PI * 2)
      c.fill()
    }
  }
  // cracks
  c.lineCap = 'round'
  for (let i = 0; i < 70; i++) {
    let x = rand() * w
    let y = rand() * h
    c.strokeStyle = `rgba(55,38,20,${0.35 + rand() * 0.4})`
    c.lineWidth = 0.6 + rand() * 1.4
    c.beginPath()
    c.moveTo(x, y)
    const steps = 6 + Math.floor(rand() * 14)
    for (let s = 0; s < steps; s++) {
      x += (rand() - 0.5) * 22
      y += (rand() - 0.3) * 30
      c.lineTo(x, y)
    }
    c.stroke()
  }
  // fine grain
  const img = c.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 22
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  c.putImageData(img, 0, 0)

  // Creases (5 cm white lines)
  c.fillStyle = 'rgba(245,242,232,0.92)'
  const line = 0.05
  for (const end of [-1, 1]) {
    const stump = end * PITCH.stumpZ
    const popping = end * (PITCH.stumpZ - 1.22)
    // bowling crease (2.64 m)
    c.fillRect(px(-1.32), pz(stump) - (line * mz) / 2, 2.64 * mx, line * mz)
    // popping crease (full width)
    c.fillRect(0, pz(popping) - (line * mz) / 2, w, line * mz)
    // return creases
    for (const sx of [-1.32, 1.32]) {
      const z0 = Math.min(pz(popping), pz(stump + end * 1.22))
      const z1 = Math.max(pz(popping), pz(stump + end * 1.22))
      c.fillRect(px(sx) - (line * mx) / 2, z0, line * mx, z1 - z0)
    }
  }
  return finish(new THREE.CanvasTexture(cv), { srgb: true })
}

/* ------------------------------------------------------------------ */
/*  OUTFIELD — mowing stripes + 30-yard circle                         */
/* ------------------------------------------------------------------ */
export function createGrassTexture(size = 2048, fieldSize = 170) {
  const rand = rng(3)
  const cv = canvas(size, size)
  const c = cv.getContext('2d')
  const stripes = 22
  for (let i = 0; i < stripes; i++) {
    c.fillStyle = i % 2 ? '#123a1b' : '#0e3016'
    c.fillRect(0, (i * size) / stripes, size, size / stripes + 1)
  }
  for (let i = 0; i < 2500; i++) {
    const x = rand() * size
    const y = rand() * size
    const rad = 6 + rand() * 40
    const rg = c.createRadialGradient(x, y, 0, x, y, rad)
    rg.addColorStop(0, rand() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(80,140,70,0.08)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = rg
    c.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  const img = c.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 18
    d[i] += n * 0.6
    d[i + 1] += n
    d[i + 2] += n * 0.5
  }
  c.putImageData(img, 0, 0)
  // 30-yard circle (dashed)
  const ppm = size / fieldSize
  c.strokeStyle = 'rgba(240,240,230,0.55)'
  c.lineWidth = 0.12 * ppm
  c.setLineDash([0.7 * ppm, 1.4 * ppm])
  c.beginPath()
  c.ellipse(size / 2, size / 2, 27.4 * ppm, 27.4 * ppm * 1.15, 0, 0, Math.PI * 2)
  c.stroke()
  return finish(new THREE.CanvasTexture(cv), { srgb: true })
}

/* ------------------------------------------------------------------ */
/*  FLOODLIGHT PANEL — grid of lamps (emissive → bloom)               */
/* ------------------------------------------------------------------ */
export function createFloodlightTexture() {
  const cv = canvas(256, 128)
  const c = cv.getContext('2d')
  c.fillStyle = '#0a0a0c'
  c.fillRect(0, 0, 256, 128)
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 8; x++) {
      const cx = 18 + x * 31
      const cy = 18 + y * 31
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 13)
      rg.addColorStop(0, '#ffffff')
      rg.addColorStop(0.55, '#fff4dc')
      rg.addColorStop(1, 'rgba(255,240,210,0)')
      c.fillStyle = rg
      c.fillRect(cx - 14, cy - 14, 28, 28)
    }
  }
  return finish(new THREE.CanvasTexture(cv), { srgb: true, aniso: 1 })
}

/* Soft round sprite used by the glow particles */
export function createGlowSprite() {
  const cv = canvas(64, 64)
  const c = cv.getContext('2d')
  const rg = c.createRadialGradient(32, 32, 0, 32, 32, 32)
  rg.addColorStop(0, 'rgba(255,255,255,1)')
  rg.addColorStop(0.25, 'rgba(255,255,255,0.6)')
  rg.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = rg
  c.fillRect(0, 0, 64, 64)
  return finish(new THREE.CanvasTexture(cv), { aniso: 1 })
}
