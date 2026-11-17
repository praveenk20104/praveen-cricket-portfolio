import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFloodlightTexture, createGrassTexture, createPitchTexture, PITCH } from './textures'
import { isTouch, store } from '../../lib/store'
import { profile } from '../../data/profile'

/* Fake volumetric light beam from each floodlight */
const beamVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const beamFrag = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float along = pow(vUv.y, 2.2);
    float edge = pow(abs(dot(vNormal, vView)), 1.6);
    gl_FragColor = vec4(uColor, along * edge * uOpacity);
  }
`

/* Crowd: thousands of tiny lights in the stands, with random camera flashes
   and a Mexican wave that travels round the ground */
const crowdVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uLit;
  attribute float aSeed;
  varying float vFlash;
  varying float vSeed;
  varying float vWave;
  void main() {
    vec3 p = position;
    float ang = atan(p.z, p.x);
    vWave = pow(max(0.0, cos(ang - uTime * 0.55)), 60.0) * uLit;
    p.y += vWave * 1.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float cycle = fract(uTime * 0.12 + aSeed * 13.7);
    vFlash = smoothstep(0.985, 0.995, cycle) * (1.0 - smoothstep(0.995, 1.0, cycle));
    vSeed = aSeed;
    gl_PointSize = (2.0 + vFlash * 10.0 + vWave * 2.5) * uPixelRatio * (60.0 / -mv.z);
  }
`
const crowdFrag = /* glsl */ `
  uniform float uLit;
  varying float vFlash;
  varying float vSeed;
  varying float vWave;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 base = mix(vec3(0.55, 0.12, 0.16), vec3(0.35, 0.3, 0.45), step(0.6, fract(vSeed * 91.7)));
    vec3 col = mix(base * (0.12 + 0.38 * uLit) + vec3(1.6, 0.35, 0.45) * vWave, vec3(4.0), vFlash);
    gl_FragColor = vec4(col, a * (0.55 + vFlash));
  }
`

function Crowd() {
  const mat = useRef()
  const geometry = useMemo(() => {
    const n = isTouch ? 2600 : 6500
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const tier = Math.random()
      const r = 95 + tier * 25 - 0.6
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = 1.2 + tier * 30
      pos[i * 3 + 2] = Math.sin(a) * r
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uLit: { value: 0 } }),
    []
  )
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime
    uniforms.uLit.value = store.lit
  })
  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={crowdVert}
        fragmentShader={crowdFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const PANEL_ON = new THREE.Color(3.2, 3.0, 2.7)

function FloodlightTower({ index, angle, beams }) {
  const tex = useMemo(() => createFloodlightTexture(), [])
  const r = 104
  const head = new THREE.Vector3(Math.cos(angle) * r, 54, Math.sin(angle) * r)
  const target = new THREE.Vector3(Math.cos(angle) * 18, 0, Math.sin(angle) * 18)
  const beam = useMemo(() => {
    const dir = head.clone().sub(target)
    const len = dir.length()
    const mid = head.clone().add(target).multiplyScalar(0.5)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    return { len, mid, q }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle])
  const panelMat = useRef()
  const flare = useRef({ last: 0, k: 0 })
  const base = isTouch ? 0.05 : 0.07
  const uniforms = useMemo(() => ({ uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#fff1dc') } }), [])
  useFrame((_, delta) => {
    const l = store.lights[index]
    const f = flare.current
    if (l > f.last + 0.5) f.k = 1 // the tower just banged on: brief over-bright flare
    f.last = l
    f.k = Math.max(0, f.k - Math.min(delta, 0.05) * 2.2)
    const k = 0.04 + 0.96 * l + f.k * 1.4
    panelMat.current.color.copy(PANEL_ON).multiplyScalar(k)
    uniforms.uOpacity.value = base * (l + f.k * 1.6)
  })
  return (
    <group>
      <mesh position={[head.x * 1.02, 26, head.z * 1.02]}>
        <cylinderGeometry args={[0.5, 1.1, 54, 8]} />
        <meshStandardMaterial color="#0d0b10" roughness={0.8} />
      </mesh>
      <mesh position={head} onUpdate={(m) => m.lookAt(0, 6, 0)}>
        <planeGeometry args={[14, 7]} />
        <meshBasicMaterial ref={panelMat} map={tex} toneMapped={false} />
      </mesh>
      <mesh position={beam.mid} quaternion={beam.q} visible={beams}>
        <coneGeometry args={[26, beam.len, 40, 1, true]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={beamVert}
          fragmentShader={beamFrag}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// Giant LED screen behind the batting end, like a real ground
function BigScreen() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 448
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    const draw = () => {
      const x = c.getContext('2d')
      x.fillStyle = '#0a0508'
      x.fillRect(0, 0, 1024, 448)
      x.fillStyle = '#e5142e'
      x.fillRect(0, 0, 1024, 70)
      x.fillStyle = '#fff'
      x.textBaseline = 'middle'
      x.font = "400 40px Anton, Impact, sans-serif"
      x.fillText('● LIVE', 30, 37)
      x.textAlign = 'right'
      x.fillText('NEW BATTER', 994, 37)
      x.textAlign = 'center'
      x.font = "400 150px Anton, Impact, sans-serif"
      x.fillText(profile.name.toUpperCase(), 512, 178)
      x.fillStyle = '#ff3b55'
      x.font = "400 54px Anton, Impact, sans-serif"
      x.fillText(profile.role.toUpperCase(), 512, 290)
      x.fillStyle = 'rgba(255,255,255,0.85)'
      x.font = "400 38px Anton, Impact, sans-serif"
      x.fillText('9,000+ APPS   ·   4B+ REVIEWS   ·   4 DASHBOARDS   ·   NOT OUT*', 512, 385)
      t.needsUpdate = true
    }
    draw()
    document.fonts?.load("400 100px Anton").then(draw).catch(() => {})
    return t
  }, [])
  // bright for the walk-in and the training section, dimmed elsewhere so it never fights with the text
  const screenMat = useRef()
  useFrame(({ size }) => {
    const s = store.stage
    const ss = THREE.MathUtils.smoothstep
    const portrait = size.width / size.height <= 1 // on phones the hero text sits where the screen is
    const k = (portrait ? 0 : 1 - ss(s, 0.45, 0.95)) * store.lit
    screenMat.current.color.setScalar(0.035 + 1.45 * k)
  })
  return (
    <group position={[-26.5, 13, -95.5]} onUpdate={(g) => g.lookAt(0, 4, 0)}>
      <mesh position-z={-0.4}>
        <boxGeometry args={[27.2, 12.5, 0.6]} />
        <meshStandardMaterial color="#08060a" roughness={0.6} />
      </mesh>
      <mesh>
        <planeGeometry args={[26, 11.4]} />
        <meshBasicMaterial ref={screenMat} map={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

// Scrolling LED advertising boards just outside the boundary rope
function LedBoards() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4096
    c.height = 64
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.repeat.x = -7 // negative: the boards are seen from inside the ground, so un-mirror the text
    const words = ['PRAVEEN KUMAR', 'DATA ANALYST', 'POWER BI', 'SQL', 'PYTHON', 'MIS REPORTING', 'ADVANCED EXCEL', 'NOT OUT 19*']
    const draw = () => {
      const x = c.getContext('2d')
      x.fillStyle = '#07040a'
      x.fillRect(0, 0, 4096, 64)
      x.font = "400 44px Anton, Impact, sans-serif"
      x.textBaseline = 'middle'
      let px = 30
      words.forEach((w, i) => {
        const red = i % 2 === 0
        x.fillStyle = red ? '#e5142e' : '#0b1c58'
        const width = x.measureText(w).width + 60
        x.fillRect(px - 30, 6, width, 52)
        x.fillStyle = '#ffffff'
        x.fillText(w, px, 34)
        px += width + 24
      })
      t.needsUpdate = true
    }
    draw()
    document.fonts?.load("400 44px Anton").then(draw).catch(() => {})
    return t
  }, [])
  const mat = useRef()
  useFrame((_, delta) => {
    tex.offset.x = (tex.offset.x + Math.min(delta, 0.05) * 0.012) % 1
    mat.current.color.setScalar(0.06 + 1.25 * store.lit)
  })
  return (
    <mesh position-y={0.5}>
      <cylinderGeometry args={[69.4, 69.4, 0.95, 200, 1, true]} />
      <meshBasicMaterial ref={mat} map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

export default function Stadium({ shadows, beams = true }) {
  const key = useRef()
  const hemi = useRef()
  const rope = useRef()
  useFrame(() => {
    const L = store.lights
    store.lit = (L[0] + L[1] + L[2] + L[3]) / 4
    key.current.intensity = 1.6 * store.lit
    hemi.current.intensity = 0.15 + 0.45 * store.lit
    rope.current.color.setRGB(2.2, 0.08, 0.2).multiplyScalar(0.25 + 0.75 * store.lit)
  })
  const pitchTex = useMemo(() => createPitchTexture(), [])
  const grassTex = useMemo(() => createGrassTexture(isTouch ? 1024 : 2048), [])

  return (
    <group>
      {/* Outfield */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow={shadows}>
        <circleGeometry args={[85, 128]} />
        <meshStandardMaterial map={grassTex} roughness={0.95} metalness={0} />
      </mesh>

      {/* Pitch strip */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} receiveShadow={shadows}>
        <planeGeometry args={[PITCH.width, PITCH.length]} />
        <meshStandardMaterial map={pitchTex} roughness={0.88} metalness={0} />
      </mesh>

      {/* Neon boundary rope */}
      <mesh rotation-x={Math.PI / 2} position-y={0.12}>
        <torusGeometry args={[68, 0.045, 6, 256]} />
        <meshBasicMaterial ref={rope} toneMapped={false} />
      </mesh>
      <LedBoards />

      {/* Raked stands */}
      <mesh position-y={15}>
        <cylinderGeometry args={[120, 95, 30, 96, 6, true]} />
        <meshStandardMaterial color="#0b070d" roughness={1} side={THREE.BackSide} />
      </mesh>
      <Crowd />
      <BigScreen />

      {[0.25, 0.75, 1.25, 1.75].map((a, i) => (
        <FloodlightTower key={a} index={i} angle={a * Math.PI} beams={beams} />
      ))}

      {/* Floodlight key light (casts the stumps' shadows on the pitch) */}
      <directionalLight
        ref={key}
        position={[9, 20, 6]}
        intensity={0}
        color="#fff4e8"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />
      <hemisphereLight ref={hemi} args={['#3a1a28', '#050208', 0.15]} />
      <ambientLight intensity={0.12} />
    </group>
  )
}
