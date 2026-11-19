import { profile, strengths } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'

export default function About() {
  return (
    <section id="about" className="relative flex min-h-screen items-center px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Eyebrow no="02">The pitch report</Eyebrow>
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 data-reveal className="h-display text-[clamp(2.7rem,6vw,5.8rem)] lg:col-span-7">
            I read the data like a <span className="accent-text">pitch</span> before every innings.
          </h2>
          <div data-reveal className="glass-strong rounded-3xl p-6 md:p-8 lg:col-span-5 lg:self-end">
            <p className="body md:text-lg">{profile.summary}</p>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="label">At the crease right now</p>
              <p className="mt-1.5 text-base font-medium text-white">MIS Executive · Rahul Trivedi &amp; Associates, Rohini</p>
            </div>
          </div>
        </div>
        <div data-reveal className="mt-10">
          <p className="label mb-3">What I am known for in the dressing room</p>
          <Chips items={strengths} />
        </div>
      </div>
    </section>
  )
}
