import { api } from '@/lib/api'

interface GenerateCloningReportRequest {
  plate: string
  dateStart: string
  dateEnd: string
}

export async function generateCloningReport({
  plate,
  dateStart,
  dateEnd,
}: GenerateCloningReportRequest) {
  const response = await api.post(
    '/pdf/cloning-report',
    {
      plate,
      date_start: dateStart,
      date_end: dateEnd,
    },
    {
      responseType: 'blob',
    },
  )

  return response.data as Blob
}
