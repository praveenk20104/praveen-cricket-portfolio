import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { hawkEye } from '../../data/profile'
import { store } from '../../lib/store'
import { bindUniforms } from './bindUniforms'

// Hawk-Eye: four tracked deliveries, one per core tool. Each path is drawn in solid colour
// to the point of impact at the pad, then continues as a see-through "predicted path" into
// the stumps, exactly like the TV graphic. Pitching points are marked on a pitch map.
const STUMPS_Z = -10.06
const TMP = new THREE.Vector3()
// label depth per ball (spread out so two labels on the same side never overlap)
const LABEL_Z = [-7.3, -3.6, -4.3, -7.6]
const IMPACT_Z = -8.55
const SETUP = [
  { release: [0.38, 2.15, 9.2], bounce: [0.32, -6.4], impactY: 0.42, endX: 0.05, endY: 0.33 },
  { release: [-0.12, 2.2, 9.2], bounce: [-0.1, -3.6], impactY: 0.62, endX: -0.04, endY: 0.66 },
  { release: [0.5, 2.1, 9.2], bounce: [0.2, -5.1], impactY: 0.5, endX: 0.08, endY: 0.48 },
  { release: [0.22, 2.15, 9.2], bounce: [-0.12, -7.6], impactY: 0.3, endX: 0.02, endY: 0.22 },
]
const DRAW = 1.4 // seconds per ball
const LOOP = 12

const tubeVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const tubeFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDraw;
  uniform float uImpact;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    if (vUv.x > uDraw) discard;
    float predicted = step(uImpact, vUv.x);
    float dash = predicted * step(0.5, fract(vUv.x * 60.0));
    float head = smoothstep(0.03, 0.0, uDraw - vUv.x) * step(uDraw, 0.999);
    float a = mix(0.95, 0.4 - dash * 0.25, predicted);
    gl_FragColor = vec4(uColor * (1.15 + head * 1.6), (a + head) * uOpacity);
  }
`

function buildPath(s) {
  const pts = []
  const R = new THREE.Vector3(...s.release)
  const B = new THREE.Vector3(s.bounce[0], 0.04, s.bounce[1])
  const I = new THREE.Vector3(THREE.MathUtils.lerp(s.bounce[0], s.endX, 0.6), s.impactY, IMPACT_Z)
  const E = new THREE.Vector3(s.endX, s.endY, STUMPS_Z)
  const N1 = 26
  for (let i = 0; i <= N1; i++) {
    const k = i / N1
    const p = new THREE.Vector3().lerpVectors(R, B, k)
    p.y = THREE.MathUtils.lerp(R.y, B.y, k * k * 0.6 + k * 0.4) + Math.sin(k * Math.PI) * 0.15
    pts.push(p)
  }
  const N2 = 12
  for (let i = 1; i <= N2; i++) {
    const k = i / N2
    const p = new THREE.Vector3().lerpVectors(B, I, k)
    p.y = THREE.MathUtils.lerp(B.y, I.y, Math.sqrt(k))
    pts.push(p)
  }
  pts.push(E)
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const total = curve.getLength()
  const toImpact = new THREE.CatmullRomCurve3(pts.slice(0, pts.length - 1), false, 'centripetal').getLength()
  return { curve, impact: toImpact / total, bounce: B }
}

// translucent length zones painted on the pitch (full, good length, short)
function zonesTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 1024
  const x = c.getContext('2d')
  const zones = [
    { from: 0, to: 0.13, col: 'rgba(77,134,255,0.34)', label: 'FULL' },
    { from: 0.13, to: 0.31, col: 'rgba(255,162,58,0.3)', label: 'GOOD' },
    { from: 0.31, to: 0.52, col: 'rgba(244,241,234,0.16)', label: 'SHORT' },
  ]
  zones.forEach((z) => {
    x.fillStyle = z.col
    x.fillRect(0, z.from * 1024, 128, (z.to - z.from) * 1024)
    x.save()
    x.translate(64, ((z.from + z.to) / 2) * 1024)
    x.rotate(-Math.PI / 2)
    x.fillStyle = 'rgba(255,255,255,0.75)'
    x.font = '600 26px "JetBrains Mono", monospace'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText(z.label, 0, 0)
    x.restore()
  })
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export default function HawkEye() {
  const group = useRef()
  const labels = useRef([])
  const gl = useThree((s) => s.gl)
  const lastVis = useRef(-1)
  const zoneTex = useMemo(() => zonesTexture(), [])
  const zoneMat = useRef()
  const wicketMat = useRef()
  const balls = useMemo(
    () =>
      SETUP.map((s, i) => {
        const { curve, impact, bounce } = buildPath(s)
        // label sits beside the pitching point, alternating sides so labels never stack
        const anchor = new THREE.Vector3(bounce.x + (i % 2 ? -0.95 : 0.95), 0.3, LABEL_Z[i])
        return {
          geo: new THREE.TubeGeometry(curve, 140, 0.055, 10, false),
          bounce,
          anchor,
          uniforms: {
            uColor: { value: new THREE.Color(hawkEye.balls[i].color) },
            uDraw: { value: 0 },
            uImpact: { value: impact },
            uOpacity: { value: 0 },
          },
          dot: new THREE.MeshBasicMaterial({ color: hawkEye.balls[i].color, transparent: true, opacity: 0, depthWrite: false }),
        }
      }),
    []
  )

  // Plain DOM labels projected from 3D each frame: no extra React roots, never missing.
  useEffect(() => {
    const host = gl.domElement.parentNode
    const els = hawkEye.balls.map((b) => {
      const el = document.createElement('div')
      el.className = 'hawk-label hawk-label--float'
      el.style.setProperty('--c', b.color)
      el.style.visibility = 'hidden'
      const dot = document.createElement('span')
      dot.className = 'hawk-label__dot'
      el.append(dot, document.createTextNode(b.tool))
      host.appendChild(el)
      return el
    })
    labels.current = els
    lastVis.current = -1
    return () => els.forEach((el) => el.remove())
  }, [gl])

  useFrame((state) => {
    const v = THREE.MathUtils.clamp(1 - (Math.abs(store.stage - 6) - 0.25) / 0.45, 0, 1)
    group.current.visible = v > 0.01 || store.prewarm
    if (Math.abs(v - lastVis.current) > 0.01) {
      lastVis.current = v
      labels.current.forEach((el) => {
        if (!el) return
        el.style.opacity = v.toFixed(3)
        el.style.visibility = v < 0.02 ? 'hidden' : 'visible'
      })
    }
    if (!group.current.visible) return
    if (v > 0.02) {
      const { camera, size } = state
      const tanHalf = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      balls.forEach((b, i) => {
        const el = labels.current[i]
        if (!el) return
        TMP.copy(b.anchor)
        const dist = TMP.distanceTo(camera.position)
        TMP.project(camera)
        const behind = TMP.z > 1
        el.style.visibility = behind ? 'hidden' : 'visible'
        if (behind) return
        const x = (TMP.x * 0.5 + 0.5) * size.width
        const y = (-TMP.y * 0.5 + 0.5) * size.height
        const k = 13 / (tanHalf * dist)
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${k.toFixed(3)})`
      })
    }
    const t = state.clock.elapsedTime % LOOP
    const fadeOut = 1 - THREE.MathUtils.smoothstep(t, LOOP - 1, LOOP)
    balls.forEach((b, i) => {
      const d = THREE.MathUtils.clamp((t - 0.4 - i * (DRAW + 0.35)) / DRAW, 0, 1)
      const u = b.uniforms
      u.uDraw.value = d * d * (3 - 2 * d)
      u.uOpacity.value = v * fadeOut
      b.dot.opacity = v * fadeOut * THREE.MathUtils.smoothstep(d, 0.55, 0.65)
    })
    zoneMat.current.opacity = v
    wicketMat.current.opacity = v * 0.22
  })

  return (
    <group ref={group} visible={false}>
      {/* pitch map: length zones at the batting end */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, -10.06 + 5.25]}>
        <planeGeometry args={[3.05, 10.5]} />
        <meshBasicMaterial ref={zoneMat} map={zoneTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* wicket zone in line with the stumps */}
      <mesh position={[0, 0.36, STUMPS_Z + 0.02]}>
        <planeGeometry args={[0.24, 0.72]} />
        <meshBasicMaterial ref={wicketMat} color={new THREE.Color(1.6, 0.9, 0.3)} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {balls.map((b, i) => (
        <group key={i}>
          <mesh geometry={b.geo} frustumCulled={false}>
            <shaderMaterial ref={bindUniforms(b.uniforms)} uniforms={b.uniforms} vertexShader={tubeVert} fragmentShader={tubeFrag} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[b.bounce.x, 0.016, b.bounce.z]} material={b.dot}>
            <ringGeometry args={[0.1, 0.17, 32]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
