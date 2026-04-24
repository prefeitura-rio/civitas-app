export const TICKET_DETAIL_TAB_IDS = [
  'solicitante',
  'chamado',
  'documentos',
  'servicos',
  'parecer_interno',
  'relatorio_demanda',
  'historico',
] as const

export type TicketDetailTabId = (typeof TICKET_DETAIL_TAB_IDS)[number]

export const TICKET_DETAIL_TABS: { id: TicketDetailTabId; label: string }[] = [
  { id: 'solicitante', label: 'Solicitante' },
  { id: 'chamado', label: 'Chamado' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'parecer_interno', label: 'Parecer Interno' },
  { id: 'relatorio_demanda', label: 'Relatório de Demanda' },
  { id: 'historico', label: 'Histórico' },
]
