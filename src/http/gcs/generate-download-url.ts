import { api } from '@/lib/api'
import { sanitizePath } from '@/utils/sanitize-path'

import { GCS_ROUTES } from './constants'

export interface GenerateDownloadUrlRequest {
  file_name: string
  bucket_name: string
  expiration_minutes: number
}

export interface GenerateDownloadUrlResponse {
  download_url: string
  expires_in_seconds: number
}

export async function generateDownloadUrl(
  data: GenerateDownloadUrlRequest,
): Promise<{ data: GenerateDownloadUrlResponse }> {
  const response = await api.post<GenerateDownloadUrlResponse>(
    GCS_ROUTES.files['download-url'],
    {
      file_name: sanitizePath(data.file_name),
      bucket_name: data.bucket_name,
      expiration_minutes: data.expiration_minutes,
    },
    {
      headers: {
        accept: 'application/json',
      },
    },
  )

  return { data: response.data }
}
