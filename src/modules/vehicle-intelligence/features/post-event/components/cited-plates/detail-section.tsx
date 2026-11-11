import type { ReactNode } from 'react'

export function DetailSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="detail-section">
      <div className="detail-section-heading">
        <b>{title}</b>
        {hint && <span>{hint}</span>}
      </div>
      {children}
    </section>
  )
}
