// generate-pdf-report.tsx
import JSZip from 'jszip'

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
  keepBuses?: boolean
  beforeAfter?: 'before' | 'after' | 'both'
}

export async function generatePDFReport({
  requestedPlatesData,
  nMinutes,
  minDifferentTargets,
  keepBuses,
  beforeAfter,
}: GeneratePDFReportRequest) {
  const response = await api.post(
    '/pdf/multiple-correlated-plates',
    {
      requested_plates_data: requestedPlatesData,
      n_minutes: nMinutes,
      n_plates: 1000000000, // hardcoded as per requirements
      min_different_targets: minDifferentTargets,
      keep_buses: keepBuses,
      before_after: beforeAfter,
      report_title: 'Relatório de identificação de veículos', // hardcoded as per requirements
    },
    {
      responseType: 'blob', // Important for file downloads
    },
  )

  const contentType = response.headers['content-type']

  if (contentType.includes('application/zip')) {
    // Handle ZIP file
    const zip = await JSZip.loadAsync(response.data)

    // Find the .pdf file in the ZIP
    const pdfFile = Object.keys(zip.files).find((filename) =>
      filename.toLowerCase().endsWith('.pdf'),
    )

    if (!pdfFile) throw new Error('No .pdf file found in the ZIP.')

    const blob = await zip.file(pdfFile)?.async('blob')
    if (!blob) throw new Error('Failed to extract .pdf from ZIP.')

    return { blob, filename: pdfFile }
  } else if (contentType.includes('application/pdf')) {
    // Direct PDF response
    const disposition = response.headers['content-disposition']
    let filename = 'relatorio_placas_correlacionadas.pdf'

    if (disposition && disposition.indexOf('filename=') !== -1) {
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/)
      if (fileNameMatch.length > 1) {
        filename = fileNameMatch[1]
      }
    }

    return { blob: response.data, filename }
  } else {
    throw new Error('Unsupported content type: ' + contentType)
  }
}
