// A tiny mutable store shared by the 3D scene and the DOM.
// The scene reads it every frame (no React re-renders = smooth frame rate).
export const store = {
  stage: 0, // continuous scroll stage: 0 = hero … 9 = contact
  flood: 0, // 0 → 1 floodlights switch on, one tower at a time (drone shot)
  intro: 0, // 0 → 1 camera dives down and follows the batter to the hero shot
  prewarm: true, // while the loader covers the screen, everything is drawn once so no shader compiles later
  walk: 0, // 0 → 1 batsman's progress from the boundary to the crease
  guard: 0, // 0 → 1 batsman settles into his stance
  tap: 0, // 0 → 1 bat pressed onto the pitch
  mouse: { x: 0, y: 0 }, // normalised -1..1
  spin: { x: 0, y: 0 }, // extra angular velocity from drag / swipe
  look: { x: 0, y: 1, z: -9 }, // current camera focus point (used by depth of field)
  batsman: { x: 4.6, y: 0, z: -14.6 }, // where the batsman is right now
  started: false,
}
if (typeof window !== 'undefined') window.__store = store // handy for debugging in the console

/* ---------- which section is on screen (score bug, nav, scrim) ---------- */
const sectionListeners = new Set()
let lastIndex = -1
export function setStage(value) {
  store.stage = value
  const idx = Math.round(value)
  if (idx !== lastIndex) {
    lastIndex = idx
    sectionListeners.forEach((fn) => fn(idx))
  }
}
export function onSectionChange(fn) {
  sectionListeners.add(fn)
  fn(Math.max(lastIndex, 0))
  return () => sectionListeners.delete(fn)
}

/* ---------- small event bus: the 3D scene tells the page what just happened ---------- */
// events: 'tap' (bat hits pitch), 'knock' (intro ball dropped; payload true = place it at rest),
//         'wicket' (stumps broken), 'delivery' (ball released, payload = km/h), 'six', 'firework', 'celebrate'
const bus = {}
export function on(name, fn) {
  ;(bus[name] ||= new Set()).add(fn)
  return () => bus[name].delete(fn)
}
export function emit(name, payload) {
  bus[name]?.forEach((fn) => fn(payload))
}

/* ---------- device helpers ---------- */
export const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- shared scroll handle (Lenis instance is assigned in App) ---------- */
export const scroller = { lenis: null }
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroller.lenis) scroller.lenis.scrollTo(el, { duration: 1.8 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
