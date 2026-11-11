import { serviceUrl } from '@/modules/vehicle-intelligence/app/base-path'
import { recorteApiPath } from '@/modules/vehicle-intelligence/config/recortes'
import type {
  CorrelatedPlateTimelineData,
  DashboardData,
  DashboardFilters,
  MasterGraphOptions,
  PlateProfileData,
  PlateSearchData,
  RioNeighborhoodGeometry,
} from '@/modules/vehicle-intelligence/types/domain'

/** O erro da API: a mensagem de `detail` (FastAPI) ou o código HTTP. */
export async function responseError(response: Response): Promise<Error> {
  const detail = await response.json().catch(() => null)
  const message =
    typeof detail?.detail === 'string'
      ? detail.detail
      : detail?.detail?.[0]?.msg
  return new Error(message || `Falha ao consultar a API (${response.status})`)
}

/**
 * Respostas recentes (5 min), com teto de quantidade e de tamanho (o JSON recebido): algumas passam de 10 MB, e parsed
 * ocupam umas 3 vezes isso. A mais nova sempre fica.
 */
const CACHE_TTL_MS = 300_000
const CACHE_MAX_ENTRIES = 24
const CACHE_MAX_CHARS = 40_000_000
const responseCache = new Map<
  string,
  { expires: number; data: unknown; size: number }
>()
let cachedChars = 0

function forget(key: string): void {
  const entry = responseCache.get(key)
  if (!entry) return
  cachedChars -= entry.size
  responseCache.delete(key)
}

function remember(key: string, data: unknown, size: number): void {
  forget(key)
  const now = Date.now()
  for (const [other, entry] of responseCache)
    if (entry.expires <= now) forget(other)
  responseCache.set(key, { expires: now + CACHE_TTL_MS, data, size })
  cachedChars += size
  for (const oldest of responseCache.keys()) {
    if (
      oldest === key ||
      (responseCache.size <= CACHE_MAX_ENTRIES &&
        cachedChars <= CACHE_MAX_CHARS)
    )
      break
    forget(oldest)
  }
}
type PendingResponse = {
  promise: Promise<unknown>
  controller: AbortController
  consumers: number
  finished: boolean
  abandonTimer?: number
}
const pendingResponses = new Map<string, PendingResponse>()

export function cachedResponse<T>(path: string): T | null {
  const cached = responseCache.get(recorteApiPath(path))
  return cached && cached.expires > Date.now() ? (cached.data as T) : null
}

export async function request<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted()
  const cacheKey = recorteApiPath(path)
  const cached = responseCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data as T
  let pending = pendingResponses.get(cacheKey)
  if (!pending || pending.controller.signal.aborted) {
    const controller = new AbortController()
    let timedOut = false
    const timeout = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 120_000)
    const entry: PendingResponse = {
      promise: Promise.resolve(),
      controller,
      consumers: 0,
      finished: false,
    }
    entry.promise = (async () => {
      try {
        const response = await fetch(cacheKey, { signal: controller.signal })
        if (!response.ok) throw await responseError(response)
        const text = await response.text()
        const data = JSON.parse(text)
        remember(cacheKey, data, text.length)
        return data
      } catch (reason) {
        if (timedOut) {
          throw new Error(
            'A consulta ultrapassou 2 minutos. Tente novamente ou reduza o recorte.',
            { cause: reason },
          )
        }
        throw reason
      } finally {
        entry.finished = true
        window.clearTimeout(timeout)
        window.clearTimeout(entry.abandonTimer)
        if (pendingResponses.get(cacheKey) === entry)
          pendingResponses.delete(cacheKey)
      }
    })()
    pendingResponses.set(cacheKey, entry)
    pending = entry
  }
  const entry = pending
  window.clearTimeout(entry.abandonTimer)
  entry.consumers += 1
  const release = () => {
    entry.consumers -= 1
    if (!entry.finished && entry.consumers === 0) {
      // Uma volta imediata à aba reutiliza a requisição. Filtros abandonados
      // cancelam o fetch e permitem à API interromper o cálculo obsoleto.
      entry.abandonTimer = window.setTimeout(() => {
        if (!entry.finished && entry.consumers === 0) {
          entry.controller.abort(
            new DOMException('Consulta substituída', 'AbortError'),
          )
        }
      }, 500)
    }
  }
  if (!signal) return entry.promise.finally(release) as Promise<T>
  return new Promise<T>((resolve, reject) => {
    let settled = false
    const finish = () => {
      if (settled) return false
      settled = true
      signal.removeEventListener('abort', onAbort)
      release()
      return true
    }
    const onAbort = () => {
      if (finish())
        reject(
          signal.reason ?? new DOMException('Consulta cancelada', 'AbortError'),
        )
    }
    signal.addEventListener('abort', onAbort, { once: true })
    if (signal.aborted) onAbort()
    entry.promise.then(
      (data) => {
        if (finish()) resolve(data as T)
      },
      (reason) => {
        if (finish()) reject(reason)
      },
    )
  })
}

/** Panorama do recorte, com cada filtro repetido na ordem da API. */
export function dashboardPath(filters: DashboardFilters): string {
  const params = new URLSearchParams()
  filters.modalidades.forEach((item) => params.append('modalidade', item))
  filters.alvos.forEach((item) => params.append('alvo', item))
  filters.deslocamentos.forEach((item) => params.append('deslocamento', item))
  filters.cisps.forEach((item) => params.append('cisp', item))
  return `/api/v1/dashboard?${params.toString()}`
}
export const getDashboard = (filters: DashboardFilters, signal?: AbortSignal) =>
  request<DashboardData>(dashboardPath(filters), signal)

/** As opções dos filtros de fato publicadas pela base (período, modalidades, alvos, CISPs). */
export const MASTER_GRAPH_OPTIONS_PATH = '/api/v1/master-graph/options'
export const getMasterGraphOptions = (signal?: AbortSignal) =>
  request<MasterGraphOptions>(MASTER_GRAPH_OPTIONS_PATH, signal)
/** `scope` é a query do recorte global; nulo traz todos os fatos da placa. */
const plateCasesPath = (plate: string, scope?: string | null) =>
  `/api/v1/master-graph/pre-event/cases/${encodeURIComponent(plate)}${scope ? `?${scope}` : ''}`
export const plateCorrelationsPath = (plate: string, scope?: string | null) =>
  `/api/v1/master-graph/pre-event/correlations/${encodeURIComponent(plate)}${scope ? `?${scope}` : ''}`
export const getCorrelatedPlateTimeline = (
  plate: string,
  scope: string | null,
  signal?: AbortSignal,
) => request<CorrelatedPlateTimelineData>(plateCasesPath(plate, scope), signal)
/** O perfil de circulação da placa (aba Tendências). */
export const plateProfilePath = (plate: string) =>
  `/api/v1/master-graph/pre-event/profile/${encodeURIComponent(plate)}`
export const getPlateProfile = (plate: string, signal?: AbortSignal) =>
  request<PlateProfileData>(plateProfilePath(plate), signal)
export const plateCitationsPath = (plate: string, scope?: string | null) =>
  `/api/v1/master-graph/pre-event/citations/${encodeURIComponent(plate)}${scope ? `?${scope}` : ''}`
/** As denúncias do Disque Denúncia que citam a placa (iguais em qualquer recorte). */
export const plateDenunciasPath = (plate: string) =>
  `/api/placas/${encodeURIComponent(plate)}/denuncias`
export const getRioNeighborhoodGeometry = (signal?: AbortSignal) =>
  request<RioNeighborhoodGeometry>('/data/bairros_rio.geojson', signal)
/** Busca nos três recortes: a placa exata ou um padrão com `-` no lugar de cada caractere que pode variar. */
export const searchPlates = (pattern: string, signal?: AbortSignal) =>
  request<PlateSearchData>(
    `/api/placas/busca?q=${encodeURIComponent(pattern)}`,
    signal,
  )

/** Mapa-base CARTO servido pelo backend, que acrescenta a chave (sem marca d'água). */
export const tileUrl = (style: 'voyager' | 'dark_all' | 'light_all') =>
  serviceUrl(`/tiles/${style}/{z}/{x}/{y}.png`)
