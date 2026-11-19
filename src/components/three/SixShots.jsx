import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, emit, reducedMotion } from '../../lib/store'
import { bindUniforms } from './bindUniforms'

// Projects section: a 3D "wagon wheel". Glowing balls are launched from the crease
// and sail over the boundary, each leaving a trail along its arc.
const SHOTS = 7
const TRAIL = 16
const FLIGHT = 2.6
const PERIOD = 7
const FROM = new THREE.Vector3(0, 0.7, -8.7)

const vert = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aFade;
  varying float vFade;
  void main() {
    vFade = aFade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (40.0 + 150.0 * aFade) * aFade * uPixelRatio / max(-mv.z, 1.0);
  }
`
const frag = /* glsl */ `
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vFade;
    gl_FragColor = vec4(mix(vec3(3.4, 1.6, 0.35), vec3(3.8, 3.2, 2.8), vFade * vFade), a);
  }
`

function arcPoint(shot, u, out) {
  out.lerpVectors(FROM, shot.to, u)
  out.y += shot.height * 4 * u * (1 - u)
  return out
}

export default function SixShots() {
  const group = useRef()
  const fired = useRef(new Array(SHOTS).fill(-1))
  const shots = useMemo(
    () =>
      Array.from({ length: SHOTS }, (_, i) => {
        const a = (i / SHOTS) * Math.PI * 2 + 0.4
        const r = 70 + (i % 3) * 5
        return { to: new THREE.Vector3(Math.sin(a) * r, 6 + (i % 2) * 5, Math.cos(a) * r), height: 17 + (i % 4) * 3, offset: i * (PERIOD / SHOTS) }
      }),
    []
  )
  // faint permanent arcs = the wagon wheel
  const arcs = useMemo(() => {
    const pts = []
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const N = 40
    shots.forEach((s) => {
      for (let i = 0; i < N; i++) {
        arcPoint(s, i / N, a)
        arcPoint(s, (i + 1) / N, b)
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [shots])
  const trail = useMemo(() => {
    const n = SHOTS * TRAIL
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aFade', new THREE.BufferAttribute(new Float32Array(n), 1))
    return g
  }, [])
  const uniforms = useMemo(() => ({ uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }), [])
  const p = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const active = !reducedMotion && Math.abs(store.stage - 8) < 0.85
    group.current.visible = active || store.prewarm
    if (!active) return
    const t = state.clock.elapsedTime
    const pos = trail.attributes.position
    const fade = trail.attributes.aFade
    shots.forEach((s, i) => {
      const local = (t + s.offset) % PERIOD
      const cycle = Math.floor((t + s.offset) / PERIOD)
      const u = local / FLIGHT
      if (u < 1 && fired.current[i] !== cycle) {
        fired.current[i] = cycle
        if (local < 0.3) emit('six')
      }
      for (let j = 0; j < TRAIL; j++) {
        const k = i * TRAIL + j
        const uj = u - j * 0.012
        if (u > 1.15 || uj < 0 || uj > 1) {
          fade.setX(k, 0)
          continue
        }
        arcPoint(s, uj, p)
        pos.setXYZ(k, p.x, p.y, p.z)
        fade.setX(k, Math.pow(1 - j / TRAIL, 1.5))
      }
    })
    pos.needsUpdate = true
    fade.needsUpdate = true
  })

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={arcs} frustumCulled={false}>
        <lineBasicMaterial color={new THREE.Color(0.4, 0.8, 2.6)} transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={trail} frustumCulled={false}>
        <shaderMaterial ref={bindUniforms(uniforms)} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
