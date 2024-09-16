import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import type { Radar, RadarDetection } from '@/models/entities'

import { ReportFooter } from '../../../../../common/report-footer'
import { ReportHeader } from '../../../../../common/report-header'
import { RadarReportCover } from './components/radar-report-cover'
import { RadarReportEmptyResult } from './components/radar-report-empty-result'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 40,
    fontSize: 11,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 40,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  tableHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    border: 1,
    borderColor: 'black',
    alignItems: 'center',
    marginTop: -1,
    marginRight: -1,
    paddingTop: 2,
  },
  tableData: {
    textAlign: 'center',
    border: 1,
    borderColor: 'black',
    alignItems: 'center',
    marginTop: -1,
    marginRight: -1,
    paddingTop: 2,
  },
})

const columns = [
  { title: 'Data/Hora', width: 115 },
  { title: 'Placa', width: 65 },
  { title: 'Velocidade [Km/h]', width: 100 },
]

export interface RadarReportDocumentProps {
  radar: Radar
  fromDate: Date
  toDate: Date
  detections: RadarDetection[]
}

export function RadarReportDocument(props: RadarReportDocumentProps) {
  const reportTitle = 'Relatório de detecção de placas por radar'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title={reportTitle} />

        <RadarReportCover
          fromDate={props.fromDate}
          toDate={props.toDate}
          radar={props.radar}
          totalDetections={props.detections.length}
        />

        {props.detections.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableRow} wrap={false}>
              {columns.map((column) => (
                <Text
                  style={{
                    ...styles.tableHeader,
                    width: column.width,
                  }}
                >
                  {column.title}
                </Text>
              ))}
            </View>

            {props.detections.map((row) => {
              let columnIndex = 0

              return (
                <View style={styles.tableRow} wrap={false}>
                  <Text
                    style={{
                      ...styles.tableData,
                      width: columns[columnIndex++].width,
                    }}
                  >
                    {format(row.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                  </Text>

                  <Text
                    style={{
                      ...styles.tableData,
                      width: columns[columnIndex++].width,
                    }}
                  >
                    {row.plate}
                  </Text>

                  <Text
                    style={{
                      ...styles.tableData,
                      width: columns[columnIndex++].width,
                    }}
                  >
                    {row.speed}
                  </Text>
                </View>
              )
            })}

            <View style={styles.tableRow}></View>
          </View>
        ) : (
          <RadarReportEmptyResult
            fromDate={props.fromDate}
            radarId={props.radar.cameraNumber}
            toDate={props.toDate}
          />
        )}

        <ReportFooter />
      </Page>
    </Document>
  )
}
