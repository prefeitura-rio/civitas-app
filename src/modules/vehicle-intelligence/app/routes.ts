/**
 * As rotas do painel: o caminho da URL vira um objeto (`parseRoute`) e cada tela tem o seu construtor de caminho.
 * Funções puras; quem mexe no histórico do navegador é `navigation.ts`. A query (`?recorte=`) não faz parte da rota:
 * ela segue igual em toda navegação.
 *
 *   /                                                   visão geral
 *   /correlation, /post-event                           placas correlatas, trajetória pós-evento
 *   /profile                                            busca de placa
 *   /profile/<placa>[/correlations|/trends]             perfil (a análise padrão é correlations)
 *   /profile/<placa>/<análise>/timeline                 timeline da placa, no primeiro dia
 *   /profile/<placa>/<análise>/dia/AAAA-MM-DD           timeline num dia (/profile/<placa>/dia/... e
 *                                                       /profile/<placa>/timeline, sem a análise, também valem)
 *   /groups, /groups/<placas>[/timeline[/dia/AAAA-MM-DD]]   grupos, perfil do grupo e a timeline dele
 *   /territories, /territories/<complexo codificado>    territórios e o perfil de um complexo
 *   /occurrence, /occurrence/<RO ou placa vítima codificado>   busca e perfil do RO (a placa lista os ROs dela)
 */
import {
  moduleById,
  type ModuleId,
  moduleOfPath,
} from '@/modules/vehicle-intelligence/app/modules'
import type { PlateProfileAnalysis } from '@/modules/vehicle-intelligence/types/navigation'

export type { ModuleId }

export type PlateRoute = {
  plate: string
  view: 'profile' | 'timeline'
  day: string | null
  analysis: PlateProfileAnalysis
}

/** Um grupo é identificado pelas placas, em ordem e separadas por hífen. */
export type GroupRoute = {
  id: string
  view: 'profile' | 'timeline'
  day: string | null
}

export interface Route {
  module: ModuleId
  /** A placa aberta (perfil ou timeline); nulo na busca. */
  plate: PlateRoute | null
  /** O grupo aberto; nulo na página de grupos. */
  group: GroupRoute | null
  /** O complexo aberto; nulo na lista de territórios. */
  territory: string | null
  /** O RO (ou a placa vítima, que lista os ROs dela) aberto; nulo na busca. */
  occurrence: string | null
}

/** "/correlation/" e "correlation" viram "/correlation"; vazio vira "/". */
export function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

function plateOf(path: string): PlateRoute | null {
  const match = path.match(/^\/profile\/([A-Za-z0-9]{3,8})(?:\/(.*))?$/)
  if (!match) return null
  const plate = match[1].toUpperCase()
  const rest = match[2] || ''
  const scopedDay = rest.match(
    /^(correlations|trends)\/dia\/(\d{4}-\d{2}-\d{2})$/,
  )
  if (scopedDay)
    return {
      plate,
      view: 'timeline',
      day: scopedDay[2],
      analysis: scopedDay[1] as PlateProfileAnalysis,
    }
  const scopedTimeline = rest.match(/^(correlations|trends)\/timeline$/)
  if (scopedTimeline)
    return {
      plate,
      view: 'timeline',
      day: null,
      analysis: scopedTimeline[1] as PlateProfileAnalysis,
    }
  const day = rest.match(/^dia\/(\d{4}-\d{2}-\d{2})$/)
  if (day)
    return { plate, view: 'timeline', day: day[1], analysis: 'correlations' }
  if (rest === 'timeline')
    return { plate, view: 'timeline', day: null, analysis: 'correlations' }
  if (rest === 'trends')
    return { plate, view: 'profile', day: null, analysis: 'trends' }
  return { plate, view: 'profile', day: null, analysis: 'correlations' }
}

function groupOf(path: string): GroupRoute | null {
  const match = path.match(
    /^\/groups\/([A-Za-z0-9-]{7,})(?:\/timeline(?:\/dia\/(\d{4}-\d{2}-\d{2}))?)?$/,
  )
  if (!match) return null
  return {
    id: match[1].toUpperCase(),
    view: path.includes('/timeline') ? 'timeline' : 'profile',
    day: match[2] ?? null,
  }
}

/** O trecho codificado depois do prefixo (`/territories/`, `/occurrence/`); nulo sem ele ou com codificação inválida. */
function decodedAfter(path: string, prefix: string): string | null {
  if (!path.startsWith(prefix) || path.length === prefix.length) return null
  try {
    return decodeURIComponent(path.slice(prefix.length))
  } catch {
    return null
  }
}

/** A rota de um caminho da URL. */
export function parseRoute(pathname: string): Route {
  const path = normalizePath(pathname)
  return {
    module: moduleOfPath(path),
    plate: plateOf(path),
    group: groupOf(path),
    territory: decodedAfter(path, '/territories/'),
    occurrence:
      decodedAfter(path, '/occurrence/')?.trim().toUpperCase() || null,
  }
}

export const modulePath = (module: ModuleId) => moduleById(module).path
export const platePath = (plate: string, analysis: PlateProfileAnalysis) =>
  `/profile/${plate}/${analysis}`
export const plateTimelinePath = (
  plate: string,
  analysis: PlateProfileAnalysis,
  day: string | null,
) => `/profile/${plate}/${analysis}/${day ? `dia/${day}` : 'timeline'}`
export const groupProfilePath = (id: string) => `/groups/${id}`
/** O grupo pelas placas, em ordem: a mesma rota venha de onde vier. */
export const groupPath = (plates: string[]) =>
  groupProfilePath([...plates].sort().join('-'))
export const groupTimelinePath = (id: string, day: string | null) =>
  `/groups/${id}/timeline${day ? `/dia/${day}` : ''}`
export const territoryPath = (complex: string) =>
  `/territories/${encodeURIComponent(complex)}`
/** O RO ("019-06778/2026", com a barra codificada) ou a placa vítima. */
export const occurrencePath = (key: string) =>
  `/occurrence/${encodeURIComponent(key.trim().toUpperCase())}`
