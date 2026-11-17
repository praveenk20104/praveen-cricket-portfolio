import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store, isTouch } from '../../lib/store'

// Camera "shots", one per section. s = scroll stage (see `sections` in data/profile.js).
// Extra in-between keys (0.5, 0.8, 1.5) steer the camera around the big match ball.
const KEYS_WIDE = [
  { s: 0, pos: [1.6, 1.25, -5.5], look: [-1.46, 1.0, -8.75] }, // hero: batter on the right, profile on the left
  { s: 0.5, pos: [2.6, 2.0, 5.5], look: [-0.8, 1.4, -6] }, // pull back down the pitch
  { s: 0.8, pos: [1.7, 2.4, 12.2], look: [-0.9, 1.9, 2] },
  { s: 1, pos: [-4.2, 2.3, 14.2], look: [-1.62, 2.25, 9] }, // match ball, batter far behind it
  { s: 1.5, pos: [2.5, 3.3, 9.6], look: [-0.6, 1.2, 1] },
  { s: 2, pos: [1.2, 3.3, 4.2], look: [-1.1, 0.3, -4.5] }, // about: over the pitch
  { s: 3, pos: [-1.9, 0.6, 7.3], look: [0.7, 0.7, 10.06] }, // services: low by the bowler's stumps
  { s: 4, pos: [0.8, 0.5, 2.6], look: [-0.1, 0.4, -10] }, // game plan: deliveries fly past
  { s: 5, pos: [1.15, 1.0, -6.9], look: [-0.85, 0.55, -10.06] }, // skills: close on the stumps
  { s: 6, pos: [-7.8, 2.4, -2.5], look: [-0.5, 0.6, -2.5] }, // career: square-leg broadcast angle
  { s: 7, pos: [0.01, 30, 4], look: [0, 0, -3] }, // projects: spider-cam, sixes flying out
  { s: 8, pos: [6, 3.2, 17], look: [-21, 11, -92] }, // training: big screen + fireworks
  { s: 9, pos: [-1.9, 2.5, 15.2], look: [-2.1, 2.1, 9] }, // contact: ball on the right
]
const KEYS_TALL = [
  { s: 0, pos: [1.0, 1.5, -3.5], look: [-0.3, 0.7, -8.75] },
  { s: 0.5, pos: [2.4, 2.2, 5.5], look: [-0.4, 1.2, -6] },
  { s: 0.8, pos: [2.0, 2.5, 12], look: [-0.3, 1.6, 1] },
  { s: 1, pos: [0, 2.5, 17.5], look: [0, 0.55, 9] },
  { s: 1.5, pos: [2.4, 3.6, 10], look: [0, 1, 1] },
  { s: 2, pos: [0.6, 4.2, 6.5], look: [0, 0.2, -3] },
  { s: 3, pos: [-1.6, 0.8, 6.4], look: [0.4, 0.8, 10.06] },
  { s: 4, pos: [0.6, 0.7, 3.6], look: [0, 0.4, -10] },
  { s: 5, pos: [0.7, 1.3, -6.2], look: [0, 0.75, -10.06] },
  { s: 6, pos: [-9, 3, -2.5], look: [0, 0.4, -2.5] },
  { s: 7, pos: [0.01, 34, 4], look: [0, 0, -2] },
  { s: 8, pos: [4, 3.5, 20], look: [-21, 16, -92] },
  { s: 9, pos: [0, 2.6, 17.5], look: [0, 0.9, 9] },
]
// Walk-in: the camera follows the batter from behind (name and number on his back),
// then swings round his side to the hero shot as he takes guard
const INTRO_WIDE = [[6.27, 1.45, -16.6], [4.08, 1.5, -13.98], [3.9, 1.5, -9.6]]
const INTRO_TALL = [[6.6, 1.6, -17.0], [4.4, 1.7, -14.4], [3.4, 1.7, -9.0]]

const v3 = (a) => new THREE.Vector3(...a)

function build(keys, intro) {
  return {
    stages: keys.map((k) => k.s),
    pos: new THREE.CatmullRomCurve3(keys.map((k) => v3(k.pos)), false, 'centripetal'),
    look: new THREE.CatmullRomCurve3(keys.map((k) => v3(k.look)), false, 'centripetal'),
    intro: new THREE.CatmullRomCurve3([...intro.map(v3), v3(keys[0].pos)], false, 'centripetal'),
    heroLook: v3(keys[0].look),
  }
}

function stageToT(stages, s) {
  const n = stages.length - 1
  const c = THREE.MathUtils.clamp(s, stages[0], stages[n])
  for (let i = 0; i < n; i++) {
    if (c <= stages[i + 1]) return (i + (c - stages[i]) / (stages[i + 1] - stages[i])) / n
  }
  return 1
}

const damp = THREE.MathUtils.damp

export default function CameraRig() {
  const { camera, size } = useThree()
  const wide = useMemo(() => build(KEYS_WIDE, INTRO_WIDE), [])
  const tall = useMemo(() => build(KEYS_TALL, INTRO_TALL), [])
  const cur = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), init: false })
  const par = useRef({ x: 0, y: 0 })
  const P = useMemo(() => new THREE.Vector3(), [])
  const L = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const aspect = size.width / size.height
    const portrait = aspect <= 1 // same rule as the CSS `portrait:` layouts
    const c = portrait ? tall : wide

    const fov = portrait ? 56 : aspect < 1.3 ? 50 : 42
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    // On squarer landscape screens (iPad, 4:3 monitors) turn the hero shot a little, so the batter
    // stands clear of the profile card instead of behind it
    const heroShift = portrait ? 0 : THREE.MathUtils.clamp((1.78 - aspect) * 1.15, 0, 0.6)

    if (store.intro < 1) {
      // walk-in: follow the batter, then settle on the hero framing
      c.intro.getPoint(store.intro, P)
      const k = THREE.MathUtils.smoothstep(store.intro, 0.62, 1)
      L.set(store.batsman.x, 1.2, store.batsman.z).lerp(c.heroLook, k)
      L.x -= heroShift * k
    } else {
      const t = stageToT(c.stages, store.stage)
      c.pos.getPoint(t, P)
      c.look.getPoint(t, L)
      L.x -= heroShift * (1 - THREE.MathUtils.smoothstep(store.stage, 0, 0.6))
    }

    // subtle mouse parallax on desktop
    if (!isTouch) {
      par.current.x = damp(par.current.x, store.mouse.x, 2.5, dt)
      par.current.y = damp(par.current.y, store.mouse.y, 2.5, dt)
      const amt = store.stage > 6.5 && store.stage < 7.5 ? 1.2 : 0.22
      P.x += par.current.x * amt
      P.y += par.current.y * amt * 0.5
    }

    const s = cur.current
    if (!s.init) {
      s.pos.copy(P)
      s.look.copy(L)
      s.init = true
    }
    const l = 5.5
    s.pos.set(damp(s.pos.x, P.x, l, dt), damp(s.pos.y, P.y, l, dt), damp(s.pos.z, P.z, l, dt))
    s.look.set(damp(s.look.x, L.x, l, dt), damp(s.look.y, L.y, l, dt), damp(s.look.z, L.z, l, dt))

    camera.position.copy(s.pos)
    camera.lookAt(s.look)
    store.look.x = s.look.x
    store.look.y = s.look.y
    store.look.z = s.look.z
  })

  return null
}
