/**
 * Navegação do painel pelo histórico do navegador (as rotas cabem em `routes.ts`). Dentro do civitas-app a rota vem
 * do Next (`usePathname`): os links do sidebar do CIVITAS e o `pushState` daqui (que o Next acompanha) atualizam a
 * mesma rota, e o módulo vive em `/inteligencia-veicular` (`base-path.ts`).
 *
 * O estado de cada entrada do histórico guarda como voltar: o perfil sabe de onde foi aberto (`profileOrigin`) e
 * quantas trocas de análise fez (`profileDepth`), para "Voltar" sair do perfil de uma vez; a timeline sabe se tem para
 * onde voltar (`timelineReturn`); o grupo leva o rótulo da página de grupos (G3).
 */
import { usePathname } from 'next/navigation'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import {
  toAppPath,
  toRoutePath,
} from '@/modules/vehicle-intelligence/app/base-path'
import {
  type ModuleId,
  MODULES,
} from '@/modules/vehicle-intelligence/app/modules'
import {
  groupPath,
  groupProfilePath,
  groupTimelinePath,
  modulePath,
  normalizePath,
  occurrencePath,
  parseRoute,
  platePath,
  plateTimelinePath,
  territoryPath,
} from '@/modules/vehicle-intelligence/app/routes'
import {
  recorteAtual,
  type RecorteId,
} from '@/modules/vehicle-intelligence/config/recortes'
import { setApplyToPlates } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  OpenPlateOptions,
  PlateProfileAnalysis,
} from '@/modules/vehicle-intelligence/types/navigation'

type HistoryState = {
  profileOrigin?: string
  profileDepth?: number
  timelineReturn?: string
  /** Rótulo do grupo (G3) ao abrir o perfil a partir da página de grupos. */
  groupLabel?: string
  /** De onde o perfil do RO foi aberto: "Voltar" volta para lá. */
  occurrenceOrigin?: string
}

/** O caminho atual, normalizado (a chave da rolagem e a origem do perfil). */
export const currentPath = () =>
  normalizePath(toRoutePath(window.location.pathname))

const HISTORY_STATE_KEYS = [
  'profileOrigin',
  'profileDepth',
  'timelineReturn',
  'groupLabel',
  'occurrenceOrigin',
] as const satisfies readonly (keyof HistoryState)[]

/**
 * Só as chaves do módulo. O estado do histórico também guarda as do Next (`__NA`, a árvore do router); copiá-las para
 * um `pushState` faz o Next tratar a entrada como navegação dele e não atualizar a rota (`usePathname`).
 */
export function pickHistoryState(state: unknown): HistoryState {
  const source = (state && typeof state === 'object' ? state : {}) as Record<
    string,
    unknown
  >
  const picked: Record<string, unknown> = {}
  for (const key of HISTORY_STATE_KEYS)
    if (source[key] !== undefined) picked[key] = source[key]
  return picked as HistoryState
}

const historyState = () => pickHistoryState(window.history.state)

/**
 * Troca de recorte recarregando a página. A placa aberta continua aberta no outro recorte (nas correlações); as
 * telas que existem igual nos dois (`keepsOnRecorteSwitch`) também; as demais voltam à visão geral.
 */
export function switchRecorte(target: RecorteId): void {
  if (target === recorteAtual) return
  const route = parseRoute(window.location.pathname)
  const path = route.plate
    ? platePath(route.plate.plate, 'correlations')
    : (MODULES.find(
        (module) => module.id === route.module && module.keepsOnRecorteSwitch,
      )?.path ?? '/')
  window.location.assign(`${path}?recorte=${target}`)
}

/** A rota atual e as ações de navegação do app. */
export function useAppNavigation() {
  const pathname = usePathname()
  const route = useMemo(() => parseRoute(toRoutePath(pathname)), [pathname])

  /** Vai para o caminho mantendo a query (`?recorte=`); o Next acompanha o `pushState` e atualiza a rota. */
  const open = useCallback((path: string, state: HistoryState = {}) => {
    const target = normalizePath(path)
    if (currentPath() !== target)
      window.history.pushState(
        pickHistoryState(state),
        '',
        `${toAppPath(target)}${window.location.search}`,
      )
  }, [])

  const actions = useMemo(
    () => ({
      navigate: (module: ModuleId) => open(modulePath(module)),
      /**
       * O perfil da placa, aberto de qualquer tela: "Voltar" volta para onde estava. `allFacts` abre com "Ver todos os
       * fatos" (a busca de placas).
       */
      openPlate: (
        plate: string,
        { analysis = 'correlations', allFacts = false }: OpenPlateOptions = {},
      ) => {
        if (allFacts) setApplyToPlates(false)
        open(platePath(plate, analysis), {
          profileOrigin: currentPath(),
          profileDepth: 1,
        })
      },
      /** Trocar de análise no perfil empilha uma entrada; "Voltar" desfaz todas de uma vez. */
      changePlateAnalysis: (plate: string, analysis: PlateProfileAnalysis) => {
        const state = historyState()
        open(platePath(plate, analysis), {
          profileOrigin: state.profileOrigin || '/profile',
          profileDepth: (state.profileDepth || 0) + 1,
        })
      },
      openPlateTimeline: (
        plate: string,
        analysis: PlateProfileAnalysis,
        day: string | null,
      ) =>
        open(plateTimelinePath(plate, analysis, day), {
          ...historyState(),
          timelineReturn: currentPath(),
        }),
      backFromProfile: () => {
        const state = historyState()
        if (state.profileDepth && state.profileDepth > 0)
          window.history.go(-state.profileDepth)
        else open(state.profileOrigin || '/profile')
      },
      backFromPlateTimeline: (
        plate: string,
        analysis: PlateProfileAnalysis,
      ) => {
        if (historyState().timelineReturn) window.history.back()
        else open(platePath(plate, analysis))
      },
      openGroups: () => open(modulePath('groups')),
      openGroup: (plates: string[], label: string) =>
        open(groupPath(plates), { groupLabel: label }),
      openGroupTimeline: (id: string, day: string | null) =>
        open(groupTimelinePath(id, day), {
          groupLabel: historyState().groupLabel,
          timelineReturn: currentPath(),
        }),
      backFromGroupTimeline: (id: string) => {
        const state = historyState()
        if (state.timelineReturn) window.history.back()
        else open(groupProfilePath(id), { groupLabel: state.groupLabel })
      },
      openTerritories: () => open(modulePath('territories')),
      openTerritory: (complex: string) => open(territoryPath(complex)),
      /** O perfil do RO (ou a lista dos ROs de uma placa vítima), aberto de qualquer tela. */
      openOccurrence: (key: string) =>
        open(occurrencePath(key), { occurrenceOrigin: currentPath() }),
      backFromOccurrence: () => {
        if (historyState().occurrenceOrigin) window.history.back()
        else open(modulePath('occurrence'))
      },
    }),
    [open],
  )

  return { route, ...actions }
}

export type AppNavigation = ReturnType<typeof useAppNavigation>

/** O rótulo do grupo guardado na entrada do histórico (G3), quando o grupo veio da página de grupos. */
export const groupLabelFromHistory = () => historyState().groupLabel ?? null

/** Cada caminho volta à rolagem em que foi deixado. */
export function useScrollRestoration(routeKey: string) {
  const positions = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    const restore = window.requestAnimationFrame(() =>
      window.scrollTo(0, positions.current.get(routeKey) ?? 0),
    )
    const save = () => positions.current.set(routeKey, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.cancelAnimationFrame(restore)
      window.removeEventListener('scroll', save)
    }
  }, [routeKey])
}
