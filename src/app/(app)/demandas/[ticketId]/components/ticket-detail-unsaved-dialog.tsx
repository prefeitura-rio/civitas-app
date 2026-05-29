'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import styles from '../ticket-detail.module.css'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  onCancel: () => void
  onDiscard: () => void
  onSave: () => void
}

export function TicketDetailUnsavedDialog({
  open,
  onOpenChange,
  pending,
  onCancel,
  onDiscard,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${styles.reassignDialogContent} ${styles.unsavedDialogContent}`}
        data-unsaved-guard-ignore
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault()
        }}
      >
        <div
          className={`${styles.reassignDialogInner} ${styles.unsavedDialogInner}`}
        >
          <DialogHeader className={styles.reassignDialogHeader}>
            <DialogTitle className={styles.reassignDialogTitle}>
              Alterações não salvas
            </DialogTitle>
          </DialogHeader>

          <p className={styles.reassignFieldMessage}>
            Existem alterações nesta aba que ainda não foram salvas. Deseja
            salvar antes de sair?
          </p>

          <DialogFooter
            className={`${styles.footerActions} ${styles.unsavedDialogFooter}`}
          >
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
              disabled={pending}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
              disabled={pending}
              onClick={onDiscard}
            >
              Descartar alterações
            </button>
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
              disabled={pending}
              onClick={onSave}
            >
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
