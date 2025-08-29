import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useRadars } from '@/hooks/useQueries/useRadars'
import { useRadarsSearch } from '@/hooks/useQueries/useRadarsSearch'

// Mock das dependências
jest.mock('@/http/cars/radar/get-cars-by-radar')
jest.mock('@/hooks/useParams/useCarRadarSearchParams')
jest.mock('@/hooks/useQueries/useRadars')

const mockUseCarRadarSearchParams =
  useCarRadarSearchParams as jest.MockedFunction<typeof useCarRadarSearchParams>
const mockUseRadars = useRadars as jest.MockedFunction<typeof useRadars>

describe('useRadarsSearch', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Reset dos mocks
    jest.clearAllMocks()
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockSearchParams = {
    radarIds: ['RADAR001', 'RADAR002'],
    date: {
      from: '2024-01-15T10:00:00.000Z',
      to: '2024-01-15T15:00:00.000Z',
    },
    plate: 'ABC1234',
  }

  it('should handle missing search params', () => {
    mockUseCarRadarSearchParams.mockReturnValue({
      searchParams: new URLSearchParams(),
      formattedSearchParams: null,
      queryKey: ['cars', 'radar', null],
    })

    mockUseRadars.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as any)

    expect(() => {
      renderHook(() => useRadarsSearch(), {
        wrapper: createWrapper,
      })
    }).toThrow('Missing search params')
  })

  it('should handle missing radars data', () => {
    mockUseCarRadarSearchParams.mockReturnValue({
      searchParams: new URLSearchParams(),
      formattedSearchParams: mockSearchParams,
      queryKey: ['cars', 'radar', mockSearchParams],
    })

    mockUseRadars.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    } as any)

    const { result } = renderHook(() => useRadarsSearch(), {
      wrapper: createWrapper,
    })

    // Query deve estar desabilitada quando não há radars
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle empty radars data', () => {
    mockUseCarRadarSearchParams.mockReturnValue({
      searchParams: new URLSearchParams(),
      formattedSearchParams: mockSearchParams,
      queryKey: ['cars', 'radar', mockSearchParams],
    })

    mockUseRadars.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as any)

    const { result } = renderHook(() => useRadarsSearch(), {
      wrapper: createWrapper,
    })

    // Query deve estar habilitada mas sem dados
    expect(result.current.data).toBeUndefined()
  })
})
