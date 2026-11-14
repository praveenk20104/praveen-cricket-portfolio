import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store, isTouch } from '../../lib/store'

// Camera "shots" for each section. s = scroll stage.
//   0 hero → 1 about → 2 skills → 3 career → 4 projects → 5 contact
const KEYS_WIDE = [
  { s: 0, pos: [0, 2.3, 15.4], look: [0, 2.32, 9] }, // hero: ball dead centre
  { s: 0.55, pos: [1.65, 2.8, 8.6], look: [0, 1.2, 1] }, // fly past the ball
  { s: 1, pos: [1.2, 3.3, 4.2], look: [-1.1, 0.3, -4.5] }, // over the pitch
  { s: 2, pos: [1.15, 1.0, -6.9], look: [-0.85, 0.55, -10.06] }, // close on the stumps
  { s: 3, pos: [-7.8, 2.4, -2.5], look: [-0.5, 0.6, -2.5] }, // square-leg broadcast angle
  { s: 4, pos: [0.01, 14, 2.5], look: [0, 0, -1.2] }, // spider-cam aerial
  { s: 5, pos: [-1.9, 2.5, 15.2], look: [-2.1, 2.1, 9] }, // contact: ball on the right
]
const KEYS_TALL = [
  { s: 0, pos: [0, 2.5, 16.6], look: [0, 2.75, 9] }, // ball sits below the name
  { s: 0.55, pos: [1.5, 2.8, 9.4], look: [0, 1.2, 1] },
  { s: 1, pos: [0.6, 4.2, 6.5], look: [0, 0.2, -3] },
  { s: 2, pos: [0.7, 1.3, -6.2], look: [0, 0.75, -10.06] },
  { s: 3, pos: [-9, 3, -2.5], look: [0, 0.4, -2.5] },
  { s: 4, pos: [0.01, 17, 2.5], look: [0, 0, -1] },
  { s: 5, pos: [0, 2.6, 17.5], look: [0, 0.9, 9] }, // small ball high up, CTA card below
]

function buildCurves(keys) {
  return {
    stages: keys.map((k) => k.s),
    pos: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal'),
    look: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal'),
  }
}

function stageToCurveT(stages, s) {
  const n = stages.length - 1
  const c = THREE.MathUtils.clamp(s, stages[0], stages[n])
  for (let i = 0; i < n; i++) {
    if (c <= stages[i + 1]) {
      const local = (c - stages[i]) / (stages[i + 1] - stages[i])
      return (i + local) / n
    }
  }
  return 1
}

export default function CameraRig() {
  const { camera, size } = useThree()
  const wide = useMemo(() => buildCurves(KEYS_WIDE), [])
  const tall = useMemo(() => buildCurves(KEYS_TALL), [])
  const cur = useRef({ pos: new THREE.Vector3(0, 6, 26), look: new THREE.Vector3(0, 2.2, 9), init: false })
  const par = useRef({ x: 0, y: 0 })
  const tmpP = useMemo(() => new THREE.Vector3(), [])
  const tmpL = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const aspect = size.width / size.height
    const portrait = aspect < 0.85
    const curves = portrait ? tall : wide

    // FOV adapts to screen shape
    const fov = portrait ? 56 : aspect < 1.3 ? 50 : 42
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    // Smooth eased scroll stage
    const u = stageToCurveT(curves.stages, store.stage)
    curves.pos.getPoint(u, tmpP)
    curves.look.getPoint(u, tmpL)

    // Cinematic intro dolly (from high & far back)
    const k = 1 - store.intro
    tmpP.x += k * 2.5
    tmpP.y += k * 3.5
    tmpP.z += k * 11

    // Mouse parallax (desktop) — subtle, premium
    if (!isTouch) {
      par.current.x = THREE.MathUtils.damp(par.current.x, store.mouse.x, 2.5, dt)
      par.current.y = THREE.MathUtils.damp(par.current.y, store.mouse.y, 2.5, dt)
      const amt = store.stage > 3.5 && store.stage < 4.5 ? 0.6 : 0.32
      tmpP.x += par.current.x * amt
      tmpP.y += par.current.y * amt * 0.6
    }

    if (!cur.current.init) {
      cur.current.pos.copy(tmpP)
      cur.current.look.copy(tmpL)
      cur.current.init = true
    }
    const l = 5.5
    cur.current.pos.x = THREE.MathUtils.damp(cur.current.pos.x, tmpP.x, l, dt)
    cur.current.pos.y = THREE.MathUtils.damp(cur.current.pos.y, tmpP.y, l, dt)
    cur.current.pos.z = THREE.MathUtils.damp(cur.current.pos.z, tmpP.z, l, dt)
    cur.current.look.x = THREE.MathUtils.damp(cur.current.look.x, tmpL.x, l, dt)
    cur.current.look.y = THREE.MathUtils.damp(cur.current.look.y, tmpL.y, l, dt)
    cur.current.look.z = THREE.MathUtils.damp(cur.current.look.z, tmpL.z, l, dt)

    camera.position.copy(cur.current.pos)
    camera.lookAt(cur.current.look)
    store.look.x = cur.current.look.x
    store.look.y = cur.current.look.y
    store.look.z = cur.current.look.z
  })

  return null
}
