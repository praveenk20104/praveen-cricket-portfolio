# Praveen Kumar: 3D Cricket Portfolio

A night-match cricket stadium built in WebGL. Your name sits over a spinning leather ball. As you scroll, the camera flies past the ball and down the pitch to the neon stumps, where a live delivery knocks the bails off. From there it cuts to a broadcast angle, then rises to a spider-cam aerial for the projects, and comes back to the ball for the final "Next Innings" CTA.

**Stack:** Vite · React 19 · Tailwind CSS v4 · Three.js + React Three Fiber + Drei · @react-three/postprocessing · GSAP ScrollTrigger · Lenis

---

## 1. Run it locally

```bash
npm install
npm run dev        # open http://localhost:5173
```

Production build:

```bash
npm run build      # outputs to /dist
npm run preview    # test the production build locally
```

Node 18+ (Node 20/22 recommended).

## 2. Deploy to Netlify (replaces your old site)

**Option A (drag and drop):** run `npm run build`, open your site on app.netlify.com, go to **Deploys**, and drag the `dist` folder in.

**Option B (from GitHub, auto-deploys on every push):** push this folder to a GitHub repo, then in Netlify choose **Add new site → Import from Git**. `netlify.toml` already sets the build command (`npm run build`) and the publish folder (`dist`).

## 3. Edit your content (one file)

All text, links, projects, skills and career data live in **`src/data/profile.js`**.
To swap the resume, replace `public/Praveen_Kumar_Resume.pdf` and keep the same file name.

## 4. Project structure

```
src/
  App.jsx                    Lenis smooth scroll, GSAP ScrollTrigger, section → camera stage, reveal animations
  data/profile.js            ALL content (from the resume)
  lib/store.js               shared state between the DOM and the 3D scene (no re-renders, so it stays at 60fps)
  components/three/
    Experience.jsx           <Canvas>, reflections, performance monitor, drag-to-spin
    CameraRig.jsx            scroll-driven camera path (Catmull-Rom spline through 6 "shots") + mouse parallax
    CricketBall.jsx          hero ball: procedural leather, raised seam, 576 instanced stitches, gold stamp, neon halo
    Wicket.jsx               neon stumps + bails, looping delivery, bail physics, impact sparks, ball trail
    Stadium.jsx              pitch, outfield mowing stripes, 30-yard circle, neon rope, stands, crowd flashes, floodlights + light beams
    SkillOrbit.jsx           skills floating in 3D around the stumps
    Particles.jsx            red "firefly" embers (custom shader)
    Effects.jsx              Bloom, Depth of Field, film grain, vignette, chromatic aberration, SMAA
    textures.js              every texture generated in code (no image downloads)
  components/ui/
    Preloader.jsx            spinning ball; the seam stitches double as the progress bar
    Cursor.jsx               custom cursor that turns into a bat over projects
    ProjectCard.jsx          3D tilt + glass-shatter effect on hover
    Magnetic.jsx             magnetic pull on buttons
    Nav.jsx, ScoreBug.jsx    glass nav + TV-style score bug (6 sections = 6 balls of an over)
  sections/                  Hero, About, Skills, Career, Projects, Contact
```

## 5. Why there are no Spline / GLB files

Every 3D model (ball, stitches, stumps, pitch, stadium) and every texture is generated in code. So:

- **Nothing heavy to download.** The 3D loads in about 360 KB gzipped of JavaScript, with no 5–20 MB GLB files and no Spline runtime.
- **Pixel-perfect control.** Real cricket dimensions are used: stumps 71.1 cm, pitch 3.05 m × 20.12 m, correct creases.
- **No external services** that can break or slow the site.

If you later want to drop in a custom Spline or Blender model: export it as `.glb`, compress it with `npx gltf-transform optimize in.glb out.glb --compress draco`, put it in `public/`, and load it with Drei's `useGLTF('/out.glb')` inside the Canvas.

## 6. Performance and responsiveness

- **Mobile / touch:** lighter effects (no DOF / SMAA / shadows), fewer particles, smaller textures, capped pixel ratio. Horizontal swipe spins the ball, vertical swipe scrolls.
- **Desktop:** full post-processing, shadows, mouse-parallax camera, tilting ball, orbiting skills, custom cursor.
- `PerformanceMonitor` automatically drops to the light mode if the frame rate dips.
- Respects `prefers-reduced-motion`.
