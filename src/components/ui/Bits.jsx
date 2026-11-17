// Small shared pieces used by several sections

export function Eyebrow({ no, children }) {
  return (
    <p data-reveal className="eyebrow flex items-center gap-3">
      <span className="rounded bg-[#ff1f3d] px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-normal text-white">{no}</span>
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
