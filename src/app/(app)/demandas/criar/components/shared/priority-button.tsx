import { Button } from '@/components/ui/button'

import styles from '../../ticket-create/ticket-create-form.module.css'

type Props = {
  active: boolean
  label: string
  onClick: () => void
  disabled?: boolean
}

export function PriorityButton({ active, label, onClick, disabled }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.priorityButton} ${active ? styles.priorityActive : ''}`}
    >
      {label}
    </Button>
  )
}
