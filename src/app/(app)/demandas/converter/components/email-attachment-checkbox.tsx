import { Square, SquareCheck } from 'lucide-react'

import type { AttachmentOut } from '@/http/emails/get-email'
import { getEmailAttachmentBlockedReason } from '@/utils/email-attachment-selection'

import styles from './email-to-ticket-view.module.css'

export function EmailAttachmentCheckbox({
  attachment,
  selected,
  disabled,
  onToggle,
}: {
  attachment: AttachmentOut
  selected: boolean
  disabled: boolean
  onToggle: (id: number) => void
}) {
  const reason = getEmailAttachmentBlockedReason(attachment)
  const checked = selected && !reason
  const title =
    reason ||
    (checked
      ? 'Desmarcar para não enviar na demanda'
      : 'Marcar para enviar na demanda')

  return (
    <span
      className="inline-flex shrink-0"
      title={title}
      tabIndex={reason ? 0 : undefined}
      aria-label={reason || undefined}
    >
      <button
        type="button"
        className={styles.fileRowCheckBtn}
        onClick={() => {
          if (!reason) onToggle(attachment.id)
        }}
        disabled={disabled || Boolean(reason)}
        aria-pressed={checked}
        aria-label={
          checked
            ? `Desmarcar anexo do e-mail ${attachment.filename}`
            : `Incluir anexo do e-mail ${attachment.filename}`
        }
        title={title}
      >
        {checked ? (
          <SquareCheck
            className={`${styles.fileRowCheckIcon} ${styles.fileRowCheckIconOn} shrink-0`}
            aria-hidden
          />
        ) : (
          <Square
            className={`${styles.fileRowCheckIcon} shrink-0`}
            aria-hidden
          />
        )}
      </button>
    </span>
  )
}
