import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = [
  'monitored-plates',
  plateContains?: string,
  referenceNumberContains?: string,
  requestingInstitutionId?: string,
  institutionAuthorityId?: string,
  active?: boolean,
  page?: number,
  size?: number,
  validUntilTo?: string,
]

export interface FormattedSearchParams {
  plateContains?: string
  referenceNumberContains?: string
  requestingInstitutionId?: string
  institutionAuthorityId?: string
  active?: boolean
  page?: number
  size?: number
  validUntilTo?: string
}

interface UseMonitoredPlatesSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: MonitoredPlatesQueryKey
  handlePaginate: (index: number) => void
}

export function useMonitoredPlatesSearchParams(): UseMonitoredPlatesSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const plateContains = searchParams.get('plateContains') || undefined
  const referenceNumberContains =
    searchParams.get('referenceNumberContains') || undefined
  const requestingInstitutionId =
    searchParams.get('requestingInstitutionId') || undefined
  const institutionAuthorityId =
    searchParams.get('institutionAuthorityId') || undefined

  const pActive = searchParams.get('active')
  // Default: only plates with ≥1 active authority link
  const active =
    pActive === null || pActive === 'true'
      ? true
      : pActive === 'false'
        ? false
        : undefined

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const validUntilTo = searchParams.get('validUntilTo') || undefined

  function buildParams(nextPage?: number) {
    const params = new URLSearchParams()
    if (plateContains) params.set('plateContains', plateContains)
    if (referenceNumberContains)
      params.set('referenceNumberContains', referenceNumberContains)
    if (requestingInstitutionId)
      params.set('requestingInstitutionId', requestingInstitutionId)
    if (institutionAuthorityId)
      params.set('institutionAuthorityId', institutionAuthorityId)
    if (pActive === 'all') params.set('active', 'all')
    else if (typeof active !== 'undefined') params.set('active', String(active))
    if (nextPage) params.set('page', nextPage.toString())
    if (size && size !== 10) params.set('size', size.toString())
    if (validUntilTo) params.set('validUntilTo', validUntilTo)
    return params
  }

  function handlePaginate(index: number) {
    const params = buildParams(index)
    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      plateContains,
      referenceNumberContains,
      requestingInstitutionId,
      institutionAuthorityId,
      active,
      page,
      size,
      validUntilTo,
    },
    queryKey: [
      'monitored-plates',
      plateContains,
      referenceNumberContains,
      requestingInstitutionId,
      institutionAuthorityId,
      active,
      page,
      size,
      validUntilTo,
    ],
  }
}
