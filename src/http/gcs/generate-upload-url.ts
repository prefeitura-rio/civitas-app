import { api } from '@/lib/api'

import { GCS_ROUTES } from './constants'

export interface GenerateUploadUrlRequest {
  file_name: string
  file_path?: string
  bucket_name: string
  content_type: string
  resumable: boolean
  file_size: number
  crc32c?: string
}

export interface GenerateUploadUrlResponse {
  signed_url: string
  file_exists?: boolean
}

export async function generateUploadUrl(
  data: GenerateUploadUrlRequest,
): Promise<{ data: GenerateUploadUrlResponse }> {
  const response = await api.post<GenerateUploadUrlResponse>(
    GCS_ROUTES.files['upload-url'],
    {
      file_name: data.file_name,
      file_path: data.file_path,
      bucket_name: data.bucket_name,
      content_type: data.content_type,
      resumable: data.resumable,
      file_size: data.file_size,
      crc32c: data.crc32c,
    },
    {
      headers: {
        accept: 'application/json',
      },
    },
  )

  return { data: response.data }
}
