import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { on, reducedMotion } from '../../lib/store'
import { BALL_POS } from './CricketBall'

// Tricolour confetti that bursts round the match ball when the DRS decision says HIRED.
const N = 180
const COLORS = ['#ff9933', '#ffffff', '#138808', '#2f6bff']
const G = -3.2

export default function Confetti() {
  const mesh = useRef()
  const parts = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
        r: new THREE.Euler(),
        w: new THREE.Vector3(),
        life: 0,
      })),
    []
  )
  const geo = useMemo(() => new THREE.PlaneGeometry(0.075, 0.045), [])
  const m4 = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  const zero = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useEffect(() => {
    const m = mesh.current
    const c = new THREE.Color()
    for (let i = 0; i < N; i++) {
      m.setColorAt(i, c.set(COLORS[i % COLORS.length]))
      m.setMatrixAt(i, m4.compose(zero, q, zero))
    }
    m.instanceColor.needsUpdate = true
    m.instanceMatrix.needsUpdate = true
    return on('hired', () => {
      if (reducedMotion) return
      parts.forEach((p) => {
        const a = Math.random() * Math.PI * 2
        const sp = 1.5 + Math.random() * 3.2
        p.p.set(BALL_POS.x + (Math.random() - 0.5) * 0.6, BALL_POS.y + 0.6, BALL_POS.z + (Math.random() - 0.5) * 0.6)
        p.v.set(Math.cos(a) * sp, 2.6 + Math.random() * 3.4, Math.sin(a) * sp * 0.6)
        p.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
        p.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14)
        p.life = 3.2 + Math.random() * 1.6
      })
      m.visible = true
    })
  }, [parts, m4, q, zero])

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m.visible) return
    const dt = Math.min(delta, 0.05)
    let alive = 0
    parts.forEach((p, i) => {
      if (p.life <= 0) {
        m.setMatrixAt(i, m4.compose(zero, q, zero))
        return
      }
      alive++
      p.life -= dt
      p.v.y += G * dt
      p.v.multiplyScalar(Math.exp(-1.6 * dt)) // paper drag
      p.v.x += Math.sin(p.life * 3 + i) * 0.6 * dt // flutter
      p.p.addScaledVector(p.v, dt)
      p.r.x += p.w.x * dt
      p.r.y += p.w.y * dt
      p.r.z += p.w.z * dt
      const s = Math.min(1, p.life / 0.6)
      m.setMatrixAt(i, m4.compose(p.p, q.setFromEuler(p.r), one.set(s, s, s)))
    })
    one.set(1, 1, 1)
    m.instanceMatrix.needsUpdate = true
    if (!alive) m.visible = false
  })

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, N]} visible={false} frustumCulled={false}>
      <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  )
}
