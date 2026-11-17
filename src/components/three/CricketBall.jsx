import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBallTextures } from './textures'
import { store, isTouch } from '../../lib/store'

export const BALL_POS = new THREE.Vector3(0, 2.2, 9)

// 6 rows of hand-stitching on the main seam (3 each side), like a real Test ball
const SEAM_ROWS = [-0.078, -0.055, -0.032, 0.032, 0.055, 0.078]
const PER_ROW = 96

const smooth = THREE.MathUtils.smoothstep
const damp = THREE.MathUtils.damp

function Stitches() {
  const ref = useRef()
  const count = SEAM_ROWS.length * PER_ROW
  const geometry = useMemo(() => new THREE.CapsuleGeometry(0.0062, 0.022, 3, 8), [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const n = new THREE.Vector3()
    const t = new THREE.Vector3()
    const lat = new THREE.Vector3()
    const d = new THREE.Vector3()
    const z = new THREE.Vector3()
    const p = new THREE.Vector3()
    let i = 0
    SEAM_ROWS.forEach((phi, row) => {
      const slant = Math.sign(phi) * 0.6
      for (let k = 0; k < PER_ROW; k++) {
        const th = ((k + (row % 2) * 0.5) / PER_ROW) * Math.PI * 2
        n.set(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th))
        t.set(-Math.sin(th), 0, Math.cos(th))
        lat.crossVectors(n, t)
        d.copy(lat).multiplyScalar(Math.cos(slant)).addScaledVector(t, Math.sin(slant)).normalize()
        z.crossVectors(n, d)
        p.copy(n).multiplyScalar(1.0035)
        m.makeBasis(n, d, z).setPosition(p)
        ref.current.setMatrixAt(i++, m)
      }
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} castShadow>
      <meshStandardMaterial color="#f1e6cf" roughness={0.75} metalness={0} />
    </instancedMesh>
  )
}

export default function CricketBall() {
  const outer = useRef()
  const spinner = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const tex = useMemo(() => createBallTextures(isTouch ? 1024 : 2048), [])
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.18, 0.35), toneMapped: false, transparent: true }),
    []
  )
  const ringMatSoft = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.1, 0.2), toneMapped: false, transparent: true, opacity: 0.5 }),
    []
  )
  const tilt = useRef({ x: 0, y: 0 })
  const key = useRef()
  useLayoutEffect(() => {
    key.current.target = outer.current
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const s = store.stage

    // Visible in hero, hides as the camera flies past, returns for the contact CTA
    const vis = Math.max(smooth(s, 0.3, 0.7) * (1 - smooth(s, 1.42, 1.75)), smooth(s, 8.3, 8.9))
    const scale = vis
    outer.current.scale.setScalar(Math.max(scale, 0.0001))
    outer.current.visible = scale > 0.002

    // Drag / swipe momentum
    store.spin.x *= Math.exp(-2.2 * dt)
    store.spin.y *= Math.exp(-2.2 * dt)

    // Back-spin around the seam axis (seam stays upright, exactly like a seam-up delivery)
    spinner.current.rotation.y += dt * (1.15 + Math.abs(store.spin.x) * 0.2) + store.spin.x * dt

    // Mouse tilt + float
    tilt.current.x = damp(tilt.current.x, -store.mouse.y * 0.35 + store.spin.y * 0.15, 4, dt)
    tilt.current.y = damp(tilt.current.y, store.mouse.x * 0.55, 4, dt)
    outer.current.rotation.x = tilt.current.x
    outer.current.rotation.y = tilt.current.y
    outer.current.position.y = BALL_POS.y + Math.sin(t * 1.3) * 0.07

    ringA.current.rotation.z = t * 0.35
    ringB.current.rotation.z = -t * 0.22
    ringA.current.rotation.x = Math.sin(t * 0.4) * 0.12
    ringMat.opacity = 0.9 * vis
    ringMatSoft.opacity = 0.45 * vis
  })

  return (
    <group ref={outer} position={BALL_POS}>
      {/* seam near-vertical, slight angle so the stitches read in 3D */}
      <group rotation={[0, 0.42, 1.32]}>
        <group ref={spinner}>
          <mesh castShadow>
            <sphereGeometry args={[1, 160, 112]} />
            <meshPhysicalMaterial
              map={tex.map}
              bumpMap={tex.bumpMap}
              bumpScale={3}
              roughnessMap={tex.roughMetalMap}
              metalnessMap={tex.roughMetalMap}
              roughness={1}
              metalness={1}
              clearcoat={0.45}
              clearcoatRoughness={0.32}
              sheen={0.25}
              sheenColor="#ff5a5a"
              sheenRoughness={0.6}
              envMapIntensity={1.15}
            />
          </mesh>
          {/* raised seam lip */}
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.0, 0.017, 14, 320]} />
            <meshPhysicalMaterial color="#5e0710" roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
          </mesh>
          <Stitches />
        </group>
      </group>

      {/* Neon halo rings behind the ball */}
      <mesh ref={ringA} position-z={-0.6} material={ringMat}>
        <torusGeometry args={[1.42, 0.008, 8, 220, Math.PI * 1.55]} />
      </mesh>
      <mesh ref={ringB} position-z={-0.9} material={ringMatSoft}>
        <torusGeometry args={[1.68, 0.005, 8, 220]} />
      </mesh>

      {/* Lighting rig for the hero shot */}
      {/* red neon fills */}
      <pointLight position={[-2.6, -0.4, 1.0]} color="#ff1f3d" intensity={22} distance={9} decay={2} />
      {/* rim light from behind for a crisp silhouette */}
      <pointLight position={[0.6, 1.9, -2.0]} color="#ff6070" intensity={34} distance={8} decay={2} />
      {/* white floodlight key, aimed only at the ball */}
      <spotLight
        ref={key}
        position={[2.6, 3.6, 4.2]}
        angle={0.3}
        penumbra={0.9}
        intensity={70}
        distance={14}
        decay={2}
        color="#fff4ea"
      />
    </group>
  )
}
