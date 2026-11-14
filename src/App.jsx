import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Preloader from './components/ui/Preloader'
import Cursor from './components/ui/Cursor'
import Nav from './components/ui/Nav'
import ScoreBug from './components/ui/ScoreBug'
import Hero from './sections/Hero'
import About from './sections/About'
import Skills from './sections/Skills'
import Career from './sections/Career'
import Projects from './sections/Projects'
import Contact from './sections/Contact'
import { sections } from './data/profile'
import { reducedMotion, scroller, setStage, store } from './lib/store'

gsap.registerPlugin(ScrollTrigger)

const Experience = lazy(() => import('./components/three/Experience'))

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const [started, setStarted] = useState(false)

  /* ---------- Smooth scroll (Lenis) driven by GSAP's ticker ---------- */
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
    lenis.stop() // locked until the preloader finishes

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      scroller.lenis = null
    }
  }, [])

  /* ---------- Mouse → shared store (3D tilt / parallax) ---------- */
  useEffect(() => {
    const onMove = (e) => {
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      store.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ---------- Scrollytelling: each section transition drives the 3D camera ---------- */
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

  /* ---------- After the preloader: intro animation + reveal animations ---------- */
  const handleLoaded = useCallback(() => {
    setStarted(true)
    store.started = true
    scroller.lenis?.start()

    const tl = gsap.timeline()
    tl.to(store, { intro: 1, duration: 2.8, ease: 'power3.inOut' }, 0)
      .fromTo('.hero-char', { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035 }, 0.6)
      .fromTo('.hero-fade', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, 1.1)
      .fromTo('.nav-intro', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 1.3)

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const pop = el.dataset.reveal === 'pop'
      const delay = parseFloat(el.dataset.delay || 0)
      gsap.fromTo(
        el,
        pop
          ? { opacity: 0, y: 80, rotationX: 22, scale: 0.92, transformOrigin: '50% 100%' }
          : { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: pop ? 1.1 : 1.0,
          delay,
          ease: pop ? 'back.out(1.4)' : 'power3.out',
          clearProps: 'filter',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
        }
      )
    })
    ScrollTrigger.refresh()
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Experience onReady={() => setSceneReady(true)} />
      </Suspense>

      {!started && <Preloader ready={sceneReady} onDone={handleLoaded} />}
      <Cursor />
      <Nav />
      <ScoreBug />

      <main className="ui">
        <Hero />
        <About />
        <Skills />
        <Career />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
