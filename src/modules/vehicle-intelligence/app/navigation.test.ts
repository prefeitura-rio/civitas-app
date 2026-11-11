import { renderHook } from '@testing-library/react'

import {
  pickHistoryState,
  useAppNavigation,
} from '@/modules/vehicle-intelligence/app/navigation'

jest.mock('next/navigation', () => ({
  usePathname: () => window.location.pathname,
}))

/** O estado que o Next grava em cada entrada do histórico (App Router). */
const nextInternals = {
  __NA: true,
  __PRIVATE_NEXTJS_INTERNALS_TREE: ['', {}],
}

describe('pickHistoryState', () => {
  it('mantém só as chaves do módulo', () => {
    expect(
      pickHistoryState({
        ...nextInternals,
        profileOrigin: '/correlation',
        profileDepth: 2,
      }),
    ).toEqual({ profileOrigin: '/correlation', profileDepth: 2 })
  })

  it('aceita estado vazio ou que não é objeto', () => {
    expect(pickHistoryState(null)).toEqual({})
    expect(pickHistoryState('x')).toEqual({})
  })
})

describe('useAppNavigation', () => {
  let pushState: jest.SpyInstance

  beforeEach(() => {
    window.history.replaceState(
      { ...nextInternals, profileOrigin: '/correlation', profileDepth: 1 },
      '',
      '/inteligencia-veicular/profile/ABC1D23/correlations',
    )
    pushState = jest.spyOn(window.history, 'pushState')
  })

  afterEach(() => pushState.mockRestore())

  // Com `__NA` no estado, o pushState do Next não atualiza o `usePathname` e a timeline não abria.
  it('abre a timeline sem copiar o estado interno do Next', () => {
    const { result } = renderHook(() => useAppNavigation())
    result.current.openPlateTimeline('ABC1D23', 'correlations', null)

    expect(pushState).toHaveBeenCalledTimes(1)
    const [state, , url] = pushState.mock.calls[0]
    expect(url).toBe(
      '/inteligencia-veicular/profile/ABC1D23/correlations/timeline',
    )
    expect(state).toEqual({
      profileOrigin: '/correlation',
      profileDepth: 1,
      timelineReturn: '/profile/ABC1D23/correlations',
    })
  })
})
