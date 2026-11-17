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
import { emit, on, onSectionChange, reducedMotion, scroller, setStage, store } from './lib/store'
import { sound } from './lib/sound'

gsap.registerPlugin(ScrollTrigger)

const Experience = lazy(() => import('./components/three/Experience'))

// The walk-in plays once per browser tab; after that a reload goes straight to the hero.
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
  const quiet = useRef(false) // true while the intro is being skipped: no tap sounds / dust

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
    lenis.stop() // locked until the walk-in has finished
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
    window.addEventListener('mousemove', onMove)
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

  /* ---------- sound: the 3D scene reports events, the page decides what is heard ---------- */
  useEffect(() => {
    let wickets = 0
    const offs = [
      on('wicket', () => {
        if (store.stage < 3.4 || store.stage > 6.6) return
        sound.play('stumps')
        if (wickets++ % 3 === 0) sound.play('cheer')
      }),
      on('six', () => Math.abs(store.stage - 7) < 0.6 && sound.play('crack')),
      on('firework', () => sound.play('firework')),
      onSectionChange((idx) => {
        const id = sections[idx]?.id
        sound.crowd(id === 'hero' ? 0.9 : id === 'matchball' || id === 'contact' ? 0.75 : 0.45)
        if (store.started && store.intro >= 1) sound.play('whoosh')
      }),
    ]
    const click = (e) => e.target instanceof Element && e.target.closest('a, button') && sound.play('click')
    document.addEventListener('click', click)
    return () => {
      offs.forEach((off) => off())
      document.removeEventListener('click', click)
    }
  }, [])

  /* ---------- the visitor clicked "Enter": this click is what allows audio ---------- */
  const handleEnter = useCallback((withSound) => {
    if (withSound) {
      sound.setEnabled(true)
      sound.crowd(0.9)
    }
  }, [])

  /* ---------- walk-in: batter comes out, takes guard, taps the pitch, profile appears ---------- */
  const startIntro = useCallback(() => {
    setPhase('intro')
    store.started = true
    const bang = () => {
      if (quiet.current) return
      emit('tap')
      sound.play('tap')
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('live')
        seen.set()
        scroller.lenis?.start()
        ScrollTrigger.refresh()
      },
    })
    tl.to(store, { walk: 1, duration: 5, ease: 'none' }, 0)
      .to(store, { intro: 1, duration: 6.6, ease: 'sine.inOut' }, 0)
      .fromTo('.intro-l3', { opacity: 0, xPercent: -40 }, { opacity: 1, xPercent: 0, duration: 0.7, ease: 'power3.out' }, 0.6)
      .to(store, { guard: 1, duration: 0.9, ease: 'power2.inOut' }, 4.85)
      .to('.intro-l3', { opacity: 0, xPercent: -40, duration: 0.5, ease: 'power2.in' }, 5.2)
      // two taps on the pitch, then the bat stays grounded
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, 5.95)
      .call(bang, null, 6.09)
      .to(store, { tap: 0.15, duration: 0.2, ease: 'power2.out' }, 6.12)
      .to(store, { tap: 1, duration: 0.14, ease: 'power2.in' }, 6.5)
      .call(bang, null, 6.64)
      .call(
        () => {
          if (quiet.current) return
          emit('celebrate')
          sound.play('cheer')
        },
        null,
        6.7
      )
      // profile, name and navigation come in
      .set('.hero-title', { opacity: 1 }, 6.3)
      .fromTo('.hero-char', { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 }, 6.3)
      .set('.hero-clip', { overflow: 'visible' }, 7.6) // let the neon glow spread once the letters have landed
      .fromTo('.hero-fade', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 6.6)
      .fromTo('.nav-intro', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 6.8)
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

      {phase === 'loading' && <Preloader ready={sceneReady} onEnter={handleEnter} onDone={startIntro} />}
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
