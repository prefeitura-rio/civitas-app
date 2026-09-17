import { act, renderHook } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useMonitoredPlatesHistorySearchParams } from '@/hooks/useParams/useMonitoredPlatesHistorySearchParams'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

function createMockSearchParams(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  return searchParams as unknown as ReturnType<typeof useSearchParams>
}

describe('useMonitoredPlatesHistorySearchParams', () => {
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({ push } as never)
    mockUsePathname.mockReturnValue('/placas-monitoradas/historico')
  })

  it('parses new history filters from the URL', () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        plate: 'ABC1D23',
        status: 'active',
        source: 'authority',
        referenceNumber: 'REQ-1',
        startTimeCreate: '2026-01-01T00:00:00.000Z',
        endTimeDelete: '2026-02-01T00:00:00.000Z',
        sortBy: 'plate',
        sortDirection: 'asc',
        page: '2',
        size: '20',
      }),
    )

    const { result } = renderHook(() => useMonitoredPlatesHistorySearchParams())

    expect(result.current.formattedSearchParams).toEqual({
      plate: 'ABC1D23',
      status: 'active',
      source: 'authority',
      referenceNumber: 'REQ-1',
      startTimeCreate: '2026-01-01T00:00:00.000Z',
      endTimeCreate: undefined,
      startTimeDelete: undefined,
      endTimeDelete: '2026-02-01T00:00:00.000Z',
      sortBy: 'plate',
      sortDirection: 'asc',
      page: 2,
      size: 20,
    })
  })

  it('normalizes legacy_plate source to legacy', () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        source: 'legacy_plate',
      }),
    )

    const { result } = renderHook(() => useMonitoredPlatesHistorySearchParams())

    expect(result.current.formattedSearchParams.source).toBe('legacy')
  })

  it('preserves filters and sorting when paginating', () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        plate: 'ABC1D23',
        status: 'deactivated',
        source: 'legacy',
        sortBy: 'created_timestamp',
        sortDirection: 'desc',
        page: '1',
        size: '10',
      }),
    )

    const { result } = renderHook(() => useMonitoredPlatesHistorySearchParams())

    act(() => {
      result.current.handlePaginate(3)
    })

    expect(push).toHaveBeenCalledWith(
      '/placas-monitoradas/historico?plate=ABC1D23&status=deactivated&source=legacy&sortBy=created_timestamp&sortDirection=desc&page=3&size=10',
    )
  })

  it('resets to page 1 when sorting changes', () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        plate: 'XYZ9A87',
        page: '4',
        size: '10',
      }),
    )

    const { result } = renderHook(() => useMonitoredPlatesHistorySearchParams())

    act(() => {
      result.current.handleSorting('plate', 'asc')
    })

    expect(push).toHaveBeenCalledWith(
      '/placas-monitoradas/historico?plate=XYZ9A87&page=1&size=10&sortBy=plate&sortDirection=asc',
    )
  })
})
