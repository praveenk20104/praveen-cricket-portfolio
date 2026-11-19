// Small shared pieces used by several sections

export function Eyebrow({ no, children }) {
  return (
    <p data-reveal className="eyebrow flex items-center gap-3">
      <span className="rounded bg-india px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-normal text-white">{no}</span>
      {children}
    </p>
  )
}

export function Chips({ items, className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  )
}

// Small CSS cricket ball (red leather + stitched seam), used as a bullet / icon
export function BallIcon({ className = 'h-5 w-5' }) {
  return (
    <span className={`relative inline-block shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff5a6c,#b3121f_55%,#3a0408)] shadow-[0_0_14px_rgba(255,31,61,0.55)] ${className}`} aria-hidden="true">
      <span className="absolute inset-y-[12%] left-1/2 w-0 -translate-x-1/2 border-l border-dashed border-[#f4e9d6]/85" />
    </span>
  )
}
