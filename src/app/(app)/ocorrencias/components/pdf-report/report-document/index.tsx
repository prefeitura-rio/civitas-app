import { Document } from '@react-pdf/renderer'

import { ReportContent } from './components/report-content'
import { ReportCover } from './components/report-cover'

export function ReportDocument() {
  return (
    <Document>
      <ReportCover />
      <ReportContent />
    </Document>
  )
}
