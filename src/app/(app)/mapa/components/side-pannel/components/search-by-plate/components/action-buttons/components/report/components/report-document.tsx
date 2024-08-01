import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'
import type { Trip } from '@/models/entities'

import { ReportCover } from './components/report-cover'
import { ReportEmptyResult } from './components/report-empty-result'
import { ReportFooter } from './components/report-footer'
import { ReportHeader } from './components/report-header'
import { ReportTrip } from './components/report-trip'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
})

interface ReportProps {
  trips: Trip[]
  searchParams: GetCarPathRequest
}

export function ReportDocument({ trips, searchParams }: ReportProps) {
  let imgCounter = 1
  let tableCounter = 1

  function useImgCounter() {
    return imgCounter++
  }

  function useTableCounter() {
    return tableCounter++
  }

  const totalPoints = trips.reduce((acc, cur) => acc + cur.points.length, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportCover searchParams={searchParams} totalPoints={totalPoints} />
        <ReportFooter />
      </Page>

      {trips.length > 0 ? (
        trips.map((trip, index) => {
          return (
            <Page key={index} size="A4" style={styles.page}>
              <ReportHeader />
              <ReportTrip
                trip={trip}
                plate={searchParams.plate}
                useImgCounter={useImgCounter}
                useTableCounter={useTableCounter}
              />
              <ReportFooter />
            </Page>
          )
        })
      ) : (
        <Page size="A4" style={styles.page}>
          <ReportHeader />
          <ReportEmptyResult searchParams={searchParams} />
          <ReportFooter />
        </Page>
      )}
    </Document>
  )
}
