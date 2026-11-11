import { useMemo } from 'react'

import {
  copassagem,
  recorte,
  recorteAtual,
  type RecorteId,
} from '@/modules/vehicle-intelligence/config/recortes'
import { createStore } from '@/modules/vehicle-intelligence/lib/store'
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
const DEFAULT_SCOPES: Record<
  RecorteId,
  Pick<EventScope, 'deslocamentos' | 'eventWindow'>
> = {
  transeuntes: { deslocamentos: ['MOTO'], eventWindow: 10 },
  veiculos: { deslocamentos: [], eventWindow: 30 },
  carga: { deslocamentos: [], eventWindow: 30 },
  // Sem relato não há autor anotado: começa sem o filtro de moto.
  transeuntes_cidade: { deslocamentos: [], eventWindow: 10 },
}
/** O padrão: as duas modalidades do recorte e as janelas e o autor de cada um. */
export const DEFAULT_EVENT_SCOPE: EventScope = {
  ...COMMON_DEFAULTS,
  modalidades: [...recorte.modalities],
  ...DEFAULT_SCOPES[recorteAtual],
}

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

const STORAGE_KEY = 'event-scope:v2'
type StoredScope = { scope: EventScope; applyToPlates: boolean }

const scopeStore = createStore<StoredScope>(
  { scope: DEFAULT_EVENT_SCOPE, applyToPlates: true },
  {
    storageKey: STORAGE_KEY,
    restore: (saved, initial) => {
      const stored = saved as Partial<StoredScope>
      if (!stored.scope) return initial
      return {
        applyToPlates: Boolean(stored.applyToPlates),
        scope: boundedScope({ ...DEFAULT_EVENT_SCOPE, ...stored.scope }),
      }
    },
  },
)

export function setScope(update: Partial<EventScope>): void {
  scopeStore.set((current) => ({
    ...current,
    scope: boundedScope({ ...current.scope, ...update }),
  }))
}

/** Perfil e timeline: aplicar o recorte ou mostrar todos os fatos da placa ("Ver todos os fatos"). */
export function setApplyToPlates(applyToPlates: boolean): void {
  scopeStore.set((current) => ({ ...current, applyToPlates }))
}

/** O recorte dos fatos e se ele vale para as placas, com as duas ações. */
export function useEventScope() {
  return { ...scopeStore.use(), setScope, setApplyToPlates }
}

/** Recorte que o perfil, a timeline e o relatório da placa pedem: o da barra ou, em "Ver todos os fatos", só a janela. */
export function usePlateScopeQuery(): string {
  const { scope, applyToPlates } = scopeStore.use()
  return useMemo(
    () => (applyToPlates ? scopeParams(scope) : windowParams(scope)).toString(),
    [applyToPlates, scope],
  )
}
