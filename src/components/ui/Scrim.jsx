import { useEffect, useState } from 'react'
import { onSectionChange } from '../../lib/store'
import { sections } from '../../data/profile'

// How much to darken the 3D scene behind each section, so text is always readable.
// The cinematic sections (walk-in, match ball, contact) stay bright.
const DARKNESS = { hero: 0, about: 0.32, services: 0.66, gameplan: 0.3, skills: 0.45, career: 0.74, projects: 0.72, contact: 0.3 }

export default function Scrim() {
  const [idx, setIdx] = useState(0)
  useEffect(() => onSectionChange(setIdx), [])
  return <div className="scrim" style={{ opacity: DARKNESS[sections[idx]?.id] ?? 0.5 }} aria-hidden="true" />
}
