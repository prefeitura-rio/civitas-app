/**
 * Grupos de suspeitas: filtros (os mesmos na página e no perfil, guardados por recorte) e chamadas da API.
 */
import {
  recorte,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import { request } from '@/modules/vehicle-intelligence/lib/api'
import { createStore } from '@/modules/vehicle-intelligence/lib/store'
import type {
  GroupProfileData,
  GroupsData,
  GroupTimelineData,
} from '@/modules/vehicle-intelligence/types/groups'

export interface GroupFilters {
  meses: number | null
  modalidades: string[]
  alvos: string[]
  deslocamentos: string[]
  cisps: string[]
  sementes: number
  minimoSementes: number
  criterio: 'padrao' | 'estrito'
  taxis: 'excluir_taxis' | 'todos'
}

/** Sementes e mínimo do recorte (`config/recortes.ts`): 10+ em transeuntes, 4+ em veículos, 3+ em carga. */
export const DEFAULT_GROUP_FILTERS: GroupFilters = {
  meses: null,
  modalidades: [],
  alvos: [],
  deslocamentos: [],
  cisps: [],
  sementes: recorte.groups.seeds,
  minimoSementes: recorte.groups.minimumSeedEvents,
  criterio: 'padrao',
  taxis: 'excluir_taxis',
}

// A mesma chave de antes: quem tinha filtros guardados na sessão não os perde.
const filtersStore = createStore(DEFAULT_GROUP_FILTERS, {
  storageKey: recorteStorageKey('grupos:filtros'),
})
export const setGroupFilters = filtersStore.set
export const useGroupFilters = filtersStore.use

export function isDefault(filters: GroupFilters): boolean {
  return JSON.stringify(filters) === JSON.stringify(DEFAULT_GROUP_FILTERS)
}

function params(filters: GroupFilters): URLSearchParams {
  const query = new URLSearchParams()
  if (filters.meses) query.set('meses', String(filters.meses))
  filters.modalidades.forEach((value) => query.append('modalidade', value))
  filters.alvos.forEach((value) => query.append('alvo', value))
  filters.deslocamentos.forEach((value) => query.append('deslocamento', value))
  filters.cisps.forEach((value) => query.append('cisp', value))
  query.set('sementes', String(filters.sementes))
  query.set('minimo_sementes', String(filters.minimoSementes))
  query.set('criterio', filters.criterio)
  query.set('taxis', filters.taxis)
  if (recorte.groups.motorcyclesOnly) query.set('veiculo', 'MOTO')
  return query
}

/** A lista de grupos com os filtros. */
export const groupsPath = (filters: GroupFilters) =>
  `/api/v1/groups?${params(filters)}`

export const getGroups = (filters: GroupFilters, signal?: AbortSignal) =>
  request<GroupsData>(groupsPath(filters), signal)

/** Os rótulos (G1, G2…) da última lista, pelo caminho dela: o perfil aberto direto pelo link acha o seu sem refazer a lista. */
const labelsByPath = new Map<string, Map<string, string>>()

/** Guarda os rótulos da lista que veio de `path` (um `groupsPath`). */
export function rememberGroupLabels(path: string, data: GroupsData): void {
  labelsByPath.set(
    path,
    new Map(data.groups.map((group) => [group.id, group.label])),
  )
}

export async function groupLabel(
  id: string,
  filters: GroupFilters,
  signal?: AbortSignal,
): Promise<string | null> {
  const path = groupsPath(filters)
  if (!labelsByPath.has(path))
    rememberGroupLabels(path, await getGroups(filters, signal))
  return labelsByPath.get(path)?.get(id) ?? null
}

/** Os filtros e as placas do grupo (`placa` repetido, na ordem do grupo). */
function groupQuery(plates: string[], filters: GroupFilters): URLSearchParams {
  const query = params(filters)
  plates.forEach((plate) => query.append('placa', plate))
  return query
}

export const groupProfilePath = (plates: string[], filters: GroupFilters) =>
  `/api/v1/groups/profile?${groupQuery(plates, filters)}`

export const getGroupProfile = (
  plates: string[],
  filters: GroupFilters,
  signal?: AbortSignal,
) => request<GroupProfileData>(groupProfilePath(plates, filters), signal)

/** O grupo na rota: as placas em ordem, separadas por hífen (`/groups/TTC7J27-TTI2A68`). */
export const platesFromGroupId = (id: string) =>
  id.split('-').filter((plate) => /^[A-Z0-9]{7}$/.test(plate))

export const groupTimelinePath = (plates: string[], filters: GroupFilters) =>
  `/api/v1/groups/timeline?${groupQuery(plates, filters)}`

export const getGroupTimeline = (
  plates: string[],
  filters: GroupFilters,
  signal?: AbortSignal,
) => request<GroupTimelineData>(groupTimelinePath(plates, filters), signal)
