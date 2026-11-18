# Praveen Kumar: 3D Cricket Portfolio (v5)

A night match in a WebGL stadium. The intro opens on a drone shot as the floodlights switch on one tower at a time, dives down behind a batter in India blue (PRAVEEN, No. 19) and walks out with him. He takes guard and taps the pitch, a new ball drops from the sky and knocks into the pitch with a neon shockwave, and the TV-style player profile appears. Scrolling then moves the camera through ten sections: the new ball, the pitch report, services, the game plan, skills around the neon stumps, the career scorecard, projects (sixes flying over the boundary), the training camp (big screen and fireworks) and the "Next innings" chase graphic with a ring of LED text circling the ball.

**Stack:** Vite · React 19 · Tailwind CSS v4 · Three.js + React Three Fiber + Drei · @react-three/postprocessing · GSAP ScrollTrigger · Lenis

---

## 1. Run it locally (optional)

```bash
npm install
npm run dev        # open http://localhost:5173
npm run build      # production build in /dist
```

Node 20.19+ or 22.12+.

## 2. Publish (GitHub + Netlify, nothing to install)

1. On GitHub open the repo → **Add file → Upload files**.
2. Drag in **everything inside this folder** (all files plus the `src` and `public` folders) and press **Commit changes**. Files with the same name are replaced.
3. Netlify rebuilds the site by itself in 1–2 minutes (`netlify.toml` holds the settings).

## 3. Things you will want to change

| What | Where |
|---|---|
| All text, links, skills, career, projects | `src/data/profile.js` |
| **Your photo** on the player card | upload a file named **`profile.jpg`** into the `public` folder (portrait, about 600×750). Until then a "PK" badge is shown. |
| **Name and number on the shirt** | `KIT` at the top of `src/components/three/Batsman.jsx` (`name: 'PRAVEEN'`, `number: '19'`, and the kit colours) |
| Resume | replace `public/Praveen_Kumar_Resume.pdf` (keep the name) |
| Project screenshots | `public/projects/*.jpg` (16:9) |
| Camera angle of any section | `KEYS_WIDE` (desktop) and `KEYS_TALL` (phone) in `src/components/three/CameraRig.jsx` |
| Timing of the walk-in | the timeline in `startIntro` in `src/App.jsx` |
| How dark the 3D gets behind each section's text | `DARKNESS` in `src/components/ui/Scrim.jsx` |

## 4. Project structure

```
public/
  models/batsman.glb         motion-captured figure (walk + idle clips), 0.8 MB
  projects/*.jpg             real dashboard screenshots
src/
  App.jsx                    smooth scroll, section → camera stage, the intro timeline
  data/profile.js            ALL content
  lib/store.js               shared state + event bus between the page and the 3D scene
  lib/shatter.js             glass-shatter effect for the project screenshots
  components/three/
    Experience.jsx           <Canvas>, reflections, automatic quality ladder
    CameraRig.jsx            drone shot, dive-and-follow walk-in, scroll-driven camera path (10 shots)
    IntroBall.jsx            the ball that knocks the pitch (bounces, shockwaves, dust)
    BallFx.jsx               swing trails round the match ball + the "next innings" LED text ring
    Batsman.jsx              the batter: printed shirt, helmet, pads, gloves and bat built in code; walk, guard, bat tap
    CricketBall.jsx          match ball: procedural leather, raised seam, 576 stitches, gold stamp
    Wicket.jsx               neon stumps, looping delivery, flying bails, sparks, speed-gun event
    SixShots.jsx             "wagon wheel": glowing sixes launched from the crease
    Fireworks.jsx            fireworks above the stands
    Stadium.jsx              pitch, outfield, rope, LED boundary boards, stands, Mexican wave, floodlights that switch on, big LED screen
    SkillOrbit.jsx           skills floating around the stumps
    Particles.jsx, Effects.jsx, textures.js
  components/ui/
    Preloader.jsx            seam loader
    IntroOverlay.jsx         "Under the lights" opener, lower-third, skip button
    Nav.jsx, ScoreBug.jsx    navigation, TV strip with over count and ball speed
    Scrim.jsx                keeps text readable over the 3D scene
    Cursor.jsx, Magnetic.jsx custom cursor (bat over projects), magnetic buttons
  sections/                  Hero, MatchBall, About, Services, GamePlan, Skills, Career, Projects, Training, Contact
```

## 5. Works on every screen

| Screen | What changes |
|---|---|
| Phones (Android, iPhone), portrait | stacked layout, phone camera angles, lighter 3D, touch to spin the ball |
| Phones held sideways | compact layout for short screens |
| Tablets and iPads | portrait uses the phone-style stack, landscape uses the side-by-side layout; the hero camera turns so the batter stands clear of the profile card |
| Laptops and desktops (Windows, Mac, Linux) | full layout, mouse parallax, custom cursor |
| Large monitors, 4K, Smart TVs | the whole interface scales up with the screen (one fluid size rule in `index.css`); buttons show a red focus ring for TV remotes and keyboards |

Layouts follow the screen's **shape** (portrait or landscape), not just its width, so an iPad turned sideways gets the right layout. The 3D picture is rendered with a fixed pixel budget per quality level, so a 4K TV does not do more work than a laptop.

## 6. Notes

- **The batter** uses the "X Bot" motion-capture figure from Adobe Mixamo (free for commercial use inside a project). His kit is generated in code: an original design in India colours (blue with saffron trim) with PRAVEEN and 19 printed on the back. It deliberately carries no board crest or sponsor logos. The walk-in camera follows him from behind first, so the name and number are seen. To use a custom character later, replace `public/models/batsman.glb` with any Mixamo-rigged GLB that has clips named `walk` and `idle`.
- **The intro** plays once per browser tab (about 10 seconds). Reloading goes straight to the hero. "Skip intro" is always available.
- **Performance:** panels are solid instead of blurred (a blur over a live 3D scene is re-computed every frame, the biggest cause of lag). While the loader is on screen every shader is compiled once, so nothing stutters later when a new effect appears. Devices with few CPU cores, little memory or built-in graphics start on a lighter level. The site also measures the real frame rate and moves between quality levels (low / medium / high). Laptops with built-in graphics and older phones start on the light level and only climb if they stay smooth. On the light level glass blur, shadows and light beams are off. Add `?q=low`, `?q=medium` or `?q=high` to the URL to test a level by hand.
- Respects `prefers-reduced-motion` (no walk-in, no deliveries, no fireworks).
