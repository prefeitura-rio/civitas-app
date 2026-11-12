import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  copassagem,
  recorteAtual,
  type RecorteId,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import type { CrimeType } from '@/modules/vehicle-intelligence/types/domain'

/**
 * Recorte dos fatos que vale em todas as telas de investigação: grafo,
 * ranking, perfil e timeline. Os filtros de placa (tipo de veículo, táxi,
 * mínimos) continuam locais ao grafo.
 */
export interface EventScope {
  modalidades: CrimeType[]
  alvos: string[]
  cisps: string[]
  eventWindow: number
  /** Últimos meses até o fato mais recente (nulo é tudo). */
  months: number | null
  /** Entorno do fato: deslocamento do autor (anotado na dinâmica) e raio do equipamento. */
  deslocamentos: string[]
  radius: number
  /** Copassagem: janela entre passagens, distância do radar ao fato (0 é qualquer) e só roubo de carga. */
  passageWindow: number
  maxFactDistance: number
  somenteCarga: boolean
}

const COMMON_DEFAULTS: Omit<
  EventScope,
  'modalidades' | 'deslocamentos' | 'eventWindow'
> = {
  alvos: [],
  cisps: [],
  radius: 1000,
  months: null,
  passageWindow: 10,
  maxFactDistance: 0,
  somenteCarga: false,
}
/** Transeuntes começa pelos fatos com autor de moto: só eles deixam placa a procurar no Cerco. */
const DEFAULT_SCOPES: Record<RecorteId, EventScope> = {
  transeuntes: {
    ...COMMON_DEFAULTS,
    modalidades: ['ROUBO', 'FURTO'],
    deslocamentos: ['MOTO'],
    eventWindow: 10,
  },
  veiculos: {
    ...COMMON_DEFAULTS,
    modalidades: ['ROUBO', 'FURTO'],
    deslocamentos: [],
    eventWindow: 30,
  },
  carga: {
    ...COMMON_DEFAULTS,
    modalidades: ['CARGA_VEICULO', 'CARGA'],
    deslocamentos: [],
    eventWindow: 30,
  },
}
export const DEFAULT_EVENT_SCOPE = DEFAULT_SCOPES[recorteAtual]

/** Janelas e raios que a interface oferece; a base publica um subconjunto em `/options`. */
export const SCOPE_LIMITS = copassagem
  ? {
      eventWindows: [10, 20, 30, 60],
      radii: [] as number[],
      passageWindows: [3, 5, 10, 20],
    }
  : {
      eventWindows: [10, 20, 30],
      radii: [300, 600, 1000],
      passageWindows: [] as number[],
    }

/** Valores oferecidos: os publicados pela base dentro dos limites da interface. */
export function allowed(
  published: number[] | undefined,
  limits: number[],
): number[] {
  return (published?.length ? published : limits)
    .filter((value) => limits.includes(value))
    .sort((a, b) => a - b)
}

function bounded(value: number, choices: number[], fallback: number): number {
  if (!choices.length) return value
  return Number.isFinite(value)
    ? (choices.filter((choice) => choice <= value).at(-1) ?? fallback)
    : fallback
}

function boundedScope(scope: EventScope): EventScope {
  return {
    ...scope,
    eventWindow: bounded(
      scope.eventWindow,
      SCOPE_LIMITS.eventWindows,
      DEFAULT_EVENT_SCOPE.eventWindow,
    ),
    radius: bounded(
      scope.radius,
      SCOPE_LIMITS.radii,
      DEFAULT_EVENT_SCOPE.radius,
    ),
    passageWindow: bounded(
      scope.passageWindow,
      SCOPE_LIMITS.passageWindows,
      DEFAULT_EVENT_SCOPE.passageWindow,
    ),
  }
}

/** Filtros de fato na nomenclatura da API do motor do recorte. */
export function scopeParams(scope: EventScope): URLSearchParams {
  const params = new URLSearchParams()
  scope.modalidades.forEach((item) => params.append('modalidade', item))
  scope.alvos.forEach((item) => params.append('alvo', item))
  scope.cisps.forEach((item) => params.append('cisp', item))
  params.set('janela_evento', String(scope.eventWindow))
  if (scope.months) params.set('meses', String(scope.months))
  if (copassagem) {
    params.set('janela_correlacao', String(scope.passageWindow))
    if (scope.maxFactDistance > 0)
      params.set('distancia_fato_metros', String(scope.maxFactDistance))
    if (scope.somenteCarga) params.set('somente_carga', 'true')
  } else {
    scope.deslocamentos.forEach((item) => params.append('deslocamento', item))
    params.set('raio_metros', String(scope.radius))
  }
  return params
}

/**
 * "Ver todos os fatos" do perfil: só a janela da barra (e o raio ou a janela entre passagens), sem os filtros de fato
 * (modalidade, alvo, CISP, autor, período). Antes a API usava a maior janela oferecida (±30 min em transeuntes),
 * enquanto a barra mostrava ±10; desde 20/10 a janela é sempre a da barra.
 */
export function windowParams(scope: EventScope): URLSearchParams {
  const params = new URLSearchParams()
  params.set('janela_evento', String(scope.eventWindow))
  if (copassagem) params.set('janela_correlacao', String(scope.passageWindow))
  else params.set('raio_metros', String(scope.radius))
  return params
}

/**
 * Perfil aberto pela busca de placas em outro recorte (`?fatos=todos`): a busca
 * olha o grafo inteiro, então o perfil chega com "Ver todos os fatos". O
 * parâmetro sai da URL logo na carga, para não seguir nas navegações.
 */
const OPENED_WITH_ALL_FACTS = (() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('fatos') !== 'todos') return false
  params.delete('fatos')
  const query = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )
  return true
})()

const STORAGE_KEY = 'event-scope:v2'
type StoredScope = { scope: EventScope; applyToPlates: boolean }

function initialScope(): StoredScope {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(recorteStorageKey(STORAGE_KEY)) ?? 'null',
    ) as StoredScope | null
    if (stored?.scope) {
      return {
        applyToPlates: stored.applyToPlates && !OPENED_WITH_ALL_FACTS,
        scope: boundedScope({ ...DEFAULT_EVENT_SCOPE, ...stored.scope }),
      }
    }
  } catch {
    /* O armazenamento da sessão é opcional. */
  }
  return { scope: DEFAULT_EVENT_SCOPE, applyToPlates: !OPENED_WITH_ALL_FACTS }
}

type EventScopeContextValue = StoredScope & {
  setScope: (update: Partial<EventScope>) => void
  /** Perfil e timeline: aplicar o recorte ou mostrar todos os fatos da placa. */
  setApplyToPlates: (value: boolean) => void
}

const EventScopeContext = createContext<EventScopeContextValue | null>(null)

export function EventScopeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredScope>(initialScope)
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        recorteStorageKey(STORAGE_KEY),
        JSON.stringify(state),
      )
    } catch {
      /* Opcional. */
    }
  }, [state])
  const setScope = useCallback((update: Partial<EventScope>) => {
    setState((current) => ({
      ...current,
      scope: boundedScope({ ...current.scope, ...update }),
    }))
  }, [])
  const setApplyToPlates = useCallback(
    (applyToPlates: boolean) =>
      setState((current) => ({ ...current, applyToPlates })),
    [],
  )
  const value = useMemo(
    () => ({ ...state, setScope, setApplyToPlates }),
    [setApplyToPlates, setScope, state],
  )
  return (
    <EventScopeContext.Provider value={value}>
      {children}
    </EventScopeContext.Provider>
  )
}

export function useEventScope(): EventScopeContextValue {
  const context = useContext(EventScopeContext)
  if (!context) throw new Error('useEventScope precisa de EventScopeProvider')
  return context
}

/** Recorte que o perfil, a timeline e o relatório da placa pedem: o da barra ou, em "Ver todos os fatos", só a janela. */
export function usePlateScopeQuery(): string {
  const { scope, applyToPlates } = useEventScope()
  return useMemo(
    () => (applyToPlates ? scopeParams(scope) : windowParams(scope)).toString(),
    [applyToPlates, scope],
  )
}
