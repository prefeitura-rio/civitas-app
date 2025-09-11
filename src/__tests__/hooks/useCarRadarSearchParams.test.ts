import { renderHook } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'

import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'

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

    return searchParams as any
  }

  describe('valid parameters', () => {
    it('should return correctly formatted parameters', () => {
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

    it('should work without plate (optional)', () => {
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

    it('should work with empty plate', () => {
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

  describe('invalid parameters', () => {
    it('should return null when startDate is missing', () => {
      const mockParams = createMockSearchParams({
        endDate: '2024-01-15T12:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('should return null when endDate is missing', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('should return null when radarIds is empty', () => {
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

    it('should return null when radarIds does not exist', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T12:00:00.000Z',
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })

    it('should return null when dates are invalid', () => {
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

    it('should return null when interval exceeds 5 hours', () => {
      const mockParams = createMockSearchParams({
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T16:00:00.000Z',
        radarIds: ['RADAR001'],
      })

      mockUseSearchParams.mockReturnValue(mockParams)

      const { result } = renderHook(() => useCarRadarSearchParams())

      expect(result.current.formattedSearchParams).toBeNull()
      expect(result.current.queryKey).toEqual(['cars', 'radar', null])
    })
  })

  describe('URLSearchParams', () => {
    it('should return original searchParams', () => {
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
