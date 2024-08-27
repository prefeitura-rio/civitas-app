import { Page, View } from '@react-pdf/renderer'

import { ReportFooter } from '@/app/(app)/mapa/components/side-pannel/components/common/report-footer'
import { ReportHeader } from '@/app/(app)/mapa/components/side-pannel/components/common/report-header'

import { styles, title } from '../styles'
import { ReportClusterMap } from './components/report-cluster-map'
import { ReportHeatmap } from './components/report-heatmap'
import { ReportParameters } from './components/report-parameters'
import { ReportSources } from './components/report-sources'
import { ReportTimeline } from './components/report-timeline'

export function ReportContent() {
  return (
    <Page style={styles.page}>
      <ReportHeader title={title} />
      <View style={styles.contentContainer}>
        <ReportParameters />
        <ReportSources />
        <ReportHeatmap />
        <ReportClusterMap />
        <ReportTimeline />
      </View>
      <ReportFooter />
    </Page>
  )
}
