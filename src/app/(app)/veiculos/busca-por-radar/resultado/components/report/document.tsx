import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import { ReportFooter } from '@/components/custom/report-footer'
import { ReportHeader } from '@/components/custom/report-header'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import type { Radar, RadarDetection } from '@/models/entities'

import { RadarReportCover } from './components/cover'
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
  groupTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  tableCaption: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 4,
  },
  tableHeader: {
    fontFamily: 'Times-Roman',
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
  { title: 'Data e Hora', width: '25%', key: 'timestamp' },
  { title: 'Placa', width: '15%', key: 'plate' },
  { title: 'Radar', width: '15%', key: 'cameraNumber' },
  { title: 'Faixa', width: '10%', key: 'lane' },
  { title: 'Velocidade [Km/h]', width: '20%', key: 'speed' },
]

export type GroupedDetection = {
  location: string
  radars: Radar[]
  detections: DetectionDTO[]
}

export interface RadarReportDocumentProps {
  data: GroupedDetection[]
  parameters: {
    from: Date
    to: Date
    radarIds: string[]
    plate?: string
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

        {data.map((group, i) => (
          <View key={i + 1} style={{ marginTop: i > 0 ? 60 : 0 }}>
            {data.length > 1 && (
              <Text style={styles.groupTitle}>{`Grupo ${i + 1}`}</Text>
            )}
            <RadarReportCover
              fromDate={parameters.from}
              toDate={parameters.to}
              latitude={group.radars[0].latitude}
              longitude={group.radars[0].longitude}
              location={group.location}
              radarIds={group.radars.map((r) => r.cameraNumber)}
              totalDetections={group.detections.length}
              plate={parameters.plate}
            />
            {group.detections.length > 0 ? (
              <>
                <View style={styles.table}>
                  <View style={styles.tableRow} wrap={false}>
                    {columns.map((column, j) => (
                      <Text
                        key={j}
                        style={{
                          ...styles.tableHeader,
                          width: column.width,
                        }}
                      >
                        {column.title}
                      </Text>
                    ))}
                  </View>

                  {group.detections.map((row, i) => {
                    return (
                      <View key={i} style={styles.tableRow} wrap={false}>
                        {columns.map((column, j) => (
                          <Text
                            key={j}
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
                </View>
                {data.length > 1 ? (
                  <Text
                    style={styles.tableCaption}
                  >{`Tabela ${i + 1}: Detecções do grupo ${i + 1}`}</Text>
                ) : (
                  <Text
                    style={styles.tableCaption}
                  >{`Tabela ${i + 1}: Detecções`}</Text>
                )}
              </>
            ) : (
              <RadarReportEmptyResult
                fromDate={parameters.from}
                toDate={parameters.to}
              />
            )}
          </View>
        ))}

        <ReportFooter />
      </Page>
    </Document>
  )
}
