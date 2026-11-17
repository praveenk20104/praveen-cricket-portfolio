import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { store } from '../../lib/store'

const CA_OFFSET = new THREE.Vector2(0.0007, 0.0005)

// High tier: DOF + bloom + grain + vignette + CA + SMAA (strong GPUs only)
function HighEffects() {
  const dof = useRef()
  useFrame(() => {
    if (dof.current?.target) dof.current.target.copy(store.look)
  })
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField ref={dof} target={[0, 2.2, 9]} worldFocusRange={9} bokehScale={2.4} resolutionScale={0.5} />
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.85} luminanceSmoothing={0.25} radius={0.78} />
      <ChromaticAberration offset={CA_OFFSET} radialModulation modulationOffset={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.78} />
      <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
      <SMAA />
    </EffectComposer>
  )
}

// Medium tier: bloom + grain + vignette + SMAA (most laptops)
function MediumEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.87} luminanceSmoothing={0.25} radius={0.75} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.78} />
      <Noise opacity={0.055} blendFunction={BlendFunction.OVERLAY} />
      <SMAA />
    </EffectComposer>
  )
}

// Low tier: bloom + grain + vignette only (mobile / weak GPUs)
function LowEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.75} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  )
}

export default function Effects({ quality }) {
  if (quality === 'min') return null
  if (quality === 'high') return <HighEffects />
  if (quality === 'medium') return <MediumEffects />
  return <LowEffects />
}
