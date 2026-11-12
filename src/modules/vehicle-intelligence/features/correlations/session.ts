import { recorteStorageKey } from '@/modules/vehicle-intelligence/config/recortes'
import {
  DEFAULT_PLATE_FILTERS,
  type PlateFilters,
} from '@/modules/vehicle-intelligence/features/correlations/query'
import type {
  MasterGraphOptions,
  MasterPreData,
} from '@/modules/vehicle-intelligence/types/domain'

const VIEW_KEY = 'correlation-view:v5'
const GRAPH_KEY = 'correlation-graph:v4'

/** Estado da tela restaurado ao voltar a ela; o recorte de fatos fica no seu próprio store. */
export type CorrelationSession = {
  plates: PlateFilters
  selectedPlates: string[]
  scrollY: number
}

export type GraphLayoutState = {
  fingerprint: string
  positions: Record<string, { x: number; y: number }>
  basePositions?: Record<string, { x: number; y: number }>
  view: { position: { x: number; y: number }; scale: number }
}

function read<T>(key: string): T | null {
  try {
    const value = window.sessionStorage.getItem(recorteStorageKey(key))
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    window.sessionStorage.setItem(recorteStorageKey(key), JSON.stringify(value))
  } catch {
    /* O armazenamento é opcional. */
  }
}

export function loadCorrelationSession(): CorrelationSession | null {
  const session = read<CorrelationSession>(VIEW_KEY)
  return session?.plates
    ? { ...session, plates: { ...DEFAULT_PLATE_FILTERS, ...session.plates } }
    : null
}

export function saveCorrelationSession(session: CorrelationSession): void {
  write(VIEW_KEY, session)
}

// Respostas recentes em memória: voltar à tela não refaz a consulta do grafo. Poucas: cada uma tem alguns MB e fica
// também no cache de `request()`.
const MAX_GRAPH_RESPONSES = 3
const graphResponses = new Map<string, MasterPreData>()
let graphOptions: MasterGraphOptions | null = null

export const cachedGraph = (key: string) => graphResponses.get(key) ?? null
export const cachedOptions = () => graphOptions
export function rememberOptions(options: MasterGraphOptions): void {
  graphOptions = options
}
export function rememberGraph(key: string, data: MasterPreData): void {
  graphResponses.delete(key)
  graphResponses.set(key, data)
  if (graphResponses.size > MAX_GRAPH_RESPONSES)
    graphResponses.delete(graphResponses.keys().next().value!)
}

const layouts = new Map<string, GraphLayoutState>()

export function loadGraphLayout(fingerprint: string): GraphLayoutState | null {
  const state =
    layouts.get(fingerprint) ??
    read<GraphLayoutState>(`${GRAPH_KEY}:${fingerprint}`)
  return state?.fingerprint === fingerprint ? state : null
}

export function saveGraphLayout(state: GraphLayoutState): void {
  layouts.set(state.fingerprint, state)
  write(`${GRAPH_KEY}:${state.fingerprint}`, state)
  const index = [
    ...(read<string[]>(`${GRAPH_KEY}:index`) ?? []).filter(
      (key) => key !== state.fingerprint,
    ),
    state.fingerprint,
  ]
  while (index.length > 8) {
    const oldest = index.shift()!
    layouts.delete(oldest)
    try {
      window.sessionStorage.removeItem(
        recorteStorageKey(`${GRAPH_KEY}:${oldest}`),
      )
    } catch {
      /* Opcional. */
    }
  }
  write(`${GRAPH_KEY}:index`, index)
}
