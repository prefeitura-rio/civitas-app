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
  { id: 'chamado', label: 'Chamado' },
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

const TICKET_STATE_IDS_WITH_RESPOSTA_TAB = new Set([
  'AGUARDANDO_REVISAO_ADMINISTRATIVO',
  'AGUARDANDO_REVISAO_ADJUNTO',
  // Compatibilidade com payloads antigos/inconsistentes:
  'ADJUNTO',
  'ADMINISTRATIVO',
])

export function shouldShowTicketRespostaTab(
  stateId: string | null | undefined,
  status: string | null | undefined,
) {
  const normalizedStateId = stateId?.trim().toUpperCase() ?? ''
  if (TICKET_STATE_IDS_WITH_RESPOSTA_TAB.has(normalizedStateId)) return true

  const normalizedStatus = status?.trim().toUpperCase() ?? ''
  return (
    normalizedStatus === 'AGUARDANDO_REVISAO_ADMINISTRATIVO' ||
    normalizedStatus === 'AGUARDANDO_REVISAO_ADJUNTO'
  )
}
