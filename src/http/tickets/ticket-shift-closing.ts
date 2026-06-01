import { api } from '@/lib/api'

export type TicketShiftClosingServiceTag = {
  label: string
}

export type TicketShiftClosingItem = {
  id: string
  ticket_number: string
  status: string
  priority?: string | null
  ticket_type: string
  team: string
  assignee: string
  procedure_number: string | null
  entry_at: string | null
  email_at: string | null
  completed_at: string | null
  services: TicketShiftClosingServiceTag[]
}

export type TicketShiftClosingPreviewIn = {
  start_date: string
  start_time: string
  end_time: string
  team_id?: string
}

export type TicketShiftClosingPreviewOut = {
  period_start: string
  period_end: string
  total: number
  items: TicketShiftClosingItem[]
}

export type TicketShiftClosingPersistIn = TicketShiftClosingPreviewIn & {
  comment?: string
}

export type TicketShiftClosingRecordOut = {
  id: string
  created_at: string
  period_start: string
  period_end: string
  team_id: string
  closed_by_id: string
  comment: string
  total: number
  items: TicketShiftClosingItem[]
}

export async function previewTicketShiftClosing(
  payload: TicketShiftClosingPreviewIn,
) {
  const { data } = await api.post<TicketShiftClosingPreviewOut>(
    '/tickets/shift-closing',
    payload,
  )
  return data
}

export async function persistTicketShiftClosing(
  payload: TicketShiftClosingPersistIn,
) {
  const { data } = await api.post<TicketShiftClosingRecordOut>(
    '/tickets/shift-closings',
    {
      ...payload,
      comment: payload.comment?.trim() ?? '',
    },
  )
  return data
}

export async function getTicketShiftClosing(shiftClosingId: string) {
  const { data } = await api.get<TicketShiftClosingRecordOut>(
    `/tickets/shift-closings/${encodeURIComponent(shiftClosingId)}`,
  )
  return data
}
