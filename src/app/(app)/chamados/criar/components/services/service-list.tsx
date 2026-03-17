import { Pencil, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'

import styles from '../../ticket-create/ticket-create-form.module.css'

type Props<T extends { id: string }> = {
  label: string
  fields: T[]
  onRemove: (index: number) => void
  onEdit?: (index: number) => void
  renderRow: (index: number) => React.ReactNode
}

export function ServiceList<T extends { id: string }>({
  label,
  fields,
  onRemove,
  onEdit,
  renderRow,
}: Props<T>) {
  if (fields.length === 0) return null

  const isCompact = onEdit != null

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {fields.length} item(ns)
        </p>
      </div>

      <div className={styles.serviceItemList}>
        {fields.map((f, idx) => (
          <div
            key={f.id}
            className={
              isCompact
                ? styles.serviceItemBadgeCard
                : styles.serviceItemFormCard
            }
          >
            {isCompact ? (
              <>
                <button
                  type="button"
                  className={styles.serviceItemBadgeButton}
                  onClick={() => onEdit?.(idx)}
                  title="Abrir para editar"
                >
                  <span className={styles.serviceItemBadge}>
                    {label} · Item {idx + 1}
                  </span>
                  <Pencil className={styles.serviceItemBadgeIcon} />
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  className={styles.serviceItemDeleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(idx)
                  }}
                  title="Remover"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onRemove(idx)}
                    title="Remover"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {renderRow(idx)}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
