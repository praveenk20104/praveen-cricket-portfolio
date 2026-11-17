import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, on, emit, reducedMotion } from '../../lib/store'

// Fireworks above the stands. All motion is computed in the shader; the CPU only
// writes a new origin / start time when a shell goes up.
const BURSTS = 7
const PER = 80

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute vec3 aVel;
  attribute vec3 aColor;
  attribute float aBirth;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float age = uTime - aBirth;
    float life = 1.9 + aSeed * 0.9;
    float alive = step(0.0, age) * step(age, life);
    // fast burst that slows with drag, then sinks
    vec3 p = position + aVel * (1.0 - exp(-1.7 * age)) / 1.7 + vec3(0.0, -2.4, 0.0) * age * age;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float fade = pow(1.0 - clamp(age / life, 0.0, 1.0), 1.4);
    float twinkle = 0.65 + 0.35 * sin(uTime * 28.0 + aSeed * 90.0);
    vAlpha = alive * fade * twinkle;
    vColor = aColor;
    gl_PointSize = alive * (150.0 + aSeed * 150.0) * fade * uPixelRatio / max(-mv.z, 1.0);
  }
`
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * 2.4, a * a * vAlpha);
  }
`

const PALETTE = [
  [1.0, 0.12, 0.24],
  [1.0, 0.75, 0.3],
  [1.0, 0.95, 0.9],
  [1.0, 0.35, 0.5],
]

export default function Fireworks() {
  const next = useRef(0)
  const slot = useRef(0)
  const queue = useRef(0)
  const { geometry, uniforms } = useMemo(() => {
    const n = BURSTS * PER
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aVel', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aBirth', new THREE.BufferAttribute(new Float32Array(n).fill(-100), 1))
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) seed[i] = Math.random()
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return { geometry: g, uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } } }
  }, [])

  // a short volley when the batter has taken guard
  useEffect(() => on('celebrate', () => (queue.current = 4)), [])

  const launch = (time) => {
    const a = geometry.attributes
    const b = slot.current++ % BURSTS
    // somewhere above the far stands, in front of the hero / training / contact cameras
    const ox = -75 + Math.random() * 105
    const oy = 34 + Math.random() * 26
    const oz = -112 + Math.random() * 40
    const col = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    const speed = 16 + Math.random() * 12
    for (let i = b * PER; i < (b + 1) * PER; i++) {
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      const sp = speed * (0.75 + Math.random() * 0.25)
      a.position.setXYZ(i, ox, oy, oz)
      a.aVel.setXYZ(i, r * Math.cos(th) * sp, u * sp, r * Math.sin(th) * sp)
      a.aColor.setXYZ(i, col[0], col[1], col[2])
      a.aBirth.setX(i, time)
    }
    a.position.needsUpdate = a.aVel.needsUpdate = a.aColor.needsUpdate = a.aBirth.needsUpdate = true
    emit('firework')
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    if (reducedMotion) return
    const show = store.stage > 7.55
    if ((show || queue.current > 0) && t > next.current) {
      launch(t)
      if (queue.current > 0) queue.current--
      next.current = t + (queue.current > 0 ? 0.35 : 0.7 + Math.random() * 1.1)
    }
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
