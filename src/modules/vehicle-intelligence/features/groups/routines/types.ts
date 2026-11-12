/** Motos de rotina parecida (`/api/<recorte>/v1/routines/...`, `analise/rotina.py`). */

/** O que aproxima duas rotinas: local × faixa de 4 h (LF), começo (IN) ou fim (FI) do dia num local, hora da semana (HS). */
export interface RoutineShared {
  kind: 'LF' | 'IN' | 'FI' | 'HS'
  place: string | null
  when: string | null
  /** Parcela do cosseno que vem desta ficha (0 a 1). */
  share: number
}

export interface RoutineNeighbor {
  plate: string
  /** Cosseno das rotinas (0 a 1). */
  cosine: number
  /** CSLS: a ordem, que desconta as rotinas genéricas. */
  score: number
  days: number
  first_read: string
  last_read: string
  days_in_common: number
  days_together: number
  events: number
  cited: boolean
  base: string | null
  /** Placa a 1 caractere de uma consultada que nunca passa junto com ela: provável erro de leitura. */
  double_read: boolean
  shared: RoutineShared[]
  /** No grupo: os membros com quem a rotina se parece, o mais parecido primeiro. */
  similar_to?: string[]
}

export interface RoutineData {
  ready: boolean
  reason?: string
  build_command?: string | null
  plate?: string
  days?: number
  plates?: string[]
  without_routine?: string[]
  window?: { start: string; end: string }
  parameters?: { minimum_days: number; gallery: number; per_member?: number }
  neighbors: RoutineNeighbor[]
  methodology?: Record<string, string>
}
