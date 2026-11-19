import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBallTextures } from './textures'
import { store } from '../../lib/store'
import { bindUniforms } from './bindUniforms'

// Ball-cam: between the game plan and the skills section the camera rides just behind a
// delivery, from the bowler's hand to the stumps, with speed lines streaming past.
const RELEASE = new THREE.Vector3(0.32, 2.15, 9.2)
const BOUNCE = new THREE.Vector3(0.07, 0.05, -4.3)
const END = new THREE.Vector3(0, 0.42, -10.0)
const SPLIT = 0.6

export function ballPath(u, out) {
  const t = THREE.MathUtils.clamp(u, 0, 1)
  if (t < SPLIT) {
    const k = t / SPLIT
    out.lerpVectors(RELEASE, BOUNCE, k)
    out.y = THREE.MathUtils.lerp(RELEASE.y, BOUNCE.y, k * k * 0.55 + k * 0.45) + Math.sin(k * Math.PI) * 0.18
  } else {
    const k = (t - SPLIT) / (1 - SPLIT)
    out.lerpVectors(BOUNCE, END, k)
    out.y = THREE.MathUtils.lerp(BOUNCE.y, END.y, k) + Math.sin(k * Math.PI) * 0.22
  }
  return out
}

// camera pose for progress u: a metre behind the ball and a little above it, looking ahead
export function ballCamPose(u, pos, look) {
  ballPath(Math.max(u - 0.05, 0), pos)
  pos.z += Math.max(0, 0.05 - u) * 19.5
  pos.y += 0.16
  ballPath(Math.min(u + 0.08, 1), look)
  return pos
}

const LINES = 70
const lineVert = /* glsl */ `
  attribute float aFade;
  varying float vFade;
  void main() {
    vFade = aFade;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const lineFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;
  void main() {
    gl_FragColor = vec4(vec3(1.6, 1.45, 1.3), vFade * uOpacity);
  }
`

export default function BallCam() {
  const ball = useRef()
  const lines = useRef()
  const tex = useMemo(() => createBallTextures(512), [])
  const data = useMemo(() => {
    const pos = new Float32Array(LINES * 2 * 3)
    const fade = new Float32Array(LINES * 2)
    const seeds = Array.from({ length: LINES }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.35 + Math.random() * 1.4,
      z: Math.random() * 14,
      len: 0.6 + Math.random() * 1.6,
    }))
    for (let i = 0; i < LINES; i++) {
      fade[i * 2] = 0.9
      fade[i * 2 + 1] = 0
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aFade', new THREE.BufferAttribute(fade, 1))
    return { g, seeds, uniforms: { uOpacity: { value: 0 } } }
  }, [])
  const p = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const w = store.ballcam
    const on = w > 0.01 || store.prewarm
    ball.current.visible = on
    lines.current.visible = on
    if (!on) return
    ballPath(store.stage - 4, p)
    ball.current.position.copy(p)
    ball.current.rotation.x -= dt * 30

    // speed lines live in camera space and stream towards the viewer
    const cam = state.camera
    lines.current.position.copy(cam.position)
    lines.current.quaternion.copy(cam.quaternion)
    const speed = THREE.MathUtils.clamp(store.ballSpeed * 6, 0.25, 1)
    const arr = data.g.attributes.position.array
    data.seeds.forEach((s, i) => {
      s.z -= dt * (14 + 30 * speed)
      if (s.z < 0) s.z += 14
      const x = Math.cos(s.a) * s.r
      const y = Math.sin(s.a) * s.r
      arr.set([x, y, -s.z - 0.6, x, y, -s.z - 0.6 - s.len * (0.6 + speed)], i * 6)
    })
    data.g.attributes.position.needsUpdate = true
    data.uniforms.uOpacity.value = w * (0.25 + 0.5 * speed)
  })

  return (
    <group>
      <mesh ref={ball} visible={false}>
        <sphereGeometry args={[0.045, 32, 24]} />
        <meshPhysicalMaterial map={tex.map} roughness={0.38} clearcoat={0.8} emissive="#ff5a2a" emissiveIntensity={0.25} />
      </mesh>
      <lineSegments ref={lines} geometry={data.g} frustumCulled={false} visible={false}>
        <shaderMaterial ref={bindUniforms(data.uniforms)} uniforms={data.uniforms} vertexShader={lineVert} fragmentShader={lineFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}
