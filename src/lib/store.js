// A tiny mutable store shared by the 3D scene and the DOM.
// The scene reads it every frame (no React re-renders = smooth 60fps).
export const store = {
  stage: 0, // continuous scroll stage: 0 = hero … 5 = contact
  intro: 0, // 0 → 1 cinematic intro dolly after the preloader
  mouse: { x: 0, y: 0 }, // normalised -1..1
  spin: { x: 0, y: 0 }, // extra angular velocity from drag / swipe
  look: { x: 0, y: 2.2, z: 9 }, // current camera focus point (used by depth of field)
  started: false,
}

// Minimal pub/sub so React UI (score bug, nav) can react to the current section
const listeners = new Set()
let lastIndex = -1
export function setStage(value) {
  store.stage = value
  const idx = Math.round(value)
  if (idx !== lastIndex) {
    lastIndex = idx
    listeners.forEach((fn) => fn(idx))
  }
}
export function onSectionChange(fn) {
  listeners.add(fn)
  fn(Math.max(lastIndex, 0))
  return () => listeners.delete(fn)
}

// Device helpers
export const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 768

// Shared scroll handle (Lenis instance is assigned in App)
export const scroller = { lenis: null }
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroller.lenis) scroller.lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
