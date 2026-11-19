import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, reducedMotion } from '../../lib/store'
import { bindUniforms } from './bindUniforms'

/* Swing trails: glowing comets that whip round the match ball on tilted orbits,
   like the path of a ball swinging through the air. */
const trailVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const trailFrag = /* glsl */ `
  uniform float uHead;
  uniform float uOpacity;
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    float d = fract(uHead - vUv.x);              // 0 at the comet head, growing along the tail
    float tail = smoothstep(0.42, 0.0, d);
    float head = smoothstep(0.025, 0.0, d);
    vec3 col = mix(uTint, vec3(4.0, 3.4, 3.0), head);
    gl_FragColor = vec4(col, (tail * 0.85 + head) * uOpacity);
  }
`

function orbit(rx, rz) {
  const pts = []
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz))
  }
  return new THREE.CatmullRomCurve3(pts, true)
}

const TRAILS = [
  { rx: 1.55, rz: 1.3, tilt: [0.5, 0, 0.35], speed: 0.42, radius: 0.014, tint: [3.4, 1.6, 0.35] },
  { rx: 1.85, rz: 1.5, tilt: [-0.35, 0.6, -0.5], speed: -0.31, radius: 0.01, tint: [0.5, 1.1, 3.6] },
]

export function SwingTrails({ visibility }) {
  const items = useMemo(
    () =>
      TRAILS.map((t) => ({
        ...t,
        geo: new THREE.TubeGeometry(orbit(t.rx, t.rz), 220, t.radius, 6, true),
        uniforms: { uHead: { value: Math.random() }, uOpacity: { value: 0 }, uTint: { value: new THREE.Vector3(...t.tint) } },
      })),
    []
  )
  useFrame((state) => {
    const v = visibility()
    items.forEach((it) => {
      it.uniforms.uHead.value = reducedMotion ? 0.3 : (state.clock.elapsedTime * it.speed) % 1
      it.uniforms.uOpacity.value = v
    })
  })
  return items.map((it, i) => (
    <mesh key={i} geometry={it.geo} rotation={it.tilt} frustumCulled={false}>
      <shaderMaterial ref={bindUniforms(it.uniforms)} uniforms={it.uniforms} vertexShader={trailVert} fragmentShader={trailFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  ))
}

/* Next innings: a ring of LED text circling the ball, like a stadium ribbon board. */
export function TextRing() {
  const ring = useRef()
  const mat = useRef()
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 128
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.anisotropy = 8
    const draw = () => {
      const x = c.getContext('2d')
      x.clearRect(0, 0, c.width, c.height)
      x.textBaseline = 'middle'
      x.font = "400 76px Anton, Impact, sans-serif"
      const parts = [
        ['READY FOR THE NEXT INNINGS', '#ffffff'],
        ['  ●  ', '#ffa23a'],
        ["LET'S CONNECT", '#ffa23a'],
        ['  ●  ', '#ffa23a'],
      ]
      const width = parts.reduce((w, [s]) => w + x.measureText(s).width, 0)
      const scale = c.width / 2 / width // the phrase fits exactly twice round the ring
      x.save()
      x.scale(scale, 1)
      let px = 0
      for (let rep = 0; rep < 2; rep++) {
        parts.forEach(([s, col]) => {
          x.fillStyle = col
          x.fillText(s, px, 68)
          px += x.measureText(s).width
        })
      }
      x.restore()
      t.needsUpdate = true
    }
    draw()
    document.fonts?.load('400 76px Anton').then(draw).catch(() => {})
    return t
  }, [])
  useFrame((state, dt) => {
    const v = THREE.MathUtils.smoothstep(store.stage, 9.45, 9.95)
    ring.current.visible = v > 0.01 || store.prewarm
    mat.current.opacity = v
    if (!reducedMotion) ring.current.rotation.y -= Math.min(dt, 0.05) * 0.35
    ring.current.rotation.z = 0.22 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  })
  return (
    <group rotation-x={0.18}>
      <mesh ref={ring} visible={false}>
        <cylinderGeometry args={[1.62, 1.62, 0.3, 128, 1, true]} />
        <meshBasicMaterial ref={mat} map={tex} transparent color={new THREE.Color(1.5, 1.5, 1.5)} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
