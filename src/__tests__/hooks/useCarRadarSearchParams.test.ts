import { renderHook } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'

import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>

describe('useCarRadarSearchParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockSearchParams = (
    params: Record<string, string | string[]>,
  ) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v))
      } else {
        searchParams.set(key, value)
      }
    })

    // Converter para ReadonlyURLSearchParams simulando o comportamento do Next.js
    return {
      get: (name: string) => searchParams.get(name),
      getAll: (name: string) => searchParams.getAll(name),
      has: (name: string) => searchParams.has(name),
      entries: () => searchParams.entries(),
      keys: () => searchParams.keys(),
      values: () => searchParams.values(),
      forEach: (callback: (value: string, key: string, parent: any) => void) =>
        searchParams.forEach(callback),
      toString: () => searchParams.toString(),
      size: searchParams.size,
    } as any
  }

  describe('parâmetros válidos', () => {
    it('deve retornar parâmetros formatados corretamente', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
        plate: 'ABC1234',
        radarIds: ['RADAR001', 'RADAR002'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toEqual({
        plate: 'ABC1234',
        date: {
          from: '2024-01-15T10:00:00.000Z',
          to: '2024-01-15T12:00:00.000Z',
        },
        radarIds: ['RADAR001', 'RADAR002'],
      })

      expect(result.current.queryKey).toEqual([
        'cars',
        'radar',
        result.current.formattedSearchParams,
      ])
    })

    it('deve funcionar sem placa (opcional)', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams?.plate).toBeUndefined()
      expect(result.current.formattedSearchParams?.radarIds).toEqual([
        'RADAR001',
      ])
    })

    it('deve funcionar com placa vazia', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
        plate: '',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams?.plate).toBeUndefined()
    })
  })

  describe('parâmetros inválidos', () => {
    it('deve retornar null quando startDate está faltando', () => {
      const mockParams = createMockSearchParams({
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('deve retornar null quando endDate está faltando', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('deve retornar null quando radarIds está vazio', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: [],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('deve retornar null quando radarIds não existe', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('deve retornar null quando as datas são inválidas', () => {
      const mockParams = createMockSearchParams({
        startDate: 'invalid-date',
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('deve retornar null quando o intervalo excede 5 horas', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T16:00:00.000Z', // 6 horas depois
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })
  })

  describe('URLSearchParams', () => {
    it('deve retornar os searchParams originais', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.searchParams).toBe(mockParams)
    })
  })
})
