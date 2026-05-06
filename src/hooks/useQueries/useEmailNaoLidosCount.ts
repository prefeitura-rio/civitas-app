import { useQuery } from '@tanstack/react-query'

import { getEmailNaoLidosCount } from '@/http/emails/get-emails'

const REFETCH_MS = 1 * 60 * 1000

export const EMAIL_NAO_LIDOS_COUNT_QUERY_KEY = [
  'emails-nao-lidos-contagem',
] as const

export function useEmailNaoLidosCount(enabled: boolean) {
  return useQuery({
    queryKey: EMAIL_NAO_LIDOS_COUNT_QUERY_KEY,
    queryFn: getEmailNaoLidosCount,
    enabled,
    refetchInterval: enabled ? REFETCH_MS : false,
  })
}
