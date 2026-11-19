import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { on, reducedMotion, store } from '../../lib/store'
import { BALL_POS } from './CricketBall'
import { bindUniforms } from './bindUniforms'

// Next innings: the four ways to reach Praveen (email, phone, LinkedIn, GitHub) orbit the match ball
// like satellites, each on its own tilted orbit with a glowing comet tail. Hovering a contact card in
// the page lights up the matching satellite; reaching out sends a pulse round its orbit.
const CHANNELS = [
  { id: 'email', color: '#ffa23a', ink: '#0b1020', r: 1.95, rot: [1.15, 0.0, 0.35], speed: 0.32, phase: 0.2 },
  { id: 'phone', color: '#2fd27a', ink: '#ffffff', r: 2.15, rot: [1.42, 0.62, -0.5], speed: -0.26, phase: 2.1 },
  { id: 'linkedin', color: '#4d86ff', ink: '#ffffff', r: 2.05, rot: [0.85, -0.7, 0.95], speed: 0.29, phase: 4.0 },
  { id: 'github', color: '#f4f1ea', ink: '#0b1020', r: 2.3, rot: [1.62, 0.25, 1.7], speed: -0.22, phase: 5.3 },
]
const smooth = THREE.MathUtils.smoothstep
const damp = THREE.MathUtils.damp

function iconTexture({ id, color, ink }) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const x = c.getContext('2d')
  const g = x.createRadialGradient(S * 0.36, S * 0.3, S * 0.04, S / 2, S / 2, S * 0.47)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.22, color)
  g.addColorStop(1, '#05070f')
  x.fillStyle = g
  x.beginPath()
  x.arc(S / 2, S / 2, S * 0.44, 0, Math.PI * 2)
  x.fill()
  x.lineWidth = 6
  x.strokeStyle = 'rgba(255,255,255,0.85)'
  x.stroke()
  x.strokeStyle = ink
  x.fillStyle = ink
  x.lineWidth = 13
  x.lineCap = 'round'
  x.lineJoin = 'round'
  x.save()
  x.translate(S / 2, S / 2)
  if (id === 'email') {
    x.strokeRect(-58, -40, 116, 80)
    x.beginPath()
    x.moveTo(-54, -34)
    x.lineTo(0, 8)
    x.lineTo(54, -34)
    x.stroke()
  } else if (id === 'phone') {
    x.beginPath()
    if (x.roundRect) x.roundRect(-34, -62, 68, 124, 14)
    else x.rect(-34, -62, 68, 124)
    x.stroke()
    x.beginPath()
    x.moveTo(-10, 42)
    x.lineTo(10, 42)
    x.stroke()
  } else if (id === 'linkedin') {
    x.font = 'bold 118px Arial, sans-serif'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText('in', 2, 6)
  } else {
    x.beginPath()
    x.moveTo(-28, -38)
    x.lineTo(-64, 0)
    x.lineTo(-28, 38)
    x.moveTo(28, -38)
    x.lineTo(64, 0)
    x.lineTo(28, 38)
    x.moveTo(12, -50)
    x.lineTo(-12, 50)
    x.stroke()
  }
  x.restore()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// orbit ring: faint all the way round, bright comet tail just behind the satellite
const orbitVert = /* glsl */ `
  varying float vU;
  void main() {
    vU = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const orbitFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uHead;
  uniform float uDir;
  uniform float uOpacity;
  uniform float uBoost;
  varying float vU;
  void main() {
    float d = fract((uHead - vU) * uDir);          // 0 at the satellite, growing along the tail
    float tail = pow(1.0 - d, 7.0);
    float a = (0.07 + 0.08 * uBoost) + tail * (0.95 + uBoost);
    gl_FragColor = vec4(uColor * (1.0 + tail * 1.6 + uBoost), a * uOpacity);
  }
`

export default function ContactOrbit() {
  const group = useRef()
  const focus = useRef(-1)
  const pulses = useRef([0, 0, 0, 0])
  const halo = useMemo(() => haloTexture(), [])
  const items = useMemo(
    () =>
      CHANNELS.map((ch) => ({
        ...ch,
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(...ch.rot)),
        geo: new THREE.TorusGeometry(ch.r, 0.011, 6, 200),
        icon: new THREE.SpriteMaterial({ map: iconTexture(ch), transparent: true, depthWrite: false, toneMapped: false }),
        glow: new THREE.SpriteMaterial({
          map: halo,
          color: new THREE.Color(ch.color).multiplyScalar(ch.id === 'github' ? 0.8 : 1.9),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        }),
        uniforms: {
          uColor: { value: new THREE.Color(ch.color) },
          uHead: { value: 0 },
          uDir: { value: Math.sign(ch.speed) },
          uOpacity: { value: 0 },
          uBoost: { value: 0 },
        },
        scale: 1,
      })),
    [halo]
  )
  const sats = useRef([])

  useEffect(() => {
    const offFocus = on('contactFocus', (i) => (focus.current = i))
    const offCheer = on('cheer', (i) => {
      if (i >= 0) pulses.current[i] = 1
      else pulses.current = [1, 1, 1, 1]
    })
    return () => {
      offFocus()
      offCheer()
    }
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const vis = smooth(store.stage, 9.3, 9.9)
    group.current.visible = vis > 0.01 || store.prewarm
    if (!group.current.visible) return
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    group.current.position.y = BALL_POS.y + Math.sin(state.clock.elapsedTime * 1.3) * 0.07
    // the whole system unfolds as the section arrives
    group.current.scale.setScalar(0.55 + 0.45 * vis)

    items.forEach((it, i) => {
      const sat = sats.current[i]
      if (!sat) return
      const p = pulses.current[i]
      if (p > 0) pulses.current[i] = Math.max(0, p - dt * 0.9)
      const hot = focus.current === i
      const target = hot ? 1.55 : focus.current >= 0 ? 0.8 : 1
      it.scale = damp(it.scale, target + p * 0.6, 7, dt)
      const ang = it.phase + t * it.speed * (hot ? 0.45 : 1) * (1 + p * 3)
      sat.position.set(Math.cos(ang) * it.r, Math.sin(ang) * it.r, 0)
      sat.scale.setScalar(it.scale)
      const u = it.uniforms
      u.uHead.value = (((ang / (Math.PI * 2)) % 1) + 1) % 1
      u.uOpacity.value = vis * (focus.current >= 0 && !hot ? 0.45 : 1)
      u.uBoost.value = damp(u.uBoost.value, (hot ? 1 : 0) + p, 8, dt)
      it.icon.opacity = vis
      it.glow.opacity = vis * (0.55 + 0.45 * u.uBoost.value)
    })
  })

  return (
    <group ref={group} position={BALL_POS} visible={false}>
      {items.map((it, i) => (
        <group key={it.id} quaternion={it.quat}>
          <mesh geometry={it.geo} frustumCulled={false}>
            <shaderMaterial
              ref={bindUniforms(it.uniforms)}
              uniforms={it.uniforms}
              vertexShader={orbitVert}
              fragmentShader={orbitFrag}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <group ref={(g) => (sats.current[i] = g)}>
            <sprite material={it.glow} scale={0.9} />
            <sprite material={it.icon} scale={0.46} />
          </group>
        </group>
      ))}
    </group>
  )
}
