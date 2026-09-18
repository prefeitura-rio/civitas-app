import { renderHook } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useMonitoredPlatesSearchParams } from '@/hooks/useParams/useMonitoredPlatesSearchParams'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>

describe('useMonitoredPlatesSearchParams', () => {
  const replace = jest.fn()
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/placas-monitoradas')
    mockUseRouter.mockReturnValue({ replace, push } as any)
  })

  it('includes the requesting institution and excludes the channel filter', () => {
    const searchParams = new URLSearchParams({
      referenceNumberContains: 'REF-123',
      requestingInstitutionId: 'institution-1',
      institutionAuthorityId: 'authority-1',
      validUntilTo: '2026-08-31',
      notificationChannelId: 'channel-1',
    })
    mockUseSearchParams.mockReturnValue(searchParams as any)

    const { result } = renderHook(() => useMonitoredPlatesSearchParams())

    expect(result.current.formattedSearchParams).toEqual(
      expect.objectContaining({
        referenceNumberContains: 'REF-123',
        requestingInstitutionId: 'institution-1',
        institutionAuthorityId: 'authority-1',
        validUntilTo: '2026-08-31',
      }),
    )
    expect(result.current.formattedSearchParams).not.toHaveProperty(
      'notificationChannelId',
    )
    expect(result.current.queryKey).toContain('institution-1')
    expect(result.current.queryKey).not.toContain('channel-1')
  })

  it('preserves the requesting institution when changing pages', () => {
    const searchParams = new URLSearchParams({
      referenceNumberContains: 'REF-123',
      requestingInstitutionId: 'institution-1',
      plateContains: 'ABC1D23',
      validUntilTo: '2026-08-31',
    })
    mockUseSearchParams.mockReturnValue(searchParams as any)

    const { result } = renderHook(() => useMonitoredPlatesSearchParams())

    result.current.handlePaginate(2)

    expect(push).toHaveBeenCalledWith(
      '/placas-monitoradas?plateContains=ABC1D23&referenceNumberContains=REF-123&requestingInstitutionId=institution-1&active=true&page=2&validUntilTo=2026-08-31',
    )
  })

  it('restores and persists sorting parameters', () => {
    const searchParams = new URLSearchParams({
      sortBy: 'nearest_valid_until',
      sortDirection: 'asc',
    })
    mockUseSearchParams.mockReturnValue(searchParams as any)

    const { result } = renderHook(() => useMonitoredPlatesSearchParams())

    expect(result.current.formattedSearchParams).toEqual(
      expect.objectContaining({
        sortBy: 'nearest_valid_until',
        sortDirection: 'asc',
      }),
    )

    result.current.handleSort('nearest_valid_until', 'desc')

    expect(push).toHaveBeenCalledWith(
      '/placas-monitoradas?active=true&page=1&sortBy=nearest_valid_until&sortDirection=desc',
    )
  })
})
