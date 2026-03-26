'use client'

import { useEffect, useState } from 'react'

import type { AttachmentOut } from '@/http/emails/get-email'
import { api } from '@/lib/api'

export function useAttachmentPreviewUrl(attachment: AttachmentOut | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!attachment) {
      setUrl(null)
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

    api
      .get(`/emails/attachments/${attachment.id}/download`, {
        responseType: 'blob',
      })
      .then((res) => {
        const u = URL.createObjectURL(res.data)
        if (cancelled) {
          URL.revokeObjectURL(u)
          return
        }
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
  }, [attachment?.id, attachment?.file_path])

  return { url, loading }
}
