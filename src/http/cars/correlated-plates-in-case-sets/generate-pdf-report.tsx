// generate-pdf-report.tsx
import { api } from '@/lib/api'

interface RequestedPlateData {
  plate: string
  start: string
  end: string
}

interface GeneratePDFReportRequest {
  requestedPlatesData: RequestedPlateData[]
  nMinutes: number
  minDifferentTargets: number
  vehicleTypes: string[]
  beforeAfter: 'before' | 'after' | 'both'
}

export async function generatePDFReport({
  requestedPlatesData,
  nMinutes,
  minDifferentTargets,
  vehicleTypes,
  beforeAfter,
}: GeneratePDFReportRequest) {
  const response = await api.post(
    '/pdf/multiple-correlated-plates',
    {
      requested_plates_data: requestedPlatesData,
      n_minutes: nMinutes,
      n_plates: 1000000000, // hardcoded as per requirements
      min_different_targets: minDifferentTargets,
      vehicle_types: vehicleTypes,
      before_after: beforeAfter,
      report_title: 'Relatório de identificação de veículos', // hardcoded as per requirements
    },
    {
      responseType: 'blob', // Important for file downloads
    },
  )
  return response.data
}
