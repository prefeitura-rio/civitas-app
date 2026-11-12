import type { ReactNode } from 'react'

/** "Nesta análise": sem ícones; a seção ativa é marcada pela barra azul à esquerda. */
export function ProfileIndexNav({
  label,
  sections,
  activeSection,
  onSelect,
  coverage,
}: {
  label: string
  sections: Array<{ id: string; label: string; badge: string }>
  activeSection: string | null
  onSelect: (id: string) => void
  coverage?: ReactNode
}) {
  return (
    <nav className="profile-index" aria-label={label}>
      <span className="profile-index-title">Nesta análise</span>
      {sections.map(({ id, label: sectionLabel, badge }) => (
        <button
          key={id}
          type="button"
          className={`profile-index-link${activeSection === id ? ' active' : ''}`}
          onClick={() => onSelect(id)}
        >
          <span>{sectionLabel}</span>
          <em>{badge}</em>
        </button>
      ))}
      {coverage}
    </nav>
  )
}
