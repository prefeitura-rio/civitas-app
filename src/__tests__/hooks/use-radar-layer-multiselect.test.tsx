import { act, renderHook } from '@testing-library/react'

import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

// Mock do store
jest.mock('@/stores/use-map-store')

// Mock dos radares
jest.mock('@/hooks/useQueries/useRadars', () => ({
  useRadars: () => ({
    data: [
      {
        cetRioCode: '0540461121',
        location: 'ESTRADA DOS BANDEIRANTES',
        district: 'centro',
        latitude: -22.9068,
        longitude: -43.1729,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461122',
        location: 'AVENIDA BRASIL',
        district: 'zona norte',
        latitude: -22.9069,
        longitude: -43.173,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461123',
        location: 'COPACABANA',
        district: 'zona sul',
        latitude: -22.907,
        longitude: -43.1731,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461124',
        location: 'TIJUCA',
        district: 'zona norte',
        latitude: -22.9071,
        longitude: -43.1732,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461125',
        location: 'BARRA DA TIJUCA',
        district: 'zona oeste',
        latitude: -22.9072,
        longitude: -43.1733,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
    ] as Radar[],
  }),
}))

describe('useRadarLayer - Multi-selection bug', () => {
  let mockSetMultipleSelectedRadars: jest.Mock
  let mockMultipleSelectedRadars: string[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetMultipleSelectedRadars = jest.fn()
    mockMultipleSelectedRadars = []
    ;(useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('setMultipleSelectedRadars')) {
        return mockSetMultipleSelectedRadars
      }
      return mockMultipleSelectedRadars
    })
  })

  it('should reproduce bug: select 4+ radars, deselect some, reselect', () => {
    const { result, rerender } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    // Passo 1: Selecionar 4 radares
    const radars = [
      { cetRioCode: '0540461121' } as Radar,
      { cetRioCode: '0540461122' } as Radar,
      { cetRioCode: '0540461123' } as Radar,
      { cetRioCode: '0540461124' } as Radar,
    ]

    console.log('🧪 Teste: Selecionando 4 radares iniciais')

    // Simular seleção dos 4 radares
    act(() => {
      radars.forEach((radar) => {
        result.current.handleMultiSelectObject(radar)
      })
    })

    // Verificar chamadas para o store - agora são funções de atualização
    expect(mockSetMultipleSelectedRadars).toHaveBeenCalledTimes(4)

    // Verificar se as funções de atualização funcionam corretamente
    const calls = mockSetMultipleSelectedRadars.mock.calls
    let currentState: string[] = []

    calls.forEach((call) => {
      const [updaterFn] = call
      if (typeof updaterFn === 'function') {
        currentState = updaterFn(currentState)
      }
    })

    expect(currentState).toEqual([
      '0540461124',
      '0540461123',
      '0540461122',
      '0540461121',
    ])

    // Passo 2: Simular que os radares estão selecionados no store
    mockMultipleSelectedRadars = [
      '0540461124',
      '0540461123',
      '0540461122',
      '0540461121',
    ]
    rerender()

    console.log('🧪 Teste: Dessselecionando radar 0540461122')

    // Passo 3: Dessselecionar um radar (0540461122)
    act(() => {
      result.current.handleMultiSelectObject({
        cetRioCode: '0540461122',
      } as Radar)
    })

    // Passo 4: Simular estado após remoção
    mockMultipleSelectedRadars = ['0540461124', '0540461123', '0540461121']
    rerender()

    console.log('🧪 Teste: Resselecionando radar 0540461125 (novo)')

    // Passo 5: Selecionar um radar diferente (0540461125)
    act(() => {
      result.current.handleMultiSelectObject({
        cetRioCode: '0540461125',
      } as Radar)
    })

    // Verificar que houve 6 chamadas no total (4 iniciais + 1 remoção + 1 adição)
    expect(mockSetMultipleSelectedRadars).toHaveBeenCalledTimes(6)

    console.log('🧪 Teste concluído - verificando se não há seleções espúrias')
  })

  it('should verify if selectedObjects is calculated correctly', () => {
    // Simular alguns radares já selecionados
    mockMultipleSelectedRadars = ['0540461121', '0540461123']

    const { result } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    // Verificar se selectedObjects tem exatamente os radares esperados
    expect(result.current.selectedObjects).toHaveLength(2)
    expect(result.current.selectedObjects.map((r) => r.cetRioCode)).toEqual([
      '0540461121',
      '0540461123',
    ])
  })

  it('should verify if state does not change when it should not', () => {
    mockMultipleSelectedRadars = ['0540461121', '0540461122']

    const { result, rerender } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    const initialSelectedObjects = result.current.selectedObjects

    // Re-renderizar sem mudanças no estado
    rerender()

    // Verificar se os objetos têm os mesmos dados (conteúdo igual)
    expect(result.current.selectedObjects).toStrictEqual(initialSelectedObjects)
  })
})
