import { projects, profile } from '../data/profile'
import ProjectCard from '../components/ui/ProjectCard'
import { isTouch } from '../lib/store'

export default function Projects() {
  return (
    <section id="projects" className="relative min-h-screen px-5 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p data-reveal className="eyebrow flex items-center gap-3">
              <span className="font-mono text-[#ff1f3d]">04</span> Match-winning knocks
            </p>
            <h2 data-reveal className="mt-4 font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.92] tracking-wide">
              Projects that <span className="text-stroke">hit</span> the boundary.
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-sm leading-relaxed text-white/60">
            {isTouch
              ? 'Tap a card to open the full project on GitHub.'
              : 'Hover a card — your cursor becomes the bat. Click to open the full project on GitHub.'}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>

        <div data-reveal className="mt-10 flex justify-center">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="glass neon-edge rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white"
          >
            All repositories on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  )
}
