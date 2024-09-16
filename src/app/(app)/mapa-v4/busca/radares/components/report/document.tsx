import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import { ReportHeader } from '@/app/(app)/mapa/components/side-pannel/components/common/report-header'
import { ReportFooter } from '@/components/custom/report-footer'
import type { Radar, RadarDetection } from '@/models/entities'

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
  { title: 'Data e Hora', width: 115, key: 'timestamp' },
  { title: 'Placa', width: 65, key: 'plate' },
  { title: 'Marca/Modelo', width: 115, key: 'brandAndModel' },
  { title: 'Cor', width: 65, key: 'color' },
  { title: 'Ano Modelo', width: 65, key: 'modelYear' },
  { title: 'Velocidade [Km/h]', width: 100, key: 'speed' },
]

export type RadarDetections = {
  radar: Radar
  detections: RadarDetection[]
}[]

export interface RadarReportDocumentProps {
  data: RadarDetections
  parameters: {
    from: Date
    to: Date
    plateHint?: string
    radarIds: string[]
  }
}

export function RadarReportDocument({
  data,
  parameters,
}: RadarReportDocumentProps) {
  const reportTitle = 'Relatório de detecção de placas por radar'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title={reportTitle} />

        <RadarReportCover
          fromDate={parameters.from}
          toDate={parameters.to}
          radar={data[0].radar}
          totalDetections={data[0].detections.length}
        />

        {data[0].detections.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableRow} wrap={false}>
              {columns.map((column, index) => (
                <Text
                  key={index}
                  style={{
                    ...styles.tableHeader,
                    width: column.width,
                  }}
                >
                  {column.title}
                </Text>
              ))}
            </View>

            {data[0].detections.map((row) => {
              return (
                <View style={styles.tableRow} wrap={false}>
                  {columns.map((column, index) => (
                    <Text
                      key={index}
                      style={{
                        ...styles.tableData,
                        width: column.width,
                      }}
                    >
                      {column.key === 'timestamp'
                        ? format(row.timestamp, 'dd/MM/yyyy HH:mm:ss')
                        : row[column.key as keyof RadarDetection]}
                    </Text>
                  ))}
                </View>
              )
            })}

            <View style={styles.tableRow}></View>
          </View>
        ) : (
          <RadarReportEmptyResult
            fromDate={parameters.from}
            toDate={parameters.to}
            radarId={parameters.radarIds[0]}
          />
        )}

        <ReportFooter />
      </Page>
    </Document>
  )
}
