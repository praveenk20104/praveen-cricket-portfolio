import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isTouch, reducedMotion } from '../../lib/store'

// Slow-floating red embers / fireflies — the cinematic "night match" atmosphere
const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;
  varying float vWarm;
  void main() {
    vec3 p = position;
    float t = uTime * 0.22 + aSeed * 40.0;
    p.x += sin(t * 0.9 + aSeed * 6.2831) * 0.9;
    p.y += sin(t * 0.6 + aSeed * 12.0) * 0.7;
    p.z += cos(t * 0.5 + aSeed * 3.0) * 0.9;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio / max(-mv.z, 0.5);
    vAlpha = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.8 + aSeed) + aSeed * 50.0));
    vWarm = step(0.82, fract(aSeed * 7.13));
  }
`
const frag = /* glsl */ `
  varying float vAlpha;
  varying float vWarm;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(vec3(2.6, 0.18, 0.3), vec3(2.6, 1.3, 0.5), vWarm);
    gl_FragColor = vec4(col, a * vAlpha);
  }
`

export default function Particles() {
  const geometry = useMemo(() => {
    const n = isTouch ? 320 : 850
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    const scale = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      // denser along the camera path (the pitch), sparse further out
      const near = Math.random() < 0.7
      pos[i * 3] = (Math.random() - 0.5) * (near ? 14 : 50)
      pos[i * 3 + 1] = 0.2 + Math.random() * (near ? 7 : 18)
      pos[i * 3 + 2] = (Math.random() - 0.5) * (near ? 34 : 60)
      seed[i] = Math.random()
      scale[i] = 0.4 + Math.random() * 1.2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: 52 },
    }),
    []
  )

  useFrame((state) => {
    uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
