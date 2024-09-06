import { Document } from '@react-pdf/renderer'

import { ReportContent } from './components/report-content'
import type { ReportTimelineProps } from './components/report-content/components/report-timeline'
import { ReportCover } from './components/report-cover'

interface ReportDocumentProps {
  data: ReportTimelineProps['data']
  minDate: string
  maxDate: string
  keywords?: string[]
  sourceIdContains?: string[]
  categoryContains?: string[]
}

export function ReportDocument({
  data,
  minDate,
  maxDate,
  keywords,
  sourceIdContains,
  categoryContains,
}: ReportDocumentProps) {
  return (
    <Document>
      <ReportCover />
      <ReportContent
        data={data}
        minDate={minDate}
        maxDate={maxDate}
        keywords={keywords}
        sourceIdContains={sourceIdContains}
        categoryContains={categoryContains}
      />
    </Document>
  )
}
