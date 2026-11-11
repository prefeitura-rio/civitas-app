/** Regras da busca de placas nos três recortes: o padrão digitado e o recorte em que cada placa abre. */
import { toAppPath } from '@/modules/vehicle-intelligence/app/base-path'
import {
  recorteAtual,
  type RecorteId,
  RECORTES,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { setApplyToPlates } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  PlateSearchCounts,
  PlateSearchItem,
  PlateSearchWindow,
} from '@/modules/vehicle-intelligence/types/domain'
import type { PlateProfileAnalysis } from '@/modules/vehicle-intelligence/types/navigation'

const PLATE_LENGTH = 7
// Com menos caracteres fixos o padrão traz milhares de placas; o motor recusa.
const MIN_FIXED_CHARACTERS = 4

/** O que o campo aceita: letras, números e `-`, até 8 caracteres (a placa antiga escrita ABC-1234). */
export function platePatternInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, PLATE_LENGTH + 1)
}

export type PlatePattern = {
  pattern: string
  exact: boolean
  ready: boolean
  problem: string | null
}

/** O padrão como o motor o lê: em ABC-1234 o hífen só separa; os demais `-` são curingas. */
export function parsePlatePattern(value: string): PlatePattern {
  const pattern =
    value.length === PLATE_LENGTH + 1 && value[3] === '-'
      ? value.slice(0, 3) + value.slice(4)
      : value
  const fixed = pattern.replace(/-/g, '').length
  const problem =
    pattern.length > PLATE_LENGTH
      ? `A placa tem ${PLATE_LENGTH} caracteres.`
      : pattern.length === PLATE_LENGTH && fixed < MIN_FIXED_CHARACTERS
        ? `Fixe pelo menos ${MIN_FIXED_CHARACTERS} caracteres (no máximo ${PLATE_LENGTH - MIN_FIXED_CHARACTERS} traços).`
        : null
  return {
    pattern,
    exact: !pattern.includes('-'),
    ready: pattern.length === PLATE_LENGTH && fixed >= MIN_FIXED_CHARACTERS,
    problem,
  }
}

function hasFacts(counts: PlateSearchCounts): boolean {
  return counts.fatos + counts.vitima + counts.citada > 0
}

export function appearsIn(
  counts: PlateSearchCounts | undefined,
): counts is PlateSearchCounts {
  return Boolean(counts && (hasFacts(counts) || counts.dias > 0))
}

/** Placa fora das correlatas por regra do banco: nada a abrir em nenhum recorte. */
export function blockedReason(item: PlateSearchItem): string | null {
  if (item.invalida)
    return `Placa inválida, fora de todas as telas: ${item.invalida}`
  if (item.onibus_municipal)
    return 'Ônibus da frota municipal (licenciamento): fora das leituras e das correlatas nos três recortes.'
  return null
}

export type Destination = { recorte: RecorteId; analysis: PlateProfileAnalysis }

/** Correlações quando há fato no recorte; só circulação abre direto em Tendências. */
export function destinationIn(
  item: PlateSearchItem,
  recorte: RecorteId,
): Destination | null {
  const counts = item.recortes[recorte]
  if (blockedReason(item) || !appearsIn(counts)) return null
  return { recorte, analysis: hasFacts(counts) ? 'correlations' : 'trends' }
}

/** Recorte para abrir pela tecla Enter: o ativo, se a placa aparece nele; senão, o de mais fatos. */
export function preferredDestination(
  item: PlateSearchItem,
): Destination | null {
  const here = destinationIn(item, recorteAtual)
  if (here) return here
  const others = RECORTES.filter(
    (recorte) => recorte.id !== recorteAtual && destinationIn(item, recorte.id),
  ).sort((left, right) => {
    const a = item.recortes[left.id]
    const b = item.recortes[right.id]
    return (
      b.fatos + b.vitima + b.citada - (a.fatos + a.vitima + a.citada) ||
      b.dias - a.dias
    )
  })
  return others.length ? destinationIn(item, others[0].id) : null
}

/** A busca abre o perfil com "Ver todos os fatos": ela olha o grafo inteiro, não o recorte global da tela. */
const ALL_FACTS = { name: 'fatos', value: 'todos' }

/** O perfil noutro recorte (a página recarrega nele), com "Ver todos os fatos" na URL. */
export function profileHref(
  plate: string,
  { recorte, analysis }: Destination,
): string {
  return `${toAppPath(`/profile/${plate}/${analysis}`)}?recorte=${recorte}&${ALL_FACTS.name}=${ALL_FACTS.value}`
}

/**
 * O perfil aberto pela busca em outro recorte (`profileHref`) chega com "Ver todos os fatos". O parâmetro sai da URL
 * para não seguir nas navegações. Chamado uma vez, na entrada do app.
 */
export function openedFromSearch(): void {
  const params = new URLSearchParams(window.location.search)
  if (params.get(ALL_FACTS.name) !== ALL_FACTS.value) return
  setApplyToPlates(false)
  params.delete(ALL_FACTS.name)
  const query = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )
}

export function windowLabel(window: PlateSearchWindow): string {
  return window.raio_m != null
    ? `±${window.janela_min} min do fato, até ${formatNumber(window.raio_m)} m`
    : `±${window.janela_min} min do fato, passagens a ±${window.passagem_min} min da vítima`
}
