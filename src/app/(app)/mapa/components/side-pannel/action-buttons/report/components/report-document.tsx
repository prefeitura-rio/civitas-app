import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'
import type { Trip } from '@/models/entities'

import { ReportCover } from './components/report-cover'
import { ReportEmptyResult } from './components/report-empty-result'
import { ReportTrip } from './components/report-trip'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
})

interface ReportProps {
  trips: Trip[]
  searchParams: GetCarPathRequest
}

export function ReportDocument({ trips, searchParams }: ReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportCover searchParams={searchParams} />
      </Page>

      {trips.length > 0 ? (
        trips.map((trip, index) => {
          return (
            <Page key={index} size="A4" style={styles.page}>
              <ReportTrip
                trip={trip}
                index={index}
                plate={searchParams.plate}
              />
            </Page>
          )
        })
      ) : (
        <Page size="A4" style={styles.page}>
          <ReportEmptyResult searchParams={searchParams} />
        </Page>
      )}
    </Document>
  )
}
