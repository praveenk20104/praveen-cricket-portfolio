import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Stadium from './Stadium'
import CricketBall from './CricketBall'
import Wicket from './Wicket'
import SkillOrbit from './SkillOrbit'
import Particles from './Particles'
import Batsman from './Batsman'
import SixShots from './SixShots'
import Fireworks from './Fireworks'
import Effects from './Effects'
import { store, isTouch, onSectionChange } from '../../lib/store'

// Without post-processing the renderer itself must do the filmic tone mapping
function ToneMap({ quality }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.toneMapping = quality === 'min' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
  }, [gl, quality])
  return null
}

function ReadySignal({ onReady }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    frames.current++
    if (!done.current && frames.current > 3) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

// Studio-style reflections for the ball's clear-coat (generated, no HDRI download)
function Reflections() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.55}>
      <Lightformer form="rect" intensity={5} color="#fff3e8" position={[0, 7, 9]} scale={[10, 2, 1]} target={[0, 2, 9]} />
      <Lightformer form="ring" intensity={7} color="#ff1f3d" position={[-6, 3, 11]} scale={3} target={[0, 2, 9]} />
      <Lightformer form="rect" intensity={4} color="#ff2a48" position={[6, 1, 10]} scale={[3, 7, 1]} target={[0, 2, 9]} />
      <Lightformer form="circle" intensity={2.5} color="#ffffff" position={[0, 10, -4]} scale={6} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} color="#ff4060" position={[0, -4, 6]} scale={[12, 1, 1]} target={[0, 2, 9]} />
    </Environment>
  )
}

// Quality ladder. The site starts in the middle and moves itself up or down
// depending on the real frame rate of the visitor's device.
//   low    = bloom + grain only, no shadows, no light beams, no glass blur
//   medium = + anti-aliasing + shadows
//   high   = + depth of field + chromatic aberration
// Each level also has a pixel budget (px). The 3D picture is rendered at whatever resolution
// fits that budget and then stretched to the screen, so a 4K Smart TV, an iPad and a small
// laptop all give the graphics chip the same amount of work.
//   min    = no post-processing at all (the renderer does the tone mapping), for weak phones
const TIERS = isTouch
  ? [{ q: 'min', px: 0.38e6 }, { q: 'low', px: 0.62e6 }, { q: 'low', px: 1.0e6 }]
  : [{ q: 'min', px: 0.7e6 }, { q: 'low', px: 1.2e6 }, { q: 'medium', px: 2.2e6 }, { q: 'high', px: 3.6e6 }]
const START = isTouch ? 1 : 2
// Optional manual override for testing: add ?q=low, ?q=medium or ?q=high to the URL
const FORCED = (() => {
  const q = new URLSearchParams(window.location.search).get('q')
  for (let i = TIERS.length - 1; i >= 0; i--) if (TIERS[i].q === q) return i
  return null
})()

// Laptops with built-in graphics and older phones start one step lower, so the first
// seconds are already smooth. If the device turns out to be fast, it climbs back up.
function isWeakGpu(ctx) {
  try {
    const ext = ctx.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    return /swiftshader|llvmpipe|basic render|intel(?!.*\barc\b)|mali-(t|4|g3|g5)|adreno \(tm\) [1-5]\d\d|powervr/i.test(name)
  } catch {
    return false
  }
}

export default function Experience({ onReady, started }) {
  const [level, setLevel] = useState(FORCED ?? START)
  const ceiling = useRef(TIERS.length - 1)
  const tier = TIERS[level]
  const quality = tier.q
  const [area, setArea] = useState(() => window.innerWidth * window.innerHeight)
  useEffect(() => {
    let t
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => setArea(window.innerWidth * window.innerHeight), 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  const dpr = Math.round(THREE.MathUtils.clamp(Math.sqrt(tier.px / area), 0.5, Math.min(window.devicePixelRatio || 1, 2)) * 100) / 100
  const lite = level < START // the device has struggled: switch off the expensive extras
  const wrap = useRef()

  // Live glass blur over a moving 3D scene is one of the most expensive things a browser can do,
  // so phones and tablets always use solid panels, and so does any device that has struggled
  useEffect(() => {
    document.documentElement.classList.toggle('perf-min', lite || isTouch)
  }, [lite])

  // The skill labels are HTML elements that move every frame: only create them near the Skills section
  const [skillsNear, setSkillsNear] = useState(false)
  useEffect(() => onSectionChange((i) => setSkillsNear(i >= 3 && i <= 5)), [])

  // Drag / swipe to spin the ball (horizontal swipes don't block vertical page scroll)
  useEffect(() => {
    const el = wrap.current
    let down = false
    let lx = 0
    let ly = 0
    const onDown = (e) => {
      down = true
      lx = e.clientX
      ly = e.clientY
    }
    const onMove = (e) => {
      if (!down) return
      store.spin.x += (e.clientX - lx) * 0.06
      store.spin.y += (e.clientY - ly) * 0.03
      store.spin.x = THREE.MathUtils.clamp(store.spin.x, -18, 18)
      store.spin.y = THREE.MathUtils.clamp(store.spin.y, -4, 4)
      lx = e.clientX
      ly = e.clientY
    }
    const onUp = () => (down = false)
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div ref={wrap} className="webgl" aria-hidden="true">
      <Canvas
        dpr={dpr}
        shadows={isTouch ? false : 'percentage'}
        camera={{ fov: 42, near: 0.1, far: 450, position: [52, 40, 46] }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          if (FORCED === null && isWeakGpu(gl.getContext())) setLevel(START - 1)
        }}
      >
        <color attach="background" args={['#050206']} />
        <fog attach="fog" args={['#050206', 32, 175]} />
        {started && FORCED === null && (
          <PerformanceMonitor
            bounds={(refresh) => (refresh > 90 ? [50, 85] : [50, 58])}
            onDecline={() =>
              setLevel((l) => {
                const next = Math.max(0, l - 1)
                ceiling.current = next // never climb back above a level that was too slow
                return next
              })
            }
            onIncline={() => setLevel((l) => Math.min(ceiling.current, l + 1))}
          />
        )}
        <Suspense fallback={null}>
          <Reflections />
          <CameraRig />
          <Stadium shadows={!isTouch && quality !== 'low'} beams={!lite} />
          <Batsman />
          <CricketBall />
          <Wicket />
          <SixShots />
          <Fireworks />
          {skillsNear && <SkillOrbit />}
          <ToneMap quality={quality} />
          <Particles />
          <Effects quality={quality} />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
