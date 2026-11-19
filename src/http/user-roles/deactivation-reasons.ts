export type UserDeactivationReason =
  | 'DESLIGAMENTO'
  | 'TRANSFERENCIA'
  | 'AFASTAMENTO_TEMPORARIO'
  | 'BLOQUEIO_ADMINISTRATIVO'
  | 'BLOQUEIO_AUTOMATICO_RATE_LIMIT'
  | 'BLOQUEIO_AUTOMATICO_SCRAPING'
  | 'OUTRO'

/** Motivos que um coordenador pode escolher; os automáticos são reservados ao sistema. */
export const MANUAL_DEACTIVATION_REASONS = [
  'DESLIGAMENTO',
  'TRANSFERENCIA',
  'AFASTAMENTO_TEMPORARIO',
  'BLOQUEIO_ADMINISTRATIVO',
  'OUTRO',
] as const satisfies readonly UserDeactivationReason[]

export type ManualDeactivationReason =
  (typeof MANUAL_DEACTIVATION_REASONS)[number]

export const DEACTIVATION_REASON_LABELS: Record<
  UserDeactivationReason,
  string
> = {
  DESLIGAMENTO: 'Desligamento',
  TRANSFERENCIA: 'Transferência de órgão/setor',
  AFASTAMENTO_TEMPORARIO: 'Afastamento temporário (férias, licença)',
  BLOQUEIO_ADMINISTRATIVO: 'Bloqueio administrativo',
  BLOQUEIO_AUTOMATICO_RATE_LIMIT: 'Bloqueio automático (limite de requisições)',
  BLOQUEIO_AUTOMATICO_SCRAPING: 'Bloqueio automático (uso automatizado)',
  OUTRO: 'Outro',
}

export type UserStatusFilter = 'active' | 'inactive' | 'all'
