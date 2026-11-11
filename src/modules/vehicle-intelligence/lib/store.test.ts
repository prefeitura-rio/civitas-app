import { act, renderHook } from '@testing-library/react'

import {
  createLazyStore,
  createStore,
} from '@/modules/vehicle-intelligence/lib/store'

beforeEach(() => window.sessionStorage.clear())

describe('createStore', () => {
  it('avisa quem lê e aceita valor ou função', () => {
    const store = createStore({ months: 3 })
    const { result } = renderHook(() => store.use())
    act(() => store.set({ months: 6 }))
    expect(result.current).toEqual({ months: 6 })
    act(() => store.set((current) => ({ months: current.months + 1 })))
    expect(result.current).toEqual({ months: 7 })
  })

  it('guarda na sessão e completa o valor guardado com o inicial', () => {
    createStore(
      { months: 3, cisps: [] as string[] },
      { storageKey: 'teste' },
    ).set({ months: 6, cisps: ['014'] })
    window.sessionStorage.setItem('teste', JSON.stringify({ months: 6 }))
    const store = createStore(
      { months: 3, cisps: [] as string[], extra: true },
      { storageKey: 'teste' },
    )
    expect(store.get()).toEqual({ months: 6, cisps: [], extra: true })
  })

  it('ignora uma sessão ilegível', () => {
    window.sessionStorage.setItem('teste', '{quebrado')
    expect(createStore({ months: 3 }, { storageKey: 'teste' }).get()).toEqual({
      months: 3,
    })
  })
})

describe('createLazyStore', () => {
  it('carrega uma vez, na primeira leitura', async () => {
    const load = jest.fn(async () => ['ABC1D23'])
    const store = createLazyStore<string[]>([], load)
    expect(load).not.toHaveBeenCalled()
    const first = renderHook(() => store.use())
    renderHook(() => store.use())
    expect(first.result.current).toEqual([])
    await act(async () => undefined)
    expect(first.result.current).toEqual(['ABC1D23'])
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('fica com o valor inicial se a carga falhar', async () => {
    const store = createLazyStore<string[]>([], async () => {
      throw new Error('sem rede')
    })
    const { result } = renderHook(() => store.use())
    await act(async () => undefined)
    expect(result.current).toEqual([])
  })
})
