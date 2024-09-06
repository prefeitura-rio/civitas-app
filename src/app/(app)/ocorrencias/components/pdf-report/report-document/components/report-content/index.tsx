import { Page, View } from '@react-pdf/renderer'

import { ReportFooter } from '@/app/(app)/mapa/components/side-pannel/components/common/report-footer'
import { ReportHeader } from '@/app/(app)/mapa/components/side-pannel/components/common/report-header'

import { styles, title } from '../styles'
import { ReportClusterMap } from './components/report-cluster-map'
import { ReportHeatmap } from './components/report-heatmap'
import { ReportParameters } from './components/report-parameters'
import { ReportSources } from './components/report-sources'
import {
  ReportTimeline,
  type ReportTimelineProps,
} from './components/report-timeline'

interface ReportContentProps {
  data: ReportTimelineProps['data']
  minDate: string
  maxDate: string
  keywords?: string[]
  sourceIdContains?: string[]
  categoryContains?: string[]
}

export function ReportContent({
  data,
  minDate,
  maxDate,
  keywords,
  sourceIdContains,
  categoryContains,
}: ReportContentProps) {
  return (
    <Page style={styles.page}>
      <ReportHeader title={title} />
      <View style={styles.contentContainer}>
        <ReportParameters
          minDate={minDate}
          maxDate={maxDate}
          keywords={keywords}
          sourceIdContains={sourceIdContains}
          categoryContains={categoryContains}
        />
        <ReportSources />
        <ReportHeatmap />
        <ReportClusterMap />
        <ReportTimeline data={data} />
      </View>
      <ReportFooter />
    </Page>
  )
}
