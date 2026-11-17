import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PITCH, createBallTextures } from './textures'
import { store, emit, reducedMotion } from '../../lib/store'

// Real-world dimensions (metres)
const STUMP_H = 0.711
const STUMP_R = 0.019
const STUMP_X = [-0.0953, 0, 0.0953]
const BAIL_Y = STUMP_H + 0.011
const BAIL_X = [-0.0476, 0.0476]
const BALL_R = 0.05 // slightly larger than real (0.036) so it reads on screen

const PERIOD = 4.8
const T_BOUNCE = 0.95
const T_HIT = 1.38
const G = -9.8

export const WICKET_Z = -PITCH.stumpZ

const RELEASE = new THREE.Vector3(0.32, 2.15, 9.2)
const BOUNCE = new THREE.Vector3(0.07, BALL_R, -4.3)
const HIT = new THREE.Vector3(0.0, 0.42, WICKET_Z + 0.06)

function neonMaterial(intensity) {
  return new THREE.MeshStandardMaterial({
    color: '#ffe4e8',
    emissive: new THREE.Color('#ff1733'),
    emissiveIntensity: intensity,
    roughness: 0.35,
    metalness: 0.1,
    toneMapped: false,
  })
}

const sparkVert = /* glsl */ `
  uniform float uAge;
  uniform float uPixelRatio;
  attribute vec3 aVel;
  attribute float aSeed;
  varying float vLife;
  varying float vSeed;
  void main() {
    vec3 p = position + aVel * uAge + vec3(0.0, -4.9, 0.0) * uAge * uAge;
    vLife = 1.0 - clamp(uAge / (0.5 + aSeed * 0.6), 0.0, 1.0);
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (6.0 + aSeed * 10.0) * vLife * uPixelRatio * (4.0 / -mv.z);
  }
`
const sparkFrag = /* glsl */ `
  varying float vLife;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vLife;
    vec3 col = mix(vec3(4.0, 0.25, 0.35), vec3(4.0, 3.2, 2.6), step(0.7, vSeed));
    gl_FragColor = vec4(col, a);
  }
`
const trailVert = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aFade;
  varying float vFade;
  void main() {
    vFade = aFade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = 42.0 * aFade * uPixelRatio * (1.0 / -mv.z);
  }
`
const trailFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vFade * uOpacity;
    gl_FragColor = vec4(vec3(3.5, 0.2, 0.32), a);
  }
`

function Stumps({ z, mats, refs }) {
  return (
    <group position={[0, 0, z]}>
      {STUMP_X.map((x, i) => (
        <group key={i} position-x={x} ref={refs ? (el) => (refs.stumps[i] = el) : undefined}>
          <mesh position-y={STUMP_H / 2} material={mats.stump} castShadow>
            <cylinderGeometry args={[STUMP_R, STUMP_R * 0.92, STUMP_H, 20]} />
          </mesh>
        </group>
      ))}
      {BAIL_X.map((x, i) => (
        <mesh
          key={i}
          position={[x, BAIL_Y, 0]}
          rotation-z={Math.PI / 2}
          material={mats.bail}
          castShadow
          ref={refs ? (el) => (refs.bails[i] = el) : undefined}
        >
          <capsuleGeometry args={[0.0105, 0.088, 4, 10]} />
        </mesh>
      ))}
    </group>
  )
}

export default function Wicket() {
  const mats = useMemo(
    () => ({ stump: neonMaterial(2.4), bail: neonMaterial(3.4), dim: neonMaterial(0.9), dimBail: neonMaterial(1.2) }),
    []
  )
  const refs = useRef({ stumps: [], bails: [] }).current
  const ball = useRef()
  const sparks = useRef()
  const glow = useRef()
  const ballTex = useMemo(() => createBallTextures(512), [])

  const sim = useRef({
    cycle: -1,
    bails: BAIL_X.map((x) => ({ p: new THREE.Vector3(x, BAIL_Y, 0), v: new THREE.Vector3(), r: new THREE.Vector3(), w: new THREE.Vector3(), rest: true })),
    ballV: new THREE.Vector3(),
    ballP: new THREE.Vector3(),
    hitDone: false,
    t0: null,
  }).current

  // Spark burst geometry
  const sparkGeo = useMemo(() => {
    const n = 90
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = HIT.x
      pos[i * 3 + 1] = HIT.y + 0.15
      pos[i * 3 + 2] = HIT.z
      const a = Math.random() * Math.PI * 2
      const sp = 1.2 + Math.random() * 3.2
      vel[i * 3] = Math.cos(a) * sp
      vel[i * 3 + 1] = 1 + Math.random() * 3.5
      vel[i * 3 + 2] = Math.sin(a) * sp * 0.6 - 0.6
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
  const sparkUniforms = useMemo(
    () => ({ uAge: { value: 99 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }),
    []
  )

  // Glowing trail behind the delivery
  const TRAIL = 30
  const trail = useMemo(() => {
    const pos = new Float32Array(TRAIL * 3)
    const fade = new Float32Array(TRAIL)
    for (let i = 0; i < TRAIL; i++) fade[i] = Math.pow(1 - i / TRAIL, 1.6)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aFade', new THREE.BufferAttribute(fade, 1))
    return g
  }, [])
  const trailUniforms = useMemo(
    () => ({ uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uOpacity: { value: 0 } }),
    []
  )

  const resetTrail = (p) => {
    const a = trail.attributes.position.array
    for (let i = 0; i < TRAIL; i++) p.toArray(a, i * 3)
    trail.attributes.position.needsUpdate = true
  }
  const pushTrail = (p) => {
    const a = trail.attributes.position.array
    a.copyWithin(3, 0, (TRAIL - 1) * 3)
    p.toArray(a, 0)
    trail.attributes.position.needsUpdate = true
  }

  const tmp = new THREE.Vector3()

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    sparkUniforms.uAge.value += dt
    // deliveries only run while the batter is off the field (sections 3 → 8)
    const bowling = store.started && !reducedMotion && store.stage > 2.6 && store.stage < 8.4
    if (!bowling) {
      sim.t0 = null
      if (sim.cycle !== -1) {
        sim.cycle = -1
        ball.current.visible = false
        trailUniforms.uOpacity.value = 0
        sim.bails.forEach((b, i) => {
          b.rest = true
          refs.bails[i]?.position.set(BAIL_X[i], BAIL_Y, 0)
          refs.bails[i]?.rotation.set(0, 0, Math.PI / 2)
        })
        refs.stumps.forEach((s) => s?.rotation.set(0, 0, 0))
        mats.stump.emissiveIntensity = 2.4
        mats.bail.emissiveIntensity = 3.4
      }
      return
    }
    if (sim.t0 == null) sim.t0 = state.clock.elapsedTime - 0.6 // first ball shortly after the camera arrives
    const time = state.clock.elapsedTime - sim.t0
    const cycle = Math.floor(time / PERIOD)
    const t = time - cycle * PERIOD

    // New delivery: reset everything
    if (cycle !== sim.cycle) {
      sim.cycle = cycle
      sim.hitDone = false
      sim.bails.forEach((b, i) => {
        b.p.set(BAIL_X[i], BAIL_Y, 0)
        b.v.set(0, 0, 0)
        b.r.set(0, 0, Math.PI / 2)
        b.w.set(0, 0, 0)
        b.rest = true
      })
      resetTrail(RELEASE)
      emit('delivery', 132 + Math.random() * 16) // speed-gun reading, km/h
    }

    // --- Ball flight ---
    const p = tmp
    if (t < T_BOUNCE) {
      const u = t / T_BOUNCE
      p.lerpVectors(RELEASE, BOUNCE, u)
      p.y = THREE.MathUtils.lerp(RELEASE.y, BOUNCE.y, u * u * 0.55 + u * 0.45) + Math.sin(u * Math.PI) * 0.18
    } else if (t < T_HIT) {
      const u = (t - T_BOUNCE) / (T_HIT - T_BOUNCE)
      p.lerpVectors(BOUNCE, HIT, u)
      p.y = THREE.MathUtils.lerp(BOUNCE.y, HIT.y, u) + Math.sin(u * Math.PI) * 0.22
    } else {
      if (!sim.hitDone) {
        sim.hitDone = true
        sim.ballP.copy(HIT)
        sim.ballV.set(0.6, 1.4, 2.2)
        sim.bails.forEach((b, i) => {
          b.rest = false
          b.v.set((i ? 1 : -1) * (0.8 + Math.random() * 0.9), 2.6 + Math.random() * 1.2, -1.2 - Math.random() * 1.2)
          b.w.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 22)
        })
        sparkUniforms.uAge.value = 0
        emit('wicket')
      }
      const a = t - T_HIT
      sim.ballV.y += G * dt
      sim.ballP.addScaledVector(sim.ballV, dt)
      if (sim.ballP.y < BALL_R) {
        sim.ballP.y = BALL_R
        sim.ballV.y *= -0.35
        sim.ballV.x *= 0.8
        sim.ballV.z *= 0.8
      }
      p.copy(sim.ballP)
      ball.current.scale.setScalar(Math.max(0.0001, 1 - THREE.MathUtils.smoothstep(a, 1.4, 2.2)))
    }
    if (t < T_HIT) ball.current.scale.setScalar(1)
    ball.current.visible = true
    ball.current.position.copy(p)
    ball.current.rotation.x -= dt * 25
    pushTrail(p)
    trailUniforms.uOpacity.value = t < T_HIT + 0.4 ? 1 : Math.max(0, 1 - (t - T_HIT - 0.4) * 2)

    // --- Bails physics ---
    sim.bails.forEach((b, i) => {
      const mesh = refs.bails[i]
      if (!mesh) return
      if (!b.rest) {
        b.v.y += G * dt
        b.p.addScaledVector(b.v, dt)
        b.r.addScaledVector(b.w, dt)
        const floor = 0.011 // ground level in the wicket's local space
        if (b.p.y < floor) {
          b.p.y = floor
          b.v.y *= -0.3
          b.v.x *= 0.6
          b.v.z *= 0.6
          b.w.multiplyScalar(0.5)
          if (Math.abs(b.v.y) < 0.2) {
            b.v.set(0, 0, 0)
            b.w.set(0, 0, 0)
            b.r.x = 0
            b.r.z = Math.PI / 2
          }
        }
      }
      mesh.position.copy(b.p)
      mesh.rotation.set(b.r.x, b.r.y, b.r.z)
    })

    // --- Stumps wobble after impact ---
    const since = sim.hitDone ? t - T_HIT : 99
    const wob = since < 3 ? Math.exp(-5 * since) * Math.sin(since * 22) : 0
    refs.stumps.forEach((s, i) => {
      if (!s) return
      const amp = i === 1 ? 0.32 : i === 0 ? 0.14 : 0.18
      s.rotation.x = -wob * amp
      s.rotation.z = i === 1 ? wob * 0.05 : 0
    })

    // Flash on impact
    const flash = since < 1.2 ? Math.exp(-4 * since) : 0
    mats.stump.emissiveIntensity = 2.4 + flash * 9
    mats.bail.emissiveIntensity = 3.4 + flash * 8
    if (glow.current) glow.current.intensity = 6 + flash * 60
  })

  return (
    <group>
      {/* Batting end — neon stumps that get knocked over */}
      <group>
        <Stumps z={WICKET_Z} mats={mats} refs={refs} />
      </group>
      {/* Bowler's end — dimmer neon */}
      <Stumps z={-WICKET_Z} mats={{ stump: mats.dim, bail: mats.dimBail }} />

      <pointLight ref={glow} position={[0, 0.9, WICKET_Z + 0.9]} color="#ff1f3d" intensity={6} distance={6} decay={2} />

      {/* Delivery ball */}
      <mesh ref={ball} castShadow visible={false}>
        <sphereGeometry args={[BALL_R, 32, 24]} />
        <meshPhysicalMaterial map={ballTex.map} roughness={0.4} clearcoat={0.6} emissive="#ff1f3d" emissiveIntensity={0.25} />
      </mesh>

      <points geometry={trail} frustumCulled={false}>
        <shaderMaterial
          uniforms={trailUniforms}
          vertexShader={trailVert}
          fragmentShader={trailFrag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={sparks} geometry={sparkGeo} frustumCulled={false}>
        <shaderMaterial
          uniforms={sparkUniforms}
          vertexShader={sparkVert}
          fragmentShader={sparkFrag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
