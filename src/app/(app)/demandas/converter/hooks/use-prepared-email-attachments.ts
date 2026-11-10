'use client'

import { useQueries } from '@tanstack/react-query'

import {
  type AttachmentOut,
  prepareEmailAttachment,
} from '@/http/emails/get-email'

export function usePreparedEmailAttachments(
  emailId: string | null,
  originals: AttachmentOut[],
) {
  const queries = useQueries({
    queries: originals.map((attachment) => ({
      queryKey: ['email-attachment-prepared', 'v3', emailId, attachment.id],
      queryFn: () => prepareEmailAttachment(emailId!, attachment.id),
      enabled: Boolean(emailId),
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    })),
  })

  return {
    attachments: originals.map((original, index): AttachmentOut => {
      const query = queries[index]
      if (query.data) return query.data.data
      return {
        ...original,
        is_prepared: false,
        can_select: false,
        blocked_reason: query.isError
          ? 'Não foi possível comprimir este anexo. Tente novamente.'
          : 'Comprimindo anexo. Aguarde para selecionar.',
      }
    }),
    preparingAttachmentIds: new Set(
      originals
        .filter((_, index) => queries[index].isPending)
        .map((attachment) => attachment.id),
    ),
    isPreparing: queries.some((query) => query.isPending),
    hasErrors: queries.some((query) => query.isError),
    retryFailed: async () => {
      await Promise.all(
        queries
          .filter((query) => query.isError)
          .map((query) => query.refetch()),
      )
    },
  }
}
