import { useEffect, useRef, type ReactNode } from 'react'
import { STATUS_LABEL, type LoreStatus } from '../content/lore'

export function PageHeader({ kicker, en, ko, image, children }: { kicker?: string; en: string; ko?: string; image?: string; children?: ReactNode }) {
  return (
    <header className={`page-header ${image ? 'has-image' : ''}`} style={image ? { ['--header-image' as string]: `url("${image}")` } : undefined}>
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{en}</h1>
      {ko && <p className="page-header-ko">{ko}</p>}
      {children && <div className="page-header-copy">{children}</div>}
    </header>
  )
}

export function Panel({ title, ko, action, children, className = '' }: { title: string; ko?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <h2><span>{title}</span>{ko && <small>{ko}</small>}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatusBadge({ status }: { status: LoreStatus }) {
  const label = STATUS_LABEL[status]
  return <span className={`status-badge status-${status}`}>{label.en}<small>{label.ko}</small></span>
}

export function Modal({ open, onClose, label, children, wide = false }: { open: boolean; onClose: () => void; label: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} aria-label={label} onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose() }}>
      {open && <div className="modal-sheet">
        <button className="modal-close" onClick={onClose} aria-label="닫기">×</button>
        {children}
      </div>}
    </dialog>
  )
}

export const timeAgo = (date: string) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(date))
}

export const formatDate = (date: string) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date))
