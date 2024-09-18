import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import { ReportFooter } from '@/components/custom/report-footer'
import { ReportHeader } from '@/components/custom/report-header'
import type { Radar, RadarDetection, Vehicle } from '@/models/entities'

import { RadarReportCover } from './components/cover-v2'
import { RadarReportEmptyResult } from './components/radar-report-empty-result-v2'

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
  { title: 'Data e Hora', width: '13%', key: 'timestamp' },
  { title: 'Placa', width: '12%', key: 'plate' },
  { title: 'Marca/Modelo', width: '18%', key: 'brandAndModel' },
  { title: 'Cor', width: '15%', key: 'color' },
  { title: 'Ano Modelo', width: '10%', key: 'modelYear' },
  { title: 'Radar', width: '13%', key: 'cameraNumber' },
  { title: 'Faixa', width: '7%', key: 'lane' },
  { title: 'Velocidade [Km/h]', width: '12%', key: 'speed' },
]

type Detection = RadarDetection &
  Vehicle & {
    cameraNumber: string
    lane: string
  }

export interface RadarReportDocumentProps {
  data: {
    location: string
    radars: Radar[]
    detections: Detection[]
  }[]
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

        {data.map((item, i) => (
          <View key={i + 1} style={{ marginTop: i > 0 ? 60 : 0 }}>
            <Text style={styles.groupTitle}>{`Grupo ${i + 1}`}</Text>
            <RadarReportCover
              fromDate={parameters.from}
              toDate={parameters.to}
              latitude={item.radars[0].latitude}
              longitude={item.radars[0].longitude}
              location={item.location}
              radarIds={item.radars.map((r) => r.cameraNumber)}
              totalDetections={item.detections.length}
            />
            {item.detections.length > 0 ? (
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

                  {item.detections.map((row, i) => {
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
                <Text
                  style={styles.tableCaption}
                >{`Tabela ${i + 1}: Detecções do grupo ${i + 1}`}</Text>
              </>
            ) : (
              <RadarReportEmptyResult
                fromDate={parameters.from}
                toDate={parameters.to}
              />
            )}
            ,
          </View>
        ))}

        <ReportFooter />
      </Page>
    </Document>
  )
}
