import { Plus } from 'lucide-react'

import styles from '../../ticket-create/ticket-create-form.module.css'

type Props = {
  title: string
  onAdd: () => void
  disabled?: boolean
}

export function ServiceAddCard({ title, onAdd, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className={styles.serviceCard}
    >
      <span className={styles.serviceCardTitle}>{title}</span>
      <span className={styles.plusBox}>
        <Plus className="h-4 w-4" />
      </span>
    </button>
  )
}
