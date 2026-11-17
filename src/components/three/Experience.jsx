import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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
import { store, isTouch } from '../../lib/store'

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
const TIERS = isTouch
  ? [{ q: 'low', px: 0.45e6 }, { q: 'low', px: 0.8e6 }, { q: 'low', px: 1.3e6 }]
  : [{ q: 'low', px: 0.9e6 }, { q: 'low', px: 1.5e6 }, { q: 'medium', px: 2.6e6 }, { q: 'high', px: 4.6e6 }]
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

  useEffect(() => {
    document.documentElement.classList.toggle('perf-min', lite)
  }, [lite])

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
        camera={{ fov: 42, near: 0.1, far: 450, position: [6.27, 1.45, -16.6] }}
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
          <SkillOrbit />
          <Particles />
          <Effects quality={quality} />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
