import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { orbitSkills } from '../../data/profile'
import { store } from '../../lib/store'
import { WICKET_Z } from './Wicket'

const damp = THREE.MathUtils.damp

// Skills floating in 3D space around the neon stumps (Skills section)
export default function SkillOrbit() {
  const group = useRef()
  const nodes = useRef([])
  const els = useRef([])
  const lastVis = useRef(-1)
  const rot = useRef({ y: 0, x: 0 })

  const items = useMemo(() => {
    const core = orbitSkills.core.map((name, i) => ({
      name,
      core: true,
      a: (i / orbitSkills.core.length) * Math.PI * 2 + 0.5,
      r: 0.62,
      y: 0.95 + (i % 2) * 0.38,
      phase: i * 1.7,
    }))
    const extra = orbitSkills.extra.map((name, i) => ({
      name,
      core: false,
      a: (i / orbitSkills.extra.length) * Math.PI * 2,
      r: 1.15 + (i % 3) * 0.28,
      y: 0.2 + ((i * 7) % 5) * 0.3,
      phase: i * 0.9,
    }))
    return [...core, ...extra]
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const vis = THREE.MathUtils.clamp(1 - (Math.abs(store.stage - 2) - 0.3) / 0.4, 0, 1)

    rot.current.y = damp(rot.current.y, store.mouse.x * 0.9, 3, dt)
    rot.current.x = damp(rot.current.x, store.mouse.y * 0.12, 3, dt)
    group.current.rotation.y = t * 0.12 + rot.current.y
    group.current.rotation.x = rot.current.x

    items.forEach((it, i) => {
      const n = nodes.current[i]
      if (!n) return
      n.position.set(Math.cos(it.a) * it.r, it.y + Math.sin(t * 0.9 + it.phase) * 0.06, Math.sin(it.a) * it.r)
    })

    if (Math.abs(vis - lastVis.current) > 0.01) {
      lastVis.current = vis
      els.current.forEach((el) => {
        if (!el) return
        el.style.opacity = vis.toFixed(3)
        el.style.visibility = vis < 0.01 ? 'hidden' : 'visible'
      })
    }
  })

  return (
    <group position={[0, 0, WICKET_Z]}>
      <group ref={group}>
        {items.map((it, i) => (
          <group key={it.name} ref={(el) => (nodes.current[i] = el)}>
            <Html center distanceFactor={it.core ? 3.2 : 3.4} zIndexRange={[30, 0]}>
              <div
                ref={(el) => (els.current[i] = el)}
                className={`skill-chip ${it.core ? 'skill-chip--core' : ''}`}
                style={{ opacity: 0, visibility: 'hidden' }}
              >
                {it.core && <span className="skill-chip__dot" />}
                {it.name}
              </div>
            </Html>
          </group>
        ))}
      </group>
    </group>
  )
}
