import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Preloader from './components/ui/Preloader'
import IntroOverlay from './components/ui/IntroOverlay'
import Cursor from './components/ui/Cursor'
import Nav from './components/ui/Nav'
import ScoreBug from './components/ui/ScoreBug'
import Scrim from './components/ui/Scrim'
import Hero from './sections/Hero'
import MatchBall from './sections/MatchBall'
import About from './sections/About'
import Services from './sections/Services'
import GamePlan from './sections/GamePlan'
import Skills from './sections/Skills'
import Career from './sections/Career'
import Projects from './sections/Projects'
import Training from './sections/Training'
import Contact from './sections/Contact'
import { sections } from './data/profile'
import { emit, reducedMotion, scroller, setStage, store } from './lib/store'
import { WALK_TIME } from './components/three/Batsman'

gsap.registerPlugin(ScrollTrigger)

const Experience = lazy(() => import('./components/three/Experience'))

// The intro plays once per browser tab; after that a reload goes straight to the hero.
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
  const quiet = useRef(false) // true while the intro is being skipped: no dust / fireworks

  /* ---------- smooth scroll (Lenis) driven by GSAP's ticker ---------- */
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      duration: 1.3,
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
    // phones change height when the address bar hides: don't recalculate on every tiny resize
    ScrollTrigger.config({ ignoreMobileResize: true })
    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* ---------- the intro ----------
     0.0s  drone shot over the stadium, floodlights switch on one tower at a time
     2.6s  camera dives down behind the batter, he walks out to the crease
     7.0s  he takes guard and taps the pitch twice
     8.3s  a new ball drops from the sky, knocks the pitch and rolls to his bat
     8.6s  name, player profile and navigation come in                                        */
  const startIntro = useCallback(() => {
    setPhase('intro')
    store.started = true
    const fx = (fn) => () => !quiet.current && fn()
    const W0 = 2.9
    const W1 = W0 + WALK_TIME
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('live')
        seen.set()
        scroller.lenis?.start()
        ScrollTrigger.refresh()
      },
    })
    tl.to(store, { flood: 1, duration: 2.8, ease: 'power1.inOut' }, 0)
      .fromTo('.intro-opener', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2)
      .fromTo('.intro-opener-title', { letterSpacing: '0.4em', opacity: 0 }, { letterSpacing: '0.04em', opacity: 1, duration: 1.4, ease: 'expo.out' }, 0.35)
      .fromTo('.intro-opener-tag, .intro-opener-sub', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 }, 0.5)
      .to('.intro-opener', { opacity: 0, scale: 1.08, duration: 0.6, ease: 'power2.in' }, 2.3)
      .to(store, { intro: 1, duration: 5.6, ease: 'none' }, 2.6)
      .to(store, { walk: 1, duration: WALK_TIME, ease: 'none' }, W0)
      .fromTo('.intro-l3', { opacity: 0, xPercent: -40 }, { opacity: 1, xPercent: 0, duration: 0.7, ease: 'power3.out' }, W0 + 0.6)
      .to('.intro-l3', { opacity: 0, xPercent: -40, duration: 0.5, ease: 'power2.in' }, W1 - 0.3)
      .to(store, { guard: 1, duration: 0.85, ease: 'power2.inOut' }, W1 - 0.15)
      // two taps on the pitch, then the bat stays grounded
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, W1 + 0.55)
      .call(fx(() => emit('tap')), null, W1 + 0.69)
      .to(store, { tap: 0.15, duration: 0.2, ease: 'power2.out' }, W1 + 0.72)
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, W1 + 1.05)
      .call(fx(() => emit('tap')), null, W1 + 1.19)
      // the new ball knocks into the pitch
      .call(() => emit('knock', quiet.current), null, W1 + 1.1)
      .call(fx(() => emit('celebrate')), null, W1 + 1.9)
      // name, profile and navigation come in
      .set('.hero-title', { opacity: 1 }, W1 + 1.3)
      .fromTo('.hero-char', { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 }, W1 + 1.3)
      .set('.hero-clip', { overflow: 'visible' }, W1 + 2.6) // let the neon glow spread once the letters have landed
      .fromTo('.hero-fade', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, W1 + 1.6)
      .fromTo('.nav-intro', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, W1 + 1.8)
    intro.current = tl
    window.__intro = tl

    // scroll-in animations for everything below the hero
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const pop = el.dataset.reveal === 'pop'
      gsap.fromTo(
        el,
        pop ? { opacity: 0, y: 80, rotationX: 18, scale: 0.94, transformOrigin: '50% 100%' } : { opacity: 0, y: 46 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: pop ? 1.05 : 0.95,
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

      <main className="ui">
        <Hero />
        <MatchBall />
        <About />
        <Services />
        <GamePlan />
        <Skills />
        <Career />
        <Projects />
        <Training />
        <Contact />
      </main>
    </>
  )
}
