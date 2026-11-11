/** Perfil do RO: os caminhos da API (lidos com `useApi`). */
import type { OccurrenceWindows } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'

/** ROs pelo número (inteiro ou trecho) ou pela placa vítima. */
export const occurrenceSearchPath = (query: string) =>
  `/api/v1/occurrences/search?${new URLSearchParams({ q: query.trim() })}`

/** As janelas escolhidas na tela; as ausentes ficam com a padrão do recorte. */
export type WindowChoice = Partial<OccurrenceWindows>

export function occurrenceProfilePath(
  ro: string,
  windows: WindowChoice,
): string {
  const query = new URLSearchParams({ ro })
  const params: Array<[string, number | null | undefined]> = [
    ['janela_evento', windows.event_window_minutes],
    ['janela_correlacao', windows.passage_window_minutes],
    ['raio_metros', windows.radius_meters],
    ['janela_perto', windows.near_window_minutes],
  ]
  for (const [name, value] of params) if (value) query.set(name, String(value))
  return `/api/v1/occurrences/profile?${query}`
}
