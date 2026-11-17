import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { store, on } from '../../lib/store'

// The batter: a motion-captured figure (walk + idle clips) dressed in code with
// helmet, pads, gloves and a bat. He walks in from the boundary, takes guard and
// taps the pitch. To use your own character later, replace public/models/batsman.glb
// with any Mixamo-rigged GLB that has "walk" and "idle" clips.
const MODEL = './models/batsman.glb'

export const WALK_FROM = new THREE.Vector3(4.6, 0, -14.6)
export const GUARD_AT = new THREE.Vector3(-0.3, 0, -8.75)
const WALK_HEADING = Math.atan2(GUARD_AT.x - WALK_FROM.x, GUARD_AT.z - WALK_FROM.z)
const GUARD_HEADING = 0.42 // turned slightly towards the camera
const BAT_TILT = 0.6 // how far the bat points forward of the arm while carried (radians)
const BAT_REACH = 0.83 // grip → toe (m)
const KEY_FRONT = new THREE.Vector3(3.2, 5.5, -4.4)

const smooth = (x) => x * x * (3 - 2 * x)
const damp = THREE.MathUtils.damp

function mat(color, roughness = 0.6, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra })
}

// Kit: an original design in India colours (blue with saffron trim). No board crest or sponsor marks.
const KIT = {
  name: 'PRAVEEN', // printed across the back
  number: '19',
  blue: '#1b58d0',
  navy: '#0c1b4d',
  saffron: '#ff8a1f',
  green: '#12924a',
  white: '#f6f5f0',
}

// One texture wraps the whole shirt: back panel on the left half, chest on the right half.
function jerseyTexture() {
  const W = 2048
  const H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const BACK = W * 0.25
  const FRONT = W * 0.75
  const draw = () => {
    const x = c.getContext('2d')
    const g = x.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#184fbe')
    g.addColorStop(0.45, KIT.blue)
    g.addColorStop(1, '#123f9f')
    x.fillStyle = g
    x.fillRect(0, 0, W, H)
    // faint diagonal weave, like sublimated sports fabric
    x.save()
    x.globalAlpha = 0.07
    x.strokeStyle = '#ffffff'
    x.lineWidth = 6
    for (let i = -H; i < W + H; i += 34) {
      x.beginPath()
      x.moveTo(i, H)
      x.lineTo(i + H * 0.6, 0)
      x.stroke()
    }
    x.restore()
    // navy yoke over the shoulders, saffron collar and hem
    const yoke = x.createLinearGradient(0, 0, 0, H * 0.2)
    yoke.addColorStop(0, KIT.navy)
    yoke.addColorStop(1, 'rgba(12,27,77,0)')
    x.fillStyle = yoke
    x.fillRect(0, 0, W, H * 0.2)
    x.fillStyle = KIT.saffron
    x.fillRect(0, 0, W, 46)
    x.fillRect(0, H - 22, W, 22)
    // saffron side panels (the texture seam sits under the arms)
    ;[0, W / 2, W].forEach((sx) => {
      x.fillStyle = KIT.saffron
      x.fillRect(sx - 46, 150, 92, H)
      x.fillStyle = KIT.navy
      x.fillRect(sx - 58, 150, 12, H)
      x.fillRect(sx + 46, 150, 12, H)
    })

    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.lineJoin = 'round'
    const font = (px) => `400 ${px}px Anton, Impact, 'Arial Narrow', sans-serif`

    // back: name and number
    x.font = font(132)
    x.fillStyle = KIT.white
    x.fillText(KIT.name, BACK, 250)
    x.font = font(400)
    x.lineWidth = 26
    x.strokeStyle = KIT.saffron
    x.strokeText(KIT.number, BACK, 590)
    x.fillStyle = KIT.white
    x.fillText(KIT.number, BACK, 590)

    // chest: country name, tricolour line, small number
    x.font = font(150)
    x.lineWidth = 10
    x.strokeStyle = KIT.navy
    x.strokeText('INDIA', FRONT, 330)
    x.fillStyle = KIT.saffron
    x.fillText('INDIA', FRONT, 330)
    ;[KIT.saffron, KIT.white, KIT.green].forEach((col, i) => {
      x.fillStyle = col
      x.fillRect(FRONT - 150, 428 + i * 9, 300, 9)
    })
    x.font = font(150)
    x.fillStyle = KIT.white
    x.fillText(KIT.number, FRONT, 570)
    tex.needsUpdate = true
  }
  draw()
  document.fonts?.load("400 100px Anton").then(draw).catch(() => {})
  return tex
}

// Shirt body: a lathe (hem → waist → chest → shoulders → collar), wider than it is deep.
// The seam of the texture is turned to the side so the chest and back prints are unbroken.
function buildJersey(yBottom, yTop, halfWidth, depth, material) {
  const shape = [
    [0, 0.9],
    [0.14, 0.88],
    [0.36, 0.87],
    [0.56, 0.96],
    [0.72, 1.02],
    [0.84, 1.0],
    [0.92, 0.8],
    [0.97, 0.55],
    [1, 0.42],
  ]
  const radius = (t) => {
    for (let i = 1; i < shape.length; i++) {
      if (t <= shape[i][0]) {
        const [t0, r0] = shape[i - 1]
        const [t1, r1] = shape[i]
        const k = (t - t0) / (t1 - t0)
        return r0 + (r1 - r0) * k * k * (3 - 2 * k)
      }
    }
    return shape[shape.length - 1][1]
  }
  const N = 24
  const pts = []
  for (let i = 0; i <= N; i++) pts.push(new THREE.Vector2(radius(i / N), THREE.MathUtils.lerp(yBottom, yTop, i / N)))
  const geo = new THREE.LatheGeometry(pts, 48, Math.PI / 2, Math.PI * 2)
  geo.scale(halfWidth, 1, depth)
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, material)
  m.castShadow = true
  return m
}

/* ---------- kit pieces, built in metres around the model's T-pose ---------- */
function buildHelmet(head, top) {
  const g = new THREE.Group()
  const r = (top.y - head.y) * 0.6
  g.position.copy(head).lerp(top, 0.52)
  const shellMat = new THREE.MeshPhysicalMaterial({ color: '#0b1c58', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 })
  // dark interior so the face stays in shadow behind the grille
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.07, 24, 18), new THREE.MeshBasicMaterial({ color: '#06060a' })))
  const shell = new THREE.Mesh(new THREE.SphereGeometry(r * 1.24, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.6), shellMat)
  shell.rotation.x = -0.32
  shell.castShadow = true
  g.add(shell)
  const peak = new THREE.Mesh(new THREE.BoxGeometry(r * 1.75, r * 0.1, r * 0.95), shellMat)
  peak.position.set(0, r * 0.38, r * 1.28)
  peak.rotation.x = 0.16
  g.add(peak)
  const steel = mat('#aab0b8', 0.3, { metalness: 0.9 })
  ;[-0.05, -0.36, -0.67].forEach((y) => {
    const bar = new THREE.Mesh(new THREE.TorusGeometry(r * 1.27, 0.0055, 6, 28, Math.PI), steel)
    bar.rotation.x = Math.PI / 2
    bar.position.y = r * y
    g.add(bar)
  })
  ;[-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.018, r * 1.0, r * 1.0), shellMat)
    ear.position.set(s * r * 1.14, -r * 0.3, -r * 0.05)
    g.add(ear)
  })
  // tricolour badge on the forehead
  const badge = new THREE.Group()
  ;[KIT.saffron, KIT.white, KIT.green].forEach((col, i) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(r * 0.56, r * 0.07, 0.008), mat(col, 0.5, { emissive: col, emissiveIntensity: 0.35 }))
    stripe.position.y = (1 - i) * r * 0.07
    badge.add(stripe)
  })
  badge.position.set(0, r * 0.72, r * 1.0)
  badge.rotation.x = -0.75
  g.add(badge)
  return g
}

function buildPad(knee, ankle, outer) {
  const g = new THREE.Group()
  const len = knee.y - ankle.y
  g.position.set((knee.x + ankle.x) / 2, (knee.y + ankle.y) / 2 + 0.01, knee.z + 0.07)
  const white = mat('#2a66dc', 0.5)
  const roll = new THREE.CapsuleGeometry(0.034, len - 0.05, 4, 10)
  ;[-0.056, 0, 0.056].forEach((x, i) => {
    const m = new THREE.Mesh(roll, white)
    m.position.set(x, 0, i === 1 ? 0.012 : 0)
    m.castShadow = true
    g.add(m)
  })
  const kneeRoll = new THREE.CapsuleGeometry(0.03, 0.115, 4, 10)
  ;[0, 1, 2].forEach((i) => {
    const m = new THREE.Mesh(kneeRoll, white)
    m.rotation.z = Math.PI / 2
    m.position.set(0, len / 2 + 0.03 + i * 0.058, 0.006)
    g.add(m)
  })
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, len * 0.85, 0.09), white)
  wing.position.set(outer * 0.098, 0, -0.035)
  g.add(wing)
  const piping = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.022, 0.012), mat(KIT.white, 0.6))
  piping.position.set(0, len * 0.5 - 0.005, 0.04)
  g.add(piping)
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.01), mat(KIT.saffron, 0.6))
  strap.position.set(0, -len * 0.2, 0.045)
  g.add(strap)
  return g
}

function buildGlove(hand, finger) {
  const g = new THREE.Group()
  const dir = finger.clone().sub(hand).normalize()
  g.position.copy(hand).addScaledVector(dir, 0.075)
  g.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.068, 0.118), mat('#f6f5f0', 0.55))
  body.castShadow = true
  g.add(body)
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.072, 0.122), mat(KIT.blue, 0.6))
  band.position.x = -0.062
  g.add(band)
  return g
}

function buildBat(hand, finger) {
  const g = new THREE.Group()
  const dir = finger.clone().sub(hand).normalize()
  // grip sits in the palm (palm faces down in the T-pose)
  g.position.copy(hand).addScaledVector(dir, 0.085).add(new THREE.Vector3(0, -0.04, 0))
  // local -Y runs down the bat: mostly along the arm, tilted forward
  const down = dir.clone().multiplyScalar(Math.cos(BAT_TILT)).add(new THREE.Vector3(0, 0, Math.sin(BAT_TILT))).normalize()
  const y = down.clone().negate()
  const z = new THREE.Vector3(0, 0, 1).addScaledVector(y, -y.z).normalize() // blade face looks forward
  const x = new THREE.Vector3().crossVectors(y, z)
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0165, 0.31, 14), mat('#a3101c', 0.75))
  handle.position.y = -0.075
  g.add(handle)
  const profile = new THREE.Shape()
  profile.moveTo(-0.054, 0)
  profile.lineTo(0.054, 0)
  profile.lineTo(0.054, -0.02)
  profile.lineTo(0, -0.058)
  profile.lineTo(-0.054, -0.02)
  profile.closePath()
  const bladeGeo = new THREE.ExtrudeGeometry(profile, { depth: 0.6, bevelEnabled: false })
  bladeGeo.rotateX(Math.PI / 2)
  const blade = new THREE.Mesh(bladeGeo, mat('#e6ca95', 0.55))
  blade.position.y = -0.23
  blade.castShadow = true
  g.add(blade)
  const sticker = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 0.003), mat('#c8141f', 0.4, { emissive: '#ff1f3d', emissiveIntensity: 0.5 }))
  sticker.position.set(0, -0.45, 0.002)
  g.add(sticker)
  const toe = new THREE.Object3D()
  toe.position.y = -BAT_REACH
  g.add(toe)
  return { bat: g, toe }
}

// a rounded limb of cloth between two joints (sleeve, trouser leg)
function limb(a, b, radius, material) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, a.distanceTo(b), 5, 14), material)
  m.position.copy(a).add(b).multiplyScalar(0.5)
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
  m.castShadow = true
  return m
}
// a soft body panel (chest, waist, hips)
function panel(center, rx, ry, rz, material) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), material)
  m.position.copy(center)
  m.scale.set(rx, ry, rz)
  m.castShadow = true
  return m
}

function buildRig(scene) {
  if (scene.userData.rig) return scene.userData.rig // already dressed (hot reload / remount)
  const cloth = mat('#184dbb', 0.85) // base layer: only the neck and boots show
  const trim = mat('#143f9e', 0.8)
  scene.traverse((o) => {
    if (o.isSkinnedMesh) {
      o.castShadow = true
      o.frustumCulled = false
      o.material = /joint/i.test(o.name) ? trim : cloth
    }
  })
  scene.updateMatrixWorld(true)
  const bone = (n) => scene.getObjectByName(`mixamorig${n}`)
  const wp = (n) => bone(n).getWorldPosition(new THREE.Vector3())
  const left = Math.sign(wp('LeftHand').x) || 1 // which way is the character's left (+x or -x)

  // the kit rides on the mocap skeleton: every piece is attached to its own bone
  const blue = mat(KIT.blue, 0.82)
  const navy = mat(KIT.navy, 0.8)
  const saffron = mat(KIT.saffron, 0.7)
  const hips = wp('Hips')
  const neck = wp('Neck')
  const sh = Math.abs(wp('LeftArm').x - wp('RightArm').x) / 2
  const mid = (a, b, t = 0.5) => a.clone().lerp(b, t)

  // shirt with the name and number printed on it (slightly self-lit so the print reads under floodlights)
  const print = jerseyTexture()
  const shirt = new THREE.MeshStandardMaterial({ map: print, roughness: 0.78, emissive: '#ffffff', emissiveMap: print, emissiveIntensity: 0.22, side: THREE.DoubleSide })
  const jersey = buildJersey(hips.y - 0.1, neck.y + 0.015, sh * 1.16, 0.176, shirt)
  jersey.position.set(hips.x, 0, (hips.z + wp('Spine2').z) / 2)
  bone('Spine1').attach(jersey)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 8, 28), saffron)
  collar.rotation.x = Math.PI / 2
  collar.position.set(neck.x, neck.y + 0.012, neck.z + 0.005)
  bone('Neck').attach(collar)
  // trousers
  bone('Hips').attach(panel(hips.clone().add(new THREE.Vector3(0, -0.05, 0)), sh * 1.03, 0.13, 0.138, blue))
  ;['Left', 'Right'].forEach((s) => {
    const shoulder = wp(`${s}Arm`)
    const elbow = wp(`${s}ForeArm`)
    const wrist = wp(`${s}Hand`)
    bone(`${s}Shoulder`).attach(panel(shoulder, 0.084, 0.084, 0.084, blue))
    bone(`${s}Arm`).attach(limb(shoulder, mid(shoulder, elbow, 0.62), 0.064, blue)) // short sleeve
    bone(`${s}Arm`).attach(limb(mid(shoulder, elbow, 0.6), mid(shoulder, elbow, 0.66), 0.067, saffron)) // cuff
    bone(`${s}Arm`).attach(limb(mid(shoulder, elbow, 0.6), elbow, 0.05, navy)) // compression sleeve
    bone(`${s}ForeArm`).attach(limb(elbow, mid(elbow, wrist, 0.92), 0.046, navy))
    bone(`${s}UpLeg`).attach(limb(wp(`${s}UpLeg`), wp(`${s}Leg`), 0.088, blue))
    bone(`${s}Leg`).attach(limb(wp(`${s}Leg`), mid(wp(`${s}Leg`), wp(`${s}Foot`), 0.93), 0.062, blue))
  })

  bone('Head').attach(buildHelmet(wp('Head'), wp('HeadTop_End')))
  bone('LeftLeg').attach(buildPad(wp('LeftLeg'), wp('LeftFoot'), left))
  bone('RightLeg').attach(buildPad(wp('RightLeg'), wp('RightFoot'), -left))
  bone('LeftHand').attach(buildGlove(wp('LeftHand'), wp('LeftHandMiddle1')))
  bone('RightHand').attach(buildGlove(wp('RightHand'), wp('RightHandMiddle1')))
  const { bat, toe } = buildBat(wp('RightHand'), wp('RightHandMiddle1'))
  bone('RightHand').attach(bat)

  scene.userData.rig = {
    left,
    toe,
    spine: bone('Spine'),
    spine1: bone('Spine1'),
    neck: bone('Neck'),
    arm: bone('RightArm'),
    hand: bone('RightHand'),
  }
  return scene.userData.rig
}

function blobTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.75)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

const dustVert = /* glsl */ `
  uniform float uAge;
  uniform float uPixelRatio;
  attribute vec3 aVel;
  attribute float aSeed;
  varying float vLife;
  void main() {
    vec3 p = position + aVel * (1.0 - exp(-3.0 * uAge)) / 3.0 + vec3(0.0, 0.25, 0.0) * uAge;
    vLife = 1.0 - clamp(uAge / (0.7 + aSeed * 0.6), 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (30.0 + aSeed * 50.0) * (1.4 - vLife) * uPixelRatio * (2.0 / -mv.z);
  }
`
const dustFrag = /* glsl */ `
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vLife * 0.38;
    gl_FragColor = vec4(vec3(0.78, 0.62, 0.42), a);
  }
`

const _q = new THREE.Quaternion()
const _qw = new THREE.Quaternion()
const _axis = new THREE.Vector3()
const _v = new THREE.Vector3()
const _w = new THREE.Vector3()

// rotate a bone around a world-space axis that passes through its joint
function turn(bone, axisWorld, angle) {
  bone.parent.getWorldQuaternion(_qw)
  _qw.multiply(bone.quaternion).invert()
  _axis.copy(axisWorld).applyQuaternion(_qw)
  bone.quaternion.multiply(_q.setFromAxisAngle(_axis, angle))
}

export default function Batsman() {
  const { scene, animations } = useGLTF(MODEL, false, true)
  const root = useRef()
  const dust = useRef()
  const keyLight = useRef()
  const rig = useMemo(() => buildRig(scene), [scene])
  const anim = useMemo(() => {
    const mixer = new THREE.AnimationMixer(scene)
    const clip = (n) => mixer.clipAction(animations.find((a) => a.name === n))
    const idle = clip('idle')
    const walk = clip('walk')
    idle.play()
    walk.play()
    walk.setEffectiveWeight(0)
    walk.timeScale = 0.98 // stride speed (1.56 m/s) matched to the walk-in path, so the feet don't slide
    return { mixer, idle, walk, w: 0 }
  }, [scene, animations])
  const shadowTex = useMemo(() => blobTexture(), [])

  const dustGeo = useMemo(() => {
    const n = 26
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 0.5 + Math.random() * 1.3
      vel[i * 3] = Math.cos(a) * sp
      vel[i * 3 + 1] = 0.15 + Math.random() * 0.6
      vel[i * 3 + 2] = Math.sin(a) * sp
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
  const dustUniforms = useMemo(() => ({ uAge: { value: 99 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } }), [])

  useEffect(
    () =>
      on('tap', () => {
        rig.toe.getWorldPosition(dust.current.position)
        dust.current.position.y = 0.03
        dustUniforms.uAge.value = 0
      }),
    [rig, dustUniforms]
  )

  const leftAxis = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    dustUniforms.uAge.value += dt
    const group = root.current
    const show = store.stage < 1.45
    group.visible = show
    keyLight.current.intensity = show ? 75 * store.lit : 0
    if (!show) return

    // where he is and which way he faces
    const w = store.walk
    const g = smooth(THREE.MathUtils.clamp(store.guard, 0, 1))
    group.position.lerpVectors(WALK_FROM, GUARD_AT, w)
    group.rotation.y = WALK_HEADING + (GUARD_HEADING - WALK_HEADING) * g
    store.batsman.x = group.position.x
    store.batsman.z = group.position.z

    // one spotlight does two jobs: it lights his back while the camera follows him out,
    // then moves round to the front for the hero shot
    const front = THREE.MathUtils.smoothstep(store.intro, 0.4, 0.8)
    const hd = group.rotation.y
    _v.set(group.position.x - Math.sin(hd) * 4 + 1.2, 5, group.position.z - Math.cos(hd) * 4)
    keyLight.current.position.lerpVectors(_v, KEY_FRONT, front)
    keyLight.current.target.position.set(group.position.x, 1.1, group.position.z)
    keyLight.current.target.updateMatrixWorld()

    // blend walk ↔ idle
    const moving = w > 0.002 && w < 0.998 ? 1 : 0
    anim.w = damp(anim.w, moving, 7, dt)
    anim.walk.setEffectiveWeight(anim.w)
    anim.idle.setEffectiveWeight(1 - anim.w)
    anim.mixer.update(dt)
    group.updateMatrixWorld(true)

    // the character's left, in world space: every forward lean / arm swing turns around it
    const h = group.rotation.y
    leftAxis.set(rig.left * Math.cos(h), 0, -rig.left * Math.sin(h))

    if (g > 0.001) {
      const press = store.tap
      turn(rig.spine, leftAxis, (0.2 + press * 0.05) * g) // lean over the bat
      turn(rig.spine1, leftAxis, 0.2 * g)
      turn(rig.neck, leftAxis, -0.3 * g) // …but keep the eyes up
      turn(rig.arm, leftAxis, -0.12 * g)
      rig.spine.updateWorldMatrix(false, true)
    }

    // keep the bat's toe exactly where we want it: clear of the grass while walking,
    // hovering then pressed onto the pitch when he takes guard
    // Bat control. The wrist turns about the character's left axis, so the bat swings in the plane
    // he is facing. We set its angle from straight-down directly (0 = vertical, + = pointing ahead):
    //  - walking: mostly steady, with a little of the arm's natural swing, and never touching the grass
    //  - in his stance: exactly the angle that hovers the toe, then presses it onto the pitch
    rig.hand.updateWorldMatrix(true, true)
    rig.toe.getWorldPosition(_v)
    rig.hand.getWorldPosition(_w)
    const fx = Math.sin(h)
    const fz = Math.cos(h)
    const down = _w.y - _v.y
    const ahead = (_v.x - _w.x) * fx + (_v.z - _w.z) * fz
    const R = Math.hypot(down, ahead)
    const now = Math.atan2(ahead, down)
    const angleFor = (height) => Math.acos(THREE.MathUtils.clamp((_w.y - height) / R, -1, 1))
    const carry = Math.max(0.42 + (now - 0.42) * 0.3, angleFor(0.1))
    const stance = angleFor(THREE.MathUtils.lerp(0.075, 0.012, store.tap))
    const want = carry + (stance - carry) * g
    if (Math.abs(now - want) > 0.002) turn(rig.hand, leftAxis, now - want)
  })

  return (
    <group>
      <group ref={root} position={WALK_FROM}>
        <primitive object={scene} />
        <mesh rotation-x={-Math.PI / 2} position-y={0.014} scale={[1.25, 0.85, 1]} renderOrder={1}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
        </mesh>
      </group>

      <points ref={dust} geometry={dustGeo} frustumCulled={false}>
        <shaderMaterial uniforms={dustUniforms} vertexShader={dustVert} fragmentShader={dustFrag} transparent depthWrite={false} />
      </points>

      {/* floodlight key on the crease + red rim from behind */}
      <spotLight ref={keyLight} position={[3.2, 5.5, -4.4]} angle={0.42} penumbra={0.9} intensity={70} distance={16} decay={2} color="#fff4ea" />
      <pointLight position={[-2.2, 1.7, -10.6]} color="#ff2a48" intensity={22} distance={7} decay={2} />
    </group>
  )
}

useGLTF.preload(MODEL, false, true)
