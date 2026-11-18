import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBallTextures } from './textures'
import { store, on } from '../../lib/store'

// Intro finale: a new ball drops out of the night sky, knocks into the pitch in front of
// the batter (neon shockwave + dust + flash on every bounce) and rolls up to his bat.
const R = 0.062 // a little bigger than a real ball so it reads on small screens
const G = -9.8
const DROP = new THREE.Vector3(0.35, 6, -7.35)
const REST = new THREE.Vector3(0.04, R, -8.36) // just in front of the bat
const RINGS = 3

const ringVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ringFrag = /* glsl */ `
  uniform float uAge;
  uniform float uPower;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;          // 0 centre → 1 edge of the quad
    float front = clamp(uAge / 0.75, 0.0, 1.0);  // how far the wave has travelled
    float band = smoothstep(0.09, 0.0, abs(r - front)) ;
    float inner = smoothstep(front, 0.0, r) * 0.18;
    float fade = (1.0 - front) * uPower;
    vec3 col = mix(vec3(3.6, 0.2, 0.35), vec3(3.8, 3.0, 2.6), band * 0.35);
    gl_FragColor = vec4(col, (band + inner) * fade);
  }
`
const dustVert = /* glsl */ `
  uniform float uAge;
  uniform float uPixelRatio;
  attribute vec3 aVel;
  attribute float aSeed;
  varying float vLife;
  void main() {
    vec3 p = position + aVel * (1.0 - exp(-2.6 * uAge)) / 2.6 + vec3(0.0, 0.3, 0.0) * uAge;
    vLife = 1.0 - clamp(uAge / (0.8 + aSeed * 0.7), 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (40.0 + aSeed * 60.0) * (1.4 - vLife) * uPixelRatio * (2.0 / -mv.z);
  }
`
const dustFrag = /* glsl */ `
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vec3(0.8, 0.64, 0.44), smoothstep(0.5, 0.0, d) * vLife * 0.42);
  }
`

export default function IntroBall() {
  const ball = useRef()
  const rings = useRef([])
  const dust = useRef()
  const flash = useRef()
  const tex = useMemo(() => createBallTextures(512), [])
  const sim = useRef({ state: 'hidden', p: new THREE.Vector3(), v: new THREE.Vector3(), next: 0, flash: 0 }).current

  const ringUniforms = useMemo(() => Array.from({ length: RINGS }, () => ({ uAge: { value: 9 }, uPower: { value: 1 } })), [])
  const dustGeo = useMemo(() => {
    const n = 34
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 0.6 + Math.random() * 1.6
      vel[i * 3] = Math.cos(a) * sp
      vel[i * 3 + 1] = 0.2 + Math.random() * 0.9
      vel[i * 3 + 2] = Math.sin(a) * sp
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
  const dustUniforms = useMemo(() => ({ uAge: { value: 9 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }), [])

  useEffect(
    () =>
      on('knock', (instant) => {
        if (instant) {
          sim.state = 'rest'
          sim.p.copy(REST)
          return
        }
        sim.state = 'fall'
        sim.p.copy(DROP)
        // aim the first bounce a little in front of the rest point, then let it roll in
        sim.v.set(0, -2, 0)
        const land = new THREE.Vector3(0.32, 0, -7.85)
        const tFall = (sim.v.y + Math.sqrt(sim.v.y ** 2 - 2 * G * (DROP.y - R))) / -G
        sim.v.x = (land.x - DROP.x) / tFall
        sim.v.z = (land.z - DROP.z) / tFall
      }),
    [sim]
  )

  const impact = (power) => {
    const i = sim.next++ % RINGS
    const ring = rings.current[i]
    ring.position.set(sim.p.x, 0.012, sim.p.z)
    ringUniforms[i].uAge.value = 0
    ringUniforms[i].uPower.value = power
    ring.scale.setScalar(0.6 + power * 2.6)
    if (power > 0.45) {
      dust.current.position.set(sim.p.x, 0.03, sim.p.z)
      dustUniforms.uAge.value = 0
    }
    sim.flash = Math.max(sim.flash, power)
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    ringUniforms.forEach((u) => (u.uAge.value += dt))
    dustUniforms.uAge.value += dt
    sim.flash *= Math.exp(-6 * dt)
    flash.current.intensity = sim.flash * 40
    flash.current.position.set(sim.p.x, 0.5, sim.p.z)

    const show = (store.stage < 1.9 && sim.state !== 'hidden') || store.prewarm
    ball.current.visible = show
    if (!show) return

    if (sim.state === 'fall' || sim.state === 'bounce') {
      sim.v.y += G * dt
      sim.p.addScaledVector(sim.v, dt)
      if (sim.p.y < R) {
        sim.p.y = R
        const speed = -sim.v.y
        impact(THREE.MathUtils.clamp(speed / 11, 0.15, 1))
        sim.v.y = speed * 0.42
        // steer each bounce towards the bat
        const k = 0.55
        sim.v.x = THREE.MathUtils.lerp(sim.v.x, (REST.x - sim.p.x) * 1.6, k)
        sim.v.z = THREE.MathUtils.lerp(sim.v.z, (REST.z - sim.p.z) * 1.6, k)
        sim.state = sim.v.y < 0.6 ? 'roll' : 'bounce'
        if (sim.state === 'roll') sim.v.y = 0
      }
    } else if (sim.state === 'roll') {
      // rolls along the pitch and stops at the bat
      sim.p.x = THREE.MathUtils.damp(sim.p.x, REST.x, 3, dt)
      sim.p.z = THREE.MathUtils.damp(sim.p.z, REST.z, 3, dt)
      sim.p.y = R
      if (sim.p.distanceTo(REST) < 0.004) sim.state = 'rest'
    }
    if (sim.state === 'rest') sim.p.copy(REST)
    if (store.prewarm && sim.state === 'hidden') sim.p.set(0, -5, 0)

    const moved = ball.current.position.distanceTo(sim.p)
    ball.current.position.copy(sim.p)
    ball.current.rotation.x += moved / R // roll, not slide
    ball.current.material.emissiveIntensity = sim.state === 'fall' ? 1.4 : 0.55
  })

  return (
    <group>
      <mesh ref={ball} visible={false} castShadow>
        <sphereGeometry args={[R, 32, 24]} />
        <meshPhysicalMaterial map={tex.map} roughness={0.4} clearcoat={0.7} emissive="#ff1f3d" emissiveIntensity={0.25} />
      </mesh>
      {ringUniforms.map((u, i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)} rotation-x={-Math.PI / 2} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial uniforms={u} vertexShader={ringVert} fragmentShader={ringFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <points ref={dust} geometry={dustGeo} frustumCulled={false}>
        <shaderMaterial uniforms={dustUniforms} vertexShader={dustVert} fragmentShader={dustFrag} transparent depthWrite={false} />
      </points>
      <pointLight ref={flash} color="#ff2a48" intensity={0} distance={5} decay={2} />
    </group>
  )
}
