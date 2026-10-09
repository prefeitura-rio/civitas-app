'use client'

import { Download, SquareCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { downloadTicketAttachmentFile } from '@/http/tickets/download-ticket-attachment'
import type { TicketAttachmentOut } from '@/http/tickets/ticket-attachments'

type Props = {
  ticketId: string | null | undefined
  attachments: TicketAttachmentOut[]
  classNames: {
    row: string
    checkIcon: string
    fileName: string
    badge: string
  }
}

export function ExistingTicketAttachments({
  ticketId,
  attachments,
  classNames,
}: Props) {
  return attachments.map((attachment) => (
    <div key={`existing-${attachment.id}`} className={classNames.row}>
      <SquareCheck className={`${classNames.checkIcon} shrink-0`} aria-hidden />
      <p className={classNames.fileName} title={attachment.filename}>
        {attachment.filename}
      </p>
      <span className={classNames.badge}>Já anexado</span>
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 shrink-0 p-0"
        title={`Baixar ${attachment.filename}`}
        disabled={!ticketId}
        onClick={() => {
          if (!ticketId) return
          downloadTicketAttachmentFile(attachment, ticketId).catch(() =>
            toast.error('Não foi possível baixar o anexo.'),
          )
        }}
      >
        <Download className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  ))
}
