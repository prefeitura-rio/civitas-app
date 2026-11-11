import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Título de uma seção do perfil: ícone, sobretítulo (só nas seções das correlações), título, descrição e, à direita, uma
 * ação opcional.
 */
export function ProfileHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  eyebrow?: string
  title: ReactNode
  description: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="profile-heading">
      <div className="profile-heading-main">
        <div className="profile-heading-icon">
          <Icon size={18} />
        </div>
        <div>
          {eyebrow && <span className="profile-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
