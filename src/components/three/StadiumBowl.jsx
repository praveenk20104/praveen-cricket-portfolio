import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { lightLevel } from './lights'
import { bindUniforms } from './bindUniforms'

// The bowl of the stadium: three raked tiers of seats, a roof canopy with a ring of lights,
// sightscreens at both ends, a seated 3D crowd (with the Mexican wave) and waving tricolour flags.
// `detail` is the quality level: 'high' | 'medium' | 'low'.

const INK = new THREE.Color('#04060e')

// three tiers: radius from → to, height from → to, number of seat rows
const TIERS = [
  { r0: 88, r1: 100, y0: 1.6, y1: 10.6, rows: 9 },
  { r0: 103, r1: 114, y0: 13.2, y1: 22.2, rows: 9 },
  { r0: 117, r1: 125, y0: 25, y1: 32, rows: 7 },
]
const TOWER_ANGLES = [0.25, 0.75, 1.25, 1.75].map((a) => a * Math.PI)
const SIGHTSCREEN_HALF = 15 // metres either side of the pitch axis kept free behind each sightscreen

function rowsOf(tier) {
  const out = []
  const dr = (tier.r1 - tier.r0) / tier.rows
  const dy = (tier.y1 - tier.y0) / tier.rows
  for (let i = 0; i < tier.rows; i++) out.push({ r: tier.r0 + dr * (i + 0.5), y: tier.y0 + dy * (i + 1) })
  return out
}
const ROWS = TIERS.flatMap(rowsOf)

/* ---------- stands: a stepped lathe, every tread is a row of seats ---------- */
function standsGeometry() {
  const pts = [new THREE.Vector2(85, 0), new THREE.Vector2(85, 1.6)]
  let lastY = 1.6
  TIERS.forEach((t, ti) => {
    if (ti > 0) {
      pts.push(new THREE.Vector2(t.r0 - 1.5, lastY)) // concourse
      pts.push(new THREE.Vector2(t.r0 - 1.5, t.y0)) // wall up to the next tier
    }
    const dr = (t.r1 - t.r0) / t.rows
    const dy = (t.y1 - t.y0) / t.rows
    for (let i = 0; i < t.rows; i++) {
      const r = t.r0 + dr * i
      pts.push(new THREE.Vector2(r, t.y0 + dy * (i + 1))) // riser
      pts.push(new THREE.Vector2(r + dr, t.y0 + dy * (i + 1))) // tread
    }
    lastY = t.y1
  })
  pts.push(new THREE.Vector2(127, lastY), new THREE.Vector2(127, 40))
  return new THREE.LatheGeometry(pts, 160)
}

function seatTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 64
  const x = c.getContext('2d')
  const blocks = ['#1d4fc4', '#ff8f1f', '#1d4fc4', '#e9e6df', '#1d4fc4', '#0f8a45']
  blocks.forEach((col, i) => {
    x.fillStyle = col
    x.fillRect((i * 512) / blocks.length, 0, 512 / blocks.length, 64)
  })
  // aisles
  x.fillStyle = '#2a2a33'
  for (let i = 0; i < blocks.length; i++) x.fillRect((i * 512) / blocks.length, 0, 6, 64)
  // seat rows
  x.fillStyle = 'rgba(0,0,0,0.35)'
  for (let y = 0; y < 64; y += 8) x.fillRect(0, y, 512, 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(18, 6)
  return t
}

function Stands() {
  const geo = useMemo(() => standsGeometry(), [])
  const tex = useMemo(() => seatTexture(), [])
  const mat = useRef()
  useFrame(() => {
    const l = lightLevel()
    mat.current.color.setScalar(0.1 + 0.32 * l)
  })
  return (
    <mesh geometry={geo}>
      <meshLambertMaterial ref={mat} map={tex} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ---------- roof canopy with a ring of lights under its edge ---------- */
function Roof() {
  const geo = useMemo(
    () =>
      new THREE.LatheGeometry(
        [new THREE.Vector2(109, 43.2), new THREE.Vector2(131, 47.5), new THREE.Vector2(131, 48.6), new THREE.Vector2(109, 44.2), new THREE.Vector2(109, 43.2)],
        160
      ),
    []
  )
  const strip = useRef()
  useFrame(() => strip.current.color.setRGB(2.4, 2.2, 1.9).multiplyScalar(0.05 + 0.95 * lightLevel()))
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#0b0d14" roughness={0.7} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={43}>
        <torusGeometry args={[109.2, 0.16, 6, 220]} />
        <meshBasicMaterial ref={strip} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ---------- sightscreens behind both ends ---------- */
// Day-night cricket uses black sightscreens: a dark slatted panel with a thin LED strip on top.
function sightscreenTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 200
  const x = c.getContext('2d')
  x.fillStyle = '#070b16'
  x.fillRect(0, 0, 512, 200)
  for (let i = 0; i < 512; i += 16) {
    x.fillStyle = i % 32 ? '#0b1120' : '#0d1426'
    x.fillRect(i, 10, 14, 182)
  }
  x.fillStyle = '#ffa23a'
  x.fillRect(0, 0, 512, 5)
  x.fillStyle = '#2f6bff'
  x.fillRect(0, 5, 512, 4)
  x.fillStyle = '#1a2238'
  x.fillRect(0, 192, 512, 8)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function Sightscreens() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: sightscreenTexture(), toneMapped: false }), [])
  useFrame(() => mat.color.setScalar(0.35 + 0.65 * lightLevel()))
  return [-1, 1].map((end) => (
    <mesh key={end} position={[0, 5, end * 80]} rotation-y={end > 0 ? Math.PI : 0} material={mat}>
      <boxGeometry args={[26, 10, 0.4]} />
    </mesh>
  ))
}

/* ---------- seated crowd: instanced people, coloured shirts, Mexican wave in the shader ---------- */
const crowdVert = /* glsl */ `
  uniform float uTime;
  uniform float uLight;
  varying vec3 vCol;
  varying float vLit;
  varying float vDepth;
  void main() {
    vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    float ang = atan(ip.z, ip.x);
    float head = mod(uTime * 0.55, 6.28318);
    float d = abs(mod(ang - head + 3.14159, 6.28318) - 3.14159);
    float wave = smoothstep(0.42, 0.0, d) * uLight;
    float seed = fract(sin(dot(ip.xz, vec2(12.9898, 78.233))) * 43758.5453);
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    wp.y += wave * 0.8 + sin(uTime * (1.5 + seed * 2.5) + seed * 40.0) * 0.025;
    vCol = instanceColor;
    vLit = (0.1 + 0.5 * uLight) * (0.7 + 0.3 * normal.y) + wave * 0.45;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const crowdFrag = /* glsl */ `
  uniform vec3 uFog;
  varying vec3 vCol;
  varying float vLit;
  varying float vDepth;
  void main() {
    vec3 c = vCol * vLit;
    gl_FragColor = vec4(mix(c, uFog, smoothstep(32.0, 175.0, vDepth)), 1.0);
  }
`

const SHIRTS = ['#1d4fc4', '#2a63e0', '#ff8f1f', '#f2efe8', '#1d4fc4', '#ff9d33', '#14388f', '#0f8a45']

function CrowdPeople({ count }) {
  const mesh = useRef()
  const { geo, uniforms } = useMemo(() => {
    const body = new THREE.BoxGeometry(0.46, 0.62, 0.3)
    body.translate(0, 0.31, 0)
    const head = new THREE.IcosahedronGeometry(0.14, 0)
    head.translate(0, 0.8, 0)
    const g = mergeGeometries([body.toNonIndexed(), head.toNonIndexed()])
    g.computeVertexNormals()
    return { geo: g, uniforms: { uTime: { value: 0 }, uLight: { value: 0 }, uFog: { value: INK } } }
  }, [])

  const setup = (m) => {
    if (!m || m.userData.ready) return
    m.userData.ready = true
    const mtx = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const col = new THREE.Color()
    let placed = 0
    let guard = 0
    while (placed < count && guard++ < count * 6) {
      const row = ROWS[Math.floor(Math.random() * ROWS.length)]
      const a = Math.random() * Math.PI * 2
      // seats along a row: snap to a 0.62 m seat pitch
      const step = 0.62 / row.r
      const sa = Math.round(a / step) * step
      const x = Math.cos(sa) * row.r
      const z = Math.sin(sa) * row.r
      if (Math.abs(z) > 70 && Math.abs(x) < SIGHTSCREEN_HALF) continue
      if (TOWER_ANGLES.some((t) => Math.abs(Math.atan2(Math.sin(sa - t), Math.cos(sa - t))) < 0.035)) continue
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -sa - Math.PI / 2)
      const s = 0.9 + Math.random() * 0.2
      mtx.compose(new THREE.Vector3(x, row.y, z), q, new THREE.Vector3(s, s, s))
      m.setMatrixAt(placed, mtx)
      m.setColorAt(placed, col.set(SHIRTS[Math.floor(Math.random() * SHIRTS.length)]))
      placed++
    }
    m.count = placed
    m.instanceMatrix.needsUpdate = true
    m.instanceColor.needsUpdate = true
  }

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uLight.value = lightLevel()
  })

  return (
    <instancedMesh ref={(m) => ((mesh.current = m), setup(m))} args={[geo, undefined, count]} frustumCulled={false}>
      <shaderMaterial ref={bindUniforms(uniforms)} uniforms={uniforms} vertexShader={crowdVert} fragmentShader={crowdFrag} />
    </instancedMesh>
  )
}

/* ---------- waving tricolour flags held up in the stands ---------- */
function flagTexture() {
  const c = document.createElement('canvas')
  c.width = 300
  c.height = 200
  const x = c.getContext('2d')
  x.fillStyle = '#FF9933'
  x.fillRect(0, 0, 300, 67)
  x.fillStyle = '#FFFFFF'
  x.fillRect(0, 67, 300, 66)
  x.fillStyle = '#138808'
  x.fillRect(0, 133, 300, 67)
  // Ashoka Chakra: 24 spokes
  x.strokeStyle = '#000080'
  x.lineWidth = 3
  x.beginPath()
  x.arc(150, 100, 28, 0, Math.PI * 2)
  x.stroke()
  x.lineWidth = 1.4
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    x.beginPath()
    x.moveTo(150, 100)
    x.lineTo(150 + Math.cos(a) * 28, 100 + Math.sin(a) * 28)
    x.stroke()
  }
  x.fillStyle = '#000080'
  x.beginPath()
  x.arc(150, 100, 5, 0, Math.PI * 2)
  x.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const flagVert = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  varying vec2 vUv;
  varying float vShade;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec3 p = position;
    float x = uv.x;
    float w = sin(x * 5.0 - uTime * 5.5 + aPhase) * 0.16 * x + sin(x * 9.0 - uTime * 8.0 + aPhase * 1.7) * 0.05 * x;
    p.z += w;
    p.y += sin(x * 3.0 - uTime * 4.0 + aPhase) * 0.05 * x - x * 0.08;
    vShade = 0.72 + 0.28 * cos(x * 5.0 - uTime * 5.5 + aPhase);
    vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const flagFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uLight;
  uniform vec3 uFog;
  varying vec2 vUv;
  varying float vShade;
  varying float vDepth;
  void main() {
    vec3 c = texture2D(uMap, vUv).rgb * vShade * (0.18 + 0.82 * uLight);
    gl_FragColor = vec4(mix(c, uFog, smoothstep(40.0, 190.0, vDepth)), 1.0);
  }
`

function Flags({ count }) {
  const tex = useMemo(() => flagTexture(), [])
  const { flagGeo, poleGeo, uniforms, matrices } = useMemo(() => {
    const fg = new THREE.PlaneGeometry(2.1, 1.4, 16, 4)
    fg.translate(1.05, 0, 0) // hinge on the pole
    const phase = new Float32Array(count)
    for (let i = 0; i < count; i++) phase[i] = Math.random() * 6.28
    fg.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1))
    const pg = new THREE.CylinderGeometry(0.03, 0.03, 3.2, 5)
    pg.translate(0, -0.9, 0)
    const list = []
    const front = ROWS.filter((_, i) => i % 9 < 3) // front rows of each tier
    for (let i = 0; list.length < count && i < count * 20; i++) {
      const row = front[Math.floor(Math.random() * front.length)]
      const a = Math.random() * Math.PI * 2
      const x = Math.cos(a) * row.r
      const z = Math.sin(a) * row.r
      if (Math.abs(z) > 70 && Math.abs(x) < SIGHTSCREEN_HALF) continue
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, row.y + 2.6, z),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.random() * 0.6),
        new THREE.Vector3(1, 1, 1)
      )
      list.push(m)
    }
    return {
      flagGeo: fg,
      poleGeo: pg,
      matrices: list,
      uniforms: { uTime: { value: 0 }, uLight: { value: 0 }, uMap: { value: tex }, uFog: { value: INK } },
    }
  }, [count, tex])
  const setup = (m) => {
    if (!m || m.userData.ready) return
    m.userData.ready = true
    matrices.forEach((mtx, i) => m.setMatrixAt(i, mtx))
    m.count = matrices.length
    m.instanceMatrix.needsUpdate = true
  }
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uLight.value = lightLevel()
  })
  return (
    <group>
      <instancedMesh ref={setup} args={[flagGeo, undefined, count]} frustumCulled={false}>
        <shaderMaterial ref={bindUniforms(uniforms)} uniforms={uniforms} vertexShader={flagVert} fragmentShader={flagFrag} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={setup} args={[poleGeo, undefined, count]} frustumCulled={false}>
        <meshBasicMaterial color="#3a3a44" />
      </instancedMesh>
    </group>
  )
}

export default function StadiumBowl({ detail = 'high' }) {
  const people = detail === 'high' ? 9000 : detail === 'medium' ? 5200 : 2200
  const flags = detail === 'high' ? 48 : detail === 'medium' ? 30 : 16
  return (
    <group>
      <Stands />
      <Roof />
      <Sightscreens />
      <CrowdPeople key={`p${people}`} count={people} />
      <Flags key={`f${flags}`} count={flags} />
    </group>
  )
}

