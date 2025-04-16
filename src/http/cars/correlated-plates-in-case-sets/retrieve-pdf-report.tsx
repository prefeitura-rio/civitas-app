import { api } from '@/lib/api'

export interface RetrievePDFReportResponse {
  status_code: number
  detail: string
  report_history: {
    id_report: string
    timestamp: string
    query_params: Record<string, unknown>
    body: {
      n_plates: number
      n_minutes: number
      before_after: 'before' | 'after' | 'both'
      report_title: string
      vehicle_types: string[]
      min_different_targets: number
      requested_plates_data: {
        plate: string
        start: string
        end: string
      }[]
    }
  }
}

export async function retrievePDFReport(
  reportId: string,
): Promise<RetrievePDFReportResponse> {
  const response = await api.get('/pdf/multiple-correlated-plates/history', {
    params: { report_id: reportId },
  })
  return response.data
}
