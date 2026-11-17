import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Preloader from './components/ui/Preloader'
import IntroOverlay from './components/ui/IntroOverlay'
import Cursor from './components/ui/Cursor'
import Nav from './components/ui/Nav'
import ScoreBug from './components/ui/ScoreBug'
import WicketFlash from './components/ui/WicketFlash'
import Scrim from './components/ui/Scrim'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import GamePlan from './sections/GamePlan'
import Skills from './sections/Skills'
import Career from './sections/Career'
import Projects from './sections/Projects'
import Contact from './sections/Contact'
import { sections } from './data/profile'
import { emit, reducedMotion, scroller, setStage, store } from './lib/store'

gsap.registerPlugin(ScrollTrigger)

const Experience = lazy(() => import('./components/three/Experience'))

// The full intro plays once per browser tab; after that a reload goes straight to the hero.
const seen = {
  get: () => {
    try {
      return sessionStorage.getItem('pk-walk-in') === '1'
    } catch {
      return false
    }
  },
  set: () => {
    try {
      sessionStorage.setItem('pk-walk-in', '1')
    } catch {
      /* private mode: just replay the intro next time */
    }
  },
}

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const [phase, setPhase] = useState('loading') // loading → intro → live
  const intro = useRef(null)
  const quiet = useRef(false) // true while the intro is being skipped: no dust puffs / fireworks volley

  /* ---------- smooth scroll (Lenis) driven by GSAP's ticker ---------- */
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
    })
    scroller.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    lenis.stop() // locked until the intro has finished
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      scroller.lenis = null
    }
  }, [])

  /* ---------- mouse → shared store (3D tilt / parallax) ---------- */
  useEffect(() => {
    const onMove = (e) => {
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      store.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ---------- scrollytelling: each section's arrival moves the 3D camera one "stage" ---------- */
  useEffect(() => {
    const progress = new Array(sections.length).fill(0)
    const update = () => setStage(progress.reduce((a, b) => a + b, 0))
    const triggers = sections.slice(1).map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top bottom',
        // section top reaches the top of the screen (clamped so the last section can always finish)
        end: () => Math.min(document.getElementById(s.id).offsetTop, ScrollTrigger.maxScroll(window)),
        onUpdate: (self) => {
          progress[i + 1] = self.progress
          update()
        },
        onRefresh: (self) => {
          progress[i + 1] = self.progress
          update()
        },
      })
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* ---------- the intro: floodlights → drone swoop → batter walks out, taps the pitch → profile ---------- */
  const startIntro = useCallback(() => {
    setPhase('intro')
    store.started = true
    const tap = () => !quiet.current && emit('tap')
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('live')
        seen.set()
        scroller.lenis?.start()
        ScrollTrigger.refresh()
      },
    })

    // 0 – 3.2 s: dark ground, high drone shot. The four floodlight towers bang on one by one (with a flicker)
    tl.to(store, { drone: 1, duration: 3.2, ease: 'power2.inOut' }, 0)
    ;[0, 2, 1, 3].forEach((tower, i) => {
      const at = 0.35 + i * 0.32
      tl.set(store.lights, { [tower]: 0.75 }, at)
        .set(store.lights, { [tower]: 0.12 }, at + 0.06)
        .set(store.lights, { [tower]: 1 }, at + 0.13)
    })
    tl.fromTo('.intro-live', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.3)
      .fromTo(
        '.intro-title',
        { opacity: 0, scale: 1.12, letterSpacing: '0.4em' },
        { opacity: 1, scale: 1, letterSpacing: '0em', duration: 1.2, ease: 'power3.out' },
        0.55
      )
      .to('.intro-title', { opacity: 0, y: -30, duration: 0.55, ease: 'power2.in' }, 2.45)

      // 1.8 – 8.8 s: the batter walks out; the camera picks him up from behind, then swings round
      .to(store, { walk: 1, duration: 5, ease: 'none' }, 1.8)
      .to(store, { intro: 1, duration: 5.6, ease: 'sine.inOut' }, 3.2)
      .fromTo('.intro-l3', { opacity: 0, xPercent: -40 }, { opacity: 1, xPercent: 0, duration: 0.7, ease: 'power3.out' }, 3.4)
      .to(store, { guard: 1, duration: 0.9, ease: 'power2.inOut' }, 6.65)
      .to('.intro-l3', { opacity: 0, xPercent: -40, duration: 0.5, ease: 'power2.in' }, 7.0)
      // two taps of the bat on the pitch, then it stays grounded
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, 7.75)
      .call(tap, null, 7.89)
      .to(store, { tap: 0.15, duration: 0.2, ease: 'power2.out' }, 7.92)
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, 8.3)
      .call(tap, null, 8.44)
      .call(() => !quiet.current && emit('celebrate'), null, 8.5)
      // profile, name and navigation come in
      .set('.hero-title', { opacity: 1 }, 8.1)
      .fromTo('.hero-char', { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 }, 8.1)
      .set('.hero-clip', { overflow: 'visible' }, 9.4) // let the neon glow spread once the letters have landed
      .fromTo('.hero-fade', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 8.4)
      .fromTo('.nav-intro', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 8.6)
      .to('.intro-live', { opacity: 0, duration: 0.5 }, 8.6)
    intro.current = tl
    window.__intro = tl
    window.__gsap = gsap // handy for debugging in the console

    // scroll-in animations for everything below the hero
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const pop = el.dataset.reveal === 'pop'
      gsap.fromTo(
        el,
        pop ? { opacity: 0, y: 70, rotationX: 16, scale: 0.95, transformOrigin: '50% 100%' } : { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: pop ? 1.0 : 0.9,
          delay: parseFloat(el.dataset.delay || 0),
          ease: pop ? 'back.out(1.3)' : 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
        }
      )
    })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    if (reducedMotion || seen.get()) {
      quiet.current = true
      tl.progress(1)
    }
  }, [])

  const skipIntro = useCallback(() => {
    quiet.current = true
    intro.current?.progress(1)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Experience onReady={() => setSceneReady(true)} started={phase !== 'loading'} />
      </Suspense>
      <Scrim />

      {phase === 'loading' && <Preloader ready={sceneReady} onDone={startIntro} />}
      <IntroOverlay active={phase === 'intro'} onSkip={skipIntro} />
      <Cursor />
      <Nav />
      <ScoreBug />
      <WicketFlash />

      <main className="ui">
        <Hero />
        <About />
        <Services />
        <GamePlan />
        <Skills />
        <Career />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
