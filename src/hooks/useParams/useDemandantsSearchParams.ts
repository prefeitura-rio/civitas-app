import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type DemandantsQueryKey = [
  'demandants',
  page?: number,
  size?: number,
  organizationId?: string,
]

export interface DemandantsFormattedSearchParams {
  page?: number
  size?: number
  organizationId?: string
}

interface UseDemandantsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: DemandantsFormattedSearchParams
  queryKey: DemandantsQueryKey
  handlePaginate: (index: number) => void
  setOrganizationFilter: (organizationId: string | undefined) => void
}

export function useDemandantsSearchParams(): UseDemandantsSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')
  const organizationId =
    searchParams.get('organizationId') ||
    searchParams.get('organization_id') ||
    undefined

  function handlePaginate(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(index))
    params.delete('organization_id')
    if (organizationId) {
      params.set('organizationId', organizationId)
    } else {
      params.delete('organizationId')
    }
    router.push(`${pathName}?${params.toString()}`)
  }

  function setOrganizationFilter(nextOrganizationId: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')
    params.delete('organization_id')
    if (nextOrganizationId) {
      params.set('organizationId', nextOrganizationId)
    } else {
      params.delete('organizationId')
    }
    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    setOrganizationFilter,
    formattedSearchParams: {
      page,
      size,
      organizationId,
    },
    queryKey: ['demandants', page, size, organizationId],
  }
}
