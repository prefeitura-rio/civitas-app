import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

import type { Trip } from '@/utils/formatCarPathResponse'

import { MapView } from './map-view'
import { ReportFooter } from './report-footer'
import { ReportHeader } from './report-header'
import { TripTable } from './trip-table'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
})

interface ReportProps {
  trips: Trip[]
}
export function ReportDocument({ trips }: ReportProps) {
  return (
    <Document>
      {trips.map((trip, index) => {
        return (
          <Page key={index} size="A4" style={styles.page}>
            <ReportHeader />
            <MapView points={trip.points} />
            <TripTable points={trip.points} />
            <ReportFooter />
          </Page>
        )
      })}
    </Document>
  )
}
