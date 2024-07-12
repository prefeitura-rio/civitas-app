import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

type OperationsQueryKey = ['operations', page?: number, size?: number]

export interface FormattedSearchParams {
  page?: number
  size?: number
}
interface UseOperationsSearchParamsReturn {
  searchParams: URLSearchParams
  formattedSearchParams: FormattedSearchParams
  queryKey: OperationsQueryKey
  handlePaginate: (index: number) => void
}

export function useOperationsSearchParams(): UseOperationsSearchParamsReturn {
  const searchParams = useSearchParams()
  const router = useRouter()

  const page =
    z.coerce.number().parse(searchParams.get('page') ?? '1') || undefined
  const size =
    z.coerce.number().parse(searchParams.get('size') ?? '10') || undefined

  function handlePaginate(index: number) {
    router.replace(`operacoes?page=${index}`)
  }

  return {
    searchParams,
    handlePaginate,
    formattedSearchParams: {
      page,
      size,
    },
    queryKey: ['operations', page, size],
  }
}
