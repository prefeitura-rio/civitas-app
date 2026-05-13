export const TICKET_DETAIL_BASE_TAB_IDS = [
  'solicitante',
  'chamado',
  'documentos',
  'servicos',
  'parecer_interno',
  'relatorio_demanda',
  'historico',
] as const

export type TicketDetailBaseTabId = (typeof TICKET_DETAIL_BASE_TAB_IDS)[number]

export type TicketDetailTabId = TicketDetailBaseTabId | 'resposta'

export const TICKET_DETAIL_BASE_TABS: {
  id: TicketDetailBaseTabId
  label: string
}[] = [
  { id: 'solicitante', label: 'Solicitante' },
  { id: 'chamado', label: 'Demanda' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'parecer_interno', label: 'Parecer Interno' },
  { id: 'relatorio_demanda', label: 'Relatório de Demanda' },
  { id: 'historico', label: 'Histórico' },
]

export const TICKET_RESPOSTA_TAB = {
  id: 'resposta' as const,
  label: 'Resposta',
}

const RESPOSTA_TAB_STATE_ID = 'AGUARDANDO_REVISAO_ADMINISTRATIVO'

export function shouldShowTicketRespostaTab(
  stateId: string | null | undefined,
  status: string | null | undefined,
) {
  const normalizedStateId = stateId?.trim().toUpperCase() ?? ''
  if (normalizedStateId === RESPOSTA_TAB_STATE_ID) return true

  const normalizedStatus = status?.trim().toUpperCase() ?? ''
  if (!normalizedStatus) return false
  return normalizedStatus === RESPOSTA_TAB_STATE_ID
}
