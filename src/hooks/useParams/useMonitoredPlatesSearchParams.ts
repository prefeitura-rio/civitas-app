import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type MonitoredPlatesQueryKey = [
  'cars',
  'monitored',
  plateContains?: string,
  organizationId?: string,
  organizationName?: string,
  NotificationChannelTitle?: string,
  demandantLinkActive?: boolean,
  page?: number,
  size?: number,
  createdAtFrom?: string,
  createdAtTo?: string,
]

export interface FormattedSearchParams {
  plateContains?: string
  organizationId?: string
  organizationName?: string
  notificationChannelTitle?: string
  /** Enviado à API como `demandant_link_active` (status do vínculo, não só da placa). */
  demandantLinkActive?: boolean
  page?: number
  size?: number
  createdAtFrom?: string
  createdAtTo?: string
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
  const organizationId =
    searchParams.get('organizationId') ||
    searchParams.get('organization_id') ||
    undefined
  const organizationName =
    searchParams.get('organizationName') ||
    searchParams.get('operationTitle') ||
    undefined
  const notificationChannelTitle =
    searchParams.get('notificationChannelTitle') || undefined

  /** Query `active`; API recebe `demandant_link_active` (`true` / `false`). */
  const pActive = searchParams.get('active')
  const demandantLinkActive = pActive === null ? undefined : pActive === 'true'

  const page = z.coerce.number().parse(searchParams.get('page') ?? '1')
  const size = z.coerce.number().parse(searchParams.get('size') ?? '10')

  const createdAtFrom = searchParams.get('createdAtFrom') || undefined
  const createdAtTo = searchParams.get('createdAtTo') || undefined

  function handlePaginate(index: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (plateContains) params.set('plateContains', plateContains)
    if (organizationId) params.set('organizationId', organizationId)
    params.delete('organization_id')
    if (organizationName) params.set('organizationName', organizationName)
    if (notificationChannelTitle)
      params.set('notificationChannelTitle', notificationChannelTitle)
    if (typeof demandantLinkActive !== 'undefined')
      params.set('active', String(demandantLinkActive))
    if (page) params.set('page', index.toString())
    if (size) params.set('size', size.toString())

    router.push(`${pathName}?${params.toString()}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      plateContains,
      organizationId,
      organizationName,
      notificationChannelTitle,
      demandantLinkActive,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    },
    queryKey: [
      'cars',
      'monitored',
      plateContains,
      organizationId,
      organizationName,
      notificationChannelTitle,
      demandantLinkActive,
      page,
      size,
      createdAtFrom,
      createdAtTo,
    ],
  }
}
