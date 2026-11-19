import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
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
import IntroBall from './IntroBall'
import HawkEye from './HawkEye'
import BallCam from './BallCam'
import Confetti from './Confetti'
import Effects from './Effects'
import { store, isTouch } from '../../lib/store'

// Render driver. The canvas only draws when this asks it to, so it can
//  - draw at full rate normally,
//  - draw every 2nd screen refresh behind text-heavy sections (the 3D is mostly hidden by the scrim),
//  - draw every 2nd (or 3rd) refresh everywhere on a device that is still too slow at the lowest level.
// It also measures whether the device keeps up with the screen and steps quality up or down.
function Driver({ adaptive, onDecline, onIncline }) {
  const invalidate = useThree((s) => s.invalidate)
  const cb = useRef({ onDecline, onIncline })
  cb.current = { onDecline, onIncline }
  useEffect(() => {
    let raf
    let n = 0
    let frames = 0
    let last = performance.now()
    let refresh = 0
    let low = 0
    let high = 0
    let cooldown = 2
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      n++
      frames++
      const every = store.lite ? (store.dim ? 3 : 2) : store.dim && store.intro >= 1 ? 2 : 1
      if (n % every === 0) invalidate()
      if (now - last < 1000) return
      const fps = (frames * 1000) / (now - last)
      frames = 0
      last = now
      refresh = Math.max(refresh, Math.min(fps, 125))
      if (!adaptive || document.hidden || refresh < 20) return
      if (cooldown > 0) {
        cooldown--
        return
      }
      if (fps < refresh * 0.82) {
        low++
        high = 0
      } else if (fps > refresh * 0.96) {
        high++
        low = 0
      } else {
        low = 0
        high = 0
      }
      if (low >= 2) {
        low = 0
        cooldown = 2
        cb.current.onDecline()
      } else if (high >= 8) {
        high = 0
        cooldown = 2
        cb.current.onIncline()
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [invalidate, adaptive])
  return null
}

// Runs while the loader still covers the screen: every object is made visible and every shader
// is compiled now, so nothing stutters later when a new effect appears for the first time.
function Prewarm({ onReady }) {
  const { gl, scene, camera } = useThree()
  const frames = useRef(0)
  useFrame(() => {
    const f = ++frames.current
    if (f === 2) {
      try {
        gl.compile(scene, camera)
      } catch {
        /* older drivers: the frames below still warm everything up */
      }
    }
    if (f === 8) store.prewarm = false
    if (f === 11) onReady?.()
  })
  return null
}

// Studio-style reflections for the ball's clear-coat (generated, no HDRI download)
function Reflections() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.55}>
      <Lightformer form="rect" intensity={5} color="#fff3e8" position={[0, 7, 9]} scale={[10, 2, 1]} target={[0, 2, 9]} />
      <Lightformer form="ring" intensity={7} color="#ffa23a" position={[-6, 3, 11]} scale={3} target={[0, 2, 9]} />
      <Lightformer form="rect" intensity={4} color="#4d86ff" position={[6, 1, 10]} scale={[3, 7, 1]} target={[0, 2, 9]} />
      <Lightformer form="circle" intensity={2.5} color="#ffffff" position={[0, 10, -4]} scale={6} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} color="#4d86ff" position={[0, -4, 6]} scale={[12, 1, 1]} target={[0, 2, 9]} />
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
// Few CPU cores or little memory also means a modest device
const lowSpec = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4

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
        frameloop="demand"
        dpr={dpr}
        shadows={isTouch ? false : 'percentage'}
        camera={{ fov: 42, near: 0.1, far: 450, position: [6.27, 1.45, -16.6] }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          if (FORCED === null) setLevel(Math.max(0, START - (isWeakGpu(gl.getContext()) ? 1 : 0) - (lowSpec ? 1 : 0)))
        }}
      >
        <color attach="background" args={['#04060e']} />
        <fog attach="fog" args={['#04060e', 32, 175]} />
        <Driver
          adaptive={started && FORCED === null}
          onDecline={() =>
            setLevel((l) => {
              if (l === 0) store.lite = true // already at the lowest level: draw fewer frames instead
              const next = Math.max(0, l - 1)
              ceiling.current = next // never climb back above a level that was too slow
              return next
            })
          }
          onIncline={() => setLevel((l) => Math.min(ceiling.current, l + 1))}
        />
        <Suspense fallback={null}>
          <Reflections />
          <CameraRig />
          <Stadium shadows={quality === 'high'} beams={!lite} detail={lite ? 'low' : quality} />
          <Batsman />
          <IntroBall />
          <CricketBall />
          <Wicket />
          <SixShots />
          <HawkEye />
          <BallCam />
          <Confetti />
          <Fireworks />
          <SkillOrbit />
          <Particles />
          <Effects quality={quality} />
          <Prewarm onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
