/** THE MCR NATION 문장(紋章) — 이 사이트를 위한 오리지널 그래픽. 날개 + 인장 + 사각 별. */
export function Emblem({ size = 48, className = '' }: { size?: number; className?: string }) {
  const feathers = [0, 1, 2, 3, 4]
  return (
    <svg className={`emblem ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {feathers.map((i) => (
          <g key={i}>
            <path d={`M56 ${44 + i * 7} L${14 + i * 5} ${30 + i * 13} L${20 + i * 5} ${36 + i * 13} Z`} />
            <path d={`M64 ${44 + i * 7} L${106 - i * 5} ${30 + i * 13} L${100 - i * 5} ${36 + i * 13} Z`} />
          </g>
        ))}
        <circle cx="60" cy="60" r="22" />
        <path d="M60 18 L64 30 L60 34 L56 30 Z" />
        <path d="M54 82 L60 104 L66 82 Z" />
      </g>
      <circle cx="60" cy="60" r="17" fill="none" stroke="var(--emblem-inner, #E8E4DC)" strokeWidth="1.6" />
      <path d="M60 46 L63 57 L74 60 L63 63 L60 74 L57 63 L46 60 L57 57 Z" fill="var(--emblem-inner, #E8E4DC)" />
    </svg>
  )
}
