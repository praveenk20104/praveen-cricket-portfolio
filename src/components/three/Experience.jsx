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

export default function Experience({ onReady }) {
  const [quality, setQuality] = useState(isTouch ? 'low' : 'high')
  const [dpr, setDpr] = useState(isTouch ? 1.5 : 2)
  const wrap = useRef()

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
        dpr={[1, dpr]}
        shadows={isTouch ? false : 'percentage'}
        camera={{ fov: 42, near: 0.1, far: 450, position: [0, 6, 26] }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
        }}
      >
        <color attach="background" args={['#050206']} />
        <fog attach="fog" args={['#050206', 32, 175]} />
        <PerformanceMonitor
          onDecline={() => {
            setQuality('low')
            setDpr(1)
          }}
        />
        <Suspense fallback={null}>
          <Reflections />
          <CameraRig />
          <Stadium shadows={!isTouch} />
          <CricketBall />
          <Wicket />
          <SkillOrbit />
          <Particles />
          <Effects quality={quality} />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
