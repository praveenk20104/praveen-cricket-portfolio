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

/* Crowd: thousands of tiny lights in the stands, with random camera flashes */
const crowdVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uLight;
  attribute float aSeed;
  varying float vFlash;
  varying float vSeed;
  varying float vWave;
  void main() {
    // Mexican wave: a band of fans standing up travels round the ground
    float ang = atan(position.z, position.x);
    float head = mod(uTime * 0.55, 6.28318);
    float d = abs(mod(ang - head + 3.14159, 6.28318) - 3.14159);
    vWave = smoothstep(0.42, 0.0, d) * uLight;
    vec3 p = position + vec3(0.0, vWave * 1.6, 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float cycle = fract(uTime * 0.12 + aSeed * 13.7);
    vFlash = smoothstep(0.985, 0.995, cycle) * (1.0 - smoothstep(0.995, 1.0, cycle)) * uLight;
    vSeed = aSeed;
    gl_PointSize = (2.0 + vFlash * 10.0 + vWave * 2.5) * uPixelRatio * (60.0 / -mv.z);
  }
`
const crowdFrag = /* glsl */ `
  uniform float uLight;
  varying float vFlash;
  varying float vSeed;
  varying float vWave;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    float pick = fract(vSeed * 91.7);
    vec3 base = pick < 0.45 ? vec3(0.16, 0.32, 0.85) : pick < 0.75 ? vec3(1.0, 0.5, 0.12) : vec3(0.55, 0.12, 0.16);
    vec3 col = mix(base * (0.25 + 0.35 * uLight + vWave * 1.2), vec3(4.0), vFlash);
    gl_FragColor = vec4(col, a * (0.3 + 0.3 * uLight + vWave * 0.4 + vFlash));
  }
`

// Floodlights switch on one tower at a time during the intro (store.flood goes 0 → 1).
export const towerOn = (i) => THREE.MathUtils.smoothstep(store.flood, 0.1 + i * 0.2, 0.14 + i * 0.2)
const towerFlash = (i) => {
  const t = store.flood - (0.1 + i * 0.2)
  return t > 0 && t < 0.1 ? 1 - t / 0.1 : 0
}
export const lightLevel = () => (towerOn(0) + towerOn(1) + towerOn(2) + towerOn(3)) / 4

function Crowd() {
  const mat = useRef()
  const geometry = useMemo(() => {
    const n = isTouch ? 2200 : 6000
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
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uLight: { value: 0 } }),
    []
  )
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime
    uniforms.uLight.value = lightLevel()
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

function FloodlightTower({ angle, beams, index }) {
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
  const panelRef = useRef()
  const beamMax = isTouch ? 0.05 : 0.07
  const uniforms = useMemo(() => ({ uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#fff1dc') } }), [])
  const panelColor = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const on = towerOn(index)
    const flash = towerFlash(index)
    panelColor.setRGB(3.2, 3.0, 2.7).multiplyScalar(0.03 + on * 0.97 + flash * 1.6)
    panelRef.current.material.color.copy(panelColor)
    uniforms.uOpacity.value = beamMax * (on + flash * 1.5)
  })
  return (
    <group>
      <mesh position={[head.x * 1.02, 26, head.z * 1.02]}>
        <cylinderGeometry args={[0.5, 1.1, 54, 8]} />
        <meshStandardMaterial color="#0d0b10" roughness={0.8} />
      </mesh>
      <mesh
        ref={panelRef}
        position={head}
        onUpdate={(m) => m.lookAt(0, 6, 0)}
      >
        <planeGeometry args={[14, 7]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
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

// LED advertising boards all the way round the boundary, scrolling like at a real ground
function LedBoards() {
  const mat = useRef()
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 64
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(-6, 1) // negative: the boards are seen from inside the ring
    const draw = () => {
      const x = c.getContext('2d')
      const items = [
        ['PRAVEEN KUMAR', '#ffffff', '#e5142e'],
        ['DATA ANALYST', '#ffffff', '#123fa8'],
        ['MIS EXECUTIVE', '#0a0508', '#ff8a1f'],
        ['POWER BI · SQL · PYTHON · EXCEL', '#ffffff', '#0a0508'],
      ]
      const w = c.width / items.length
      items.forEach(([label, fg, bg], i) => {
        x.fillStyle = bg
        x.fillRect(i * w, 0, w, 64)
        x.fillStyle = fg
        x.font = "400 40px Anton, Impact, sans-serif"
        x.textAlign = 'center'
        x.textBaseline = 'middle'
        x.fillText(label, i * w + w / 2, 34)
      })
      t.needsUpdate = true
    }
    draw()
    document.fonts?.load('400 40px Anton').then(draw).catch(() => {})
    return t
  }, [])
  useFrame((_, dt) => {
    tex.offset.x = (tex.offset.x + Math.min(dt, 0.05) * 0.02) % 1
    mat.current.color.setScalar(0.08 + 1.25 * lightLevel())
  })
  return (
    <mesh position-y={0.55}>
      <cylinderGeometry args={[69.4, 69.4, 0.9, 160, 1, true]} />
      <meshBasicMaterial ref={mat} map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
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
    const hero = portrait ? 0 : 1 - ss(s, 0.45, 0.95)
    const k = Math.max(hero, ss(s, 7.4, 7.9) * (1 - ss(s, 8.45, 8.9)))
    screenMat.current.color.setScalar((0.035 + 1.45 * k) * (0.05 + 0.95 * lightLevel()))
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

export default function Stadium({ shadows, beams = true }) {
  const sun = useRef()
  const sky = useRef()
  const amb = useRef()
  useFrame(() => {
    const l = lightLevel()
    sun.current.intensity = 1.6 * (0.12 + 0.88 * l)
    sky.current.intensity = 0.6 * (0.3 + 0.7 * l)
    amb.current.intensity = 0.12 * (0.4 + 0.6 * l)
  })
  const pitchTex = useMemo(() => createPitchTexture(), [])
  const grassTex = useMemo(() => createGrassTexture(isTouch ? 1024 : 2048), [])
  const ropeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.08, 0.2), toneMapped: false }),
    []
  )

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
      <mesh rotation-x={Math.PI / 2} position-y={0.12} material={ropeMat}>
        <torusGeometry args={[68, 0.045, 6, 256]} />
      </mesh>

      {/* Raked stands */}
      <mesh position-y={15}>
        <cylinderGeometry args={[120, 95, 30, 96, 6, true]} />
        <meshStandardMaterial color="#0b070d" roughness={1} side={THREE.BackSide} />
      </mesh>
      <Crowd />
      <BigScreen />
      <LedBoards />

      {[0.25, 0.75, 1.25, 1.75].map((a, i) => (
        <FloodlightTower key={a} index={i} angle={a * Math.PI} beams={beams} />
      ))}

      {/* Floodlight key light (casts the stumps' shadows on the pitch) */}
      <directionalLight
        ref={sun}
        position={[9, 20, 6]}
        intensity={1.6}
        color="#fff4e8"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />
      <hemisphereLight ref={sky} args={['#3a1a28', '#050208', 0.6]} />
      <ambientLight ref={amb} intensity={0.12} />
    </group>
  )
}
