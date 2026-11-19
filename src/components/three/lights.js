import * as THREE from 'three'
import { store } from '../../lib/store'

// Floodlights switch on one tower at a time during the intro (store.flood goes 0 → 1).
export const towerOn = (i) => THREE.MathUtils.smoothstep(store.flood, 0.1 + i * 0.2, 0.14 + i * 0.2)
export const towerFlash = (i) => {
  const t = store.flood - (0.1 + i * 0.2)
  return t > 0 && t < 0.1 ? 1 - t / 0.1 : 0
}
export const lightLevel = () => (towerOn(0) + towerOn(1) + towerOn(2) + towerOn(3)) / 4
export const TOWER_ANGLES = [0.25, 0.75, 1.25, 1.75].map((a) => a * Math.PI)
export const TOWER_R = 104
export const TOWER_H = 54
