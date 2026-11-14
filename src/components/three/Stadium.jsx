import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFloodlightTexture, createGrassTexture, createPitchTexture, PITCH } from './textures'
import { isTouch } from '../../lib/store'

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
  attribute float aSeed;
  varying float vFlash;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float cycle = fract(uTime * 0.12 + aSeed * 13.7);
    vFlash = smoothstep(0.985, 0.995, cycle) * (1.0 - smoothstep(0.995, 1.0, cycle));
    vSeed = aSeed;
    gl_PointSize = (2.0 + vFlash * 10.0) * uPixelRatio * (60.0 / -mv.z);
  }
`
const crowdFrag = /* glsl */ `
  varying float vFlash;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 base = mix(vec3(0.55, 0.12, 0.16), vec3(0.35, 0.3, 0.45), step(0.6, fract(vSeed * 91.7)));
    vec3 col = mix(base * 0.5, vec3(4.0), vFlash);
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
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }),
    []
  )
  useFrame((s) => (uniforms.uTime.value = s.clock.elapsedTime))
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

function FloodlightTower({ angle }) {
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
  const uniforms = useMemo(
    () => ({ uOpacity: { value: isTouch ? 0.05 : 0.07 }, uColor: { value: new THREE.Color('#fff1dc') } }),
    []
  )
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
        <meshBasicMaterial map={tex} color={new THREE.Color(3.2, 3.0, 2.7)} toneMapped={false} />
      </mesh>
      <mesh position={beam.mid} quaternion={beam.q}>
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

export default function Stadium({ shadows }) {
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

      {[0.25, 0.75, 1.25, 1.75].map((a) => (
        <FloodlightTower key={a} angle={a * Math.PI} />
      ))}

      {/* Floodlight key light (casts the stumps' shadows on the pitch) */}
      <directionalLight
        position={[9, 20, 6]}
        intensity={1.6}
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
      <hemisphereLight args={['#3a1a28', '#050208', 0.6]} />
      <ambientLight intensity={0.12} />
    </group>
  )
}
