import { ChevronDown, ChevronUp } from 'lucide-react'

import styles from '../../ticket-create/ticket-create-form.module.css'

type Props = {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function Section({ title, isOpen, onToggle, children }: Props) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{title}</span>

        <button
          type="button"
          onClick={onToggle}
          className={styles.sectionToggle}
          aria-label={`Alternar seção ${title}`}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && <div className={styles.sectionInner}>{children}</div>}
    </div>
  )
}
