import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { lightLevel } from './lights'
import { bindUniforms } from './bindUniforms'

// Real blades of grass around the pitch, swaying in the breeze. Only near the square,
// where the camera gets low (hero shot, services, ball-cam); the rest of the outfield is texture.
const vert = /* glsl */ `
  uniform float uTime;
  attribute vec3 aOffset;
  attribute float aHeight;
  attribute float aAngle;
  varying float vTip;
  varying float vTone;
  void main() {
    vTip = uv.y;
    vTone = fract(aOffset.x * 7.31 + aOffset.z * 3.17);
    vec3 p = position;
    // blades shrink towards the edge of the band so it melts into the outfield (no visible patch)
    float edge = (1.0 - smoothstep(4.5, 8.0, abs(aOffset.x))) * (1.0 - smoothstep(10.0, 15.0, abs(aOffset.z)));
    p.y *= aHeight * edge;
    p.x *= mix(0.4, 1.0, edge);
    float c = cos(aAngle);
    float s = sin(aAngle);
    p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
    float sway = sin(uTime * 1.7 + aOffset.x * 0.8 + aOffset.z * 0.6) * 0.5 + sin(uTime * 2.9 + aOffset.z * 1.3) * 0.25;
    p.x += sway * 0.018 * uv.y * uv.y;
    p.z += sway * 0.012 * uv.y * uv.y;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p + aOffset, 1.0);
  }
`
const frag = /* glsl */ `
  uniform float uLight;
  varying float vTip;
  varying float vTone;
  void main() {
    vec3 base = vec3(0.03, 0.1, 0.045);
    vec3 tip = mix(vec3(0.07, 0.22, 0.09), vec3(0.12, 0.28, 0.1), vTone);
    vec3 c = mix(base, tip, vTip * vTip) * (0.25 + 0.75 * uLight);
    gl_FragColor = vec4(c, 1.0);
  }
`

export default function Grass({ count = 24000 }) {
  const { geo, uniforms } = useMemo(() => {
    // one blade: a tapered strip of 3 segments
    const blade = new THREE.BufferGeometry()
    const w = 0.011
    const pos = [-w, 0, 0, w, 0, 0, -w * 0.7, 0.4, 0, w * 0.7, 0.4, 0, -w * 0.35, 0.75, 0, w * 0.35, 0.75, 0, 0, 1, 0]
    const uv = [0, 0, 1, 0, 0, 0.4, 1, 0.4, 0, 0.75, 1, 0.75, 0.5, 1]
    blade.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    blade.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6])
    const g = new THREE.InstancedBufferGeometry()
    g.index = blade.index
    g.attributes.position = blade.attributes.position
    g.attributes.uv = blade.attributes.uv
    const off = new Float32Array(count * 3)
    const h = new Float32Array(count)
    const ang = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // a band either side of the pitch strip, thinning out with distance
      let x
      do {
        x = (Math.random() * 2 - 1) * 8
      } while (Math.abs(x) < 1.62 || Math.random() > 1 - Math.abs(x) / 11)
      off[i * 3] = x
      off[i * 3 + 1] = 0
      off[i * 3 + 2] = (Math.random() * 2 - 1) * 15
      h[i] = 0.03 + Math.random() * 0.04
      ang[i] = Math.random() * Math.PI
    }
    g.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3))
    g.setAttribute('aHeight', new THREE.InstancedBufferAttribute(h, 1))
    g.setAttribute('aAngle', new THREE.InstancedBufferAttribute(ang, 1))
    g.instanceCount = count
    return { geo: g, uniforms: { uTime: { value: 0 }, uLight: { value: 0 } } }
  }, [count])
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uLight.value = lightLevel()
  })
  return (
    <mesh geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={bindUniforms(uniforms)} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} side={THREE.DoubleSide} />
    </mesh>
  )
}
