import { api } from '@/lib/api'
import type { DetectionGroup } from '@/models/entities'

interface GetNCarsBeforeAfterRequest {
  plate: string
  startTime: string
  endTime: string
  nMinutes: number
  nPlates: number
}

export async function getNCarsBeforeAfter({
  plate,
  startTime,
  endTime,
  nMinutes,
  nPlates,
}: GetNCarsBeforeAfterRequest) {
  const response = await api.get<DetectionGroup[]>('/cars/n_before_after', {
    params: {
      placa: plate,
      start_time: startTime,
      end_time: endTime,
      n_minutes: nMinutes,
      n_plates: nPlates,
    },
  })

  return response.data
}

interface Ranking {
  plate: string
  count: number
}

interface GeneratePDFReportRequest {
  reportData: DetectionGroup[]
  params: {
    plate: string
    startTime: string
    endTime: string
    nMinutes: number
    nPlates: number
  }
  ranking: Ranking[]
}

export async function generatePDFReport({
  reportData,
  params,
  ranking,
}: GeneratePDFReportRequest) {
  const response = await api.post(
    '/pdf/correlated-plates',
    {
      report_data: reportData,
      params: {
        plate: params.plate,
        start_time: params.startTime,
        end_time: params.endTime,
        n_minutes: params.nMinutes,
        n_plates: params.nPlates,
      },
      ranking,
    },
    {
      responseType: 'blob',
    },
  )

  return response.data
}
