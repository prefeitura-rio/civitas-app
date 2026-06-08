export const TICKET_DETAIL_BASE_TAB_IDS = [
  'solicitante',
  'chamado',
  'documentos',
  'services',
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
  { id: 'documentos', label: 'Documentos Recebidos' },
  { id: 'services', label: 'Serviços e Documentos Elaborados' },
  { id: 'parecer_interno', label: 'Parecer Interno' },
  { id: 'relatorio_demanda', label: 'Relatório de Demanda' },
  { id: 'historico', label: 'Histórico' },
]

export const TICKET_RESPOSTA_TAB = {
  id: 'resposta' as const,
  label: 'Resposta',
}

export const TICKET_DETAIL_UNSAVED_GUARD_TAB_IDS = [
  'solicitante',
  'chamado',
  'services',
  'parecer_interno',
  'relatorio_demanda',
] as const

export type TicketDetailUnsavedGuardTabId =
  (typeof TICKET_DETAIL_UNSAVED_GUARD_TAB_IDS)[number]

const UNSAVED_GUARD_TAB_SET = new Set<string>(
  TICKET_DETAIL_UNSAVED_GUARD_TAB_IDS,
)

export function isTicketDetailUnsavedGuardTab(
  tabId: string,
): tabId is TicketDetailUnsavedGuardTabId {
  return UNSAVED_GUARD_TAB_SET.has(tabId)
}

const RESPOSTA_TAB_VISIBLE_IDS = new Set([
  'AGUARDANDO_REVISAO_ADMINISTRATIVO',
  'RESTRITO',
  'DEMANDA_RESPONDIDA',
])

const SEI_FIELDS_VISIBLE_STATE_IDS = new Set([
  'FINALIZADO',
  'DEMANDA_RESPONDIDA',
])

export function shouldShowTicketSeiFields(
  stateId: string | null | undefined,
  status: string | null | undefined,
) {
  const normalizedStateId = stateId?.trim().toUpperCase() ?? ''
  if (
    normalizedStateId &&
    SEI_FIELDS_VISIBLE_STATE_IDS.has(normalizedStateId)
  ) {
    return true
  }

  const normalizedStatus = status?.trim().toUpperCase() ?? ''
  if (!normalizedStatus) return false
  return SEI_FIELDS_VISIBLE_STATE_IDS.has(normalizedStatus)
}

export function shouldShowTicketRespostaTab(
  stateId: string | null | undefined,
  status: string | null | undefined,
) {
  const normalizedStateId = stateId?.trim().toUpperCase() ?? ''
  if (normalizedStateId && RESPOSTA_TAB_VISIBLE_IDS.has(normalizedStateId)) {
    return true
  }

  const normalizedStatus = status?.trim().toUpperCase() ?? ''
  if (!normalizedStatus) return false
  return RESPOSTA_TAB_VISIBLE_IDS.has(normalizedStatus)
}
