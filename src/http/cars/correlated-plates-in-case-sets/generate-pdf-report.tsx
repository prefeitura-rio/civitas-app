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

    // Find the .pdf and .html files in the ZIP
    const pdfFile = Object.keys(zip.files).find((filename) =>
      filename.toLowerCase().endsWith('.pdf'),
    )
    const htmlFile = Object.keys(zip.files).find((filename) =>
      filename.toLowerCase().endsWith('.html'),
    )

    let pdfBlob: Blob | undefined
    let htmlBlob: Blob | undefined

    if (pdfFile) {
      pdfBlob = await zip.file(pdfFile)?.async('blob')
    }
    if (htmlFile) {
      htmlBlob = await zip.file(htmlFile)?.async('blob')
    }

    if (!pdfBlob && !htmlBlob)
      throw new Error('No .pdf or .html file found in the ZIP.')

    return {
      pdf: pdfBlob ? { blob: pdfBlob, filename: pdfFile! } : undefined,
      html: htmlBlob ? { blob: htmlBlob, filename: htmlFile! } : undefined,
    }
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

    return { pdf: { blob: response.data, filename }, html: undefined }
  } else {
    throw new Error('Unsupported content type: ' + contentType)
  }
}
