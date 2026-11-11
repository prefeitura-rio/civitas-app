import type { ReactNode } from 'react'

/** Uma seção dos popups e do painel do polo: título, nota à direita e o conteúdo. */
export function PopupSection({
  title,
  hint,
  className,
  children,
}: {
  title: string
  hint: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={
        className ? `radar-popup-section ${className}` : 'radar-popup-section'
      }
    >
      <div className="radar-popup-section-heading">
        <b>{title}</b>
        <span>{hint}</span>
      </div>
      {children}
    </section>
  )
}
