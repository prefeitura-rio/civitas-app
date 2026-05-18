import { api } from '@/lib/api'

export interface EmailBase {
  id: string
  thread_id?: string | null
  from_address?: string | null
  from_name?: string | null
  to_address?: string | null
  subject?: string | null
  snippet?: string | null
  date?: string | null
  internal_date?: number | null
  has_attachments: boolean
  is_read: boolean
}

export interface EmailPageOut {
  items: EmailBase[]
  total: number
}

/** Contagem de e-mails não lidos + aguardando resposta (menu lateral / caixa de entrada). */
export interface EmailAttentionCountsOut {
  total: number
}

/** @deprecated Use EmailAttentionCountsOut */
export type EmailUnreadCountOut = EmailAttentionCountsOut

export function getEmails({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails', {
    params: { page, pageSize },
  })
}

export function getEmailsNaoLidos({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails/nao-lidos', {
    params: { page, pageSize },
  })
}

export async function getEmailNaoLidosCount() {
  const response = await api.get<EmailAttentionCountsOut>(
    '/emails/unread/count',
  )
  return response.data
}

export function getEmailsAguardandoResposta({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails/aguardando-resposta', {
    params: { page, pageSize },
  })
}

export function getEmailsSpam({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails/spam', {
    params: { page, pageSize },
  })
}

export function getEmailsRespondidos({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  return api.get<EmailPageOut>('/emails/respondidos', {
    params: { page, pageSize },
  })
}
