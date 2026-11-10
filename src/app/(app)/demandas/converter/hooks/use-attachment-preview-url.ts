'use client'

import { useEffect, useState } from 'react'

import { isPreviewableContentType } from '@/app/(app)/demandas/utils/attachment-preview'
import type { AttachmentOut } from '@/http/emails/get-email'
import { api } from '@/lib/api'
import { getEmailAttachmentBlockedReason } from '@/utils/email-attachment-selection'

export function useAttachmentPreviewUrl(
  attachment: AttachmentOut | undefined,
  emailId: string | null | undefined,
) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const blocked =
      attachment &&
      !attachment.is_prepared &&
      getEmailAttachmentBlockedReason(attachment)
    if (!attachment || !emailId || blocked) {
      setUrl(null)
      setLoading(false)
      setUnavailable(Boolean(blocked))
      return
    }

    if (
      attachment.file_path.startsWith('http://') ||
      attachment.file_path.startsWith('https://')
    ) {
      setUrl(attachment.file_path)
      return () => {
        setUrl(null)
      }
    }

    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setUnavailable(false)

    api
      .get<Blob>(
        `/emails/${emailId}/attachments/${attachment.id}/${attachment.is_prepared ? 'prepared' : 'download'}`,
        {
          responseType: 'blob',
          ...(attachment.is_prepared
            ? { params: { token: attachment.preparation_token } }
            : {}),
        },
      )
      .then((res) => {
        if (cancelled) return
        if (!isPreviewableContentType(res.data.type)) {
          setUrl(null)
          setUnavailable(true)
          return
        }
        const u = URL.createObjectURL(res.data)
        objectUrl = u
        setUrl(u)
      })
      .catch(() => {
        if (!cancelled) setUrl(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
      setLoading(false)
    }
  }, [
    attachment?.id,
    attachment?.file_path,
    attachment?.size,
    attachment?.can_select,
    attachment?.is_prepared,
    attachment?.preparation_token,
    emailId,
  ])

  return { url, loading, unavailable }
}
