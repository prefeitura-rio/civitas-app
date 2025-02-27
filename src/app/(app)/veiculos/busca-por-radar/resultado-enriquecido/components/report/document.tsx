import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import { ReportFooter } from '@/components/custom/report-footer'
import { ReportHeader } from '@/components/custom/report-header'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'
import type { Radar } from '@/models/entities'

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
  { title: 'Marca/Modelo', width: '20%', key: 'brandModel' },
  { title: 'Cor', width: '13%', key: 'color' },
  { title: 'Ano Modelo', width: '10%', key: 'modelYear' },
  { title: 'Radar', width: '13%', key: 'cameraNumber' },
  { title: 'Faixa', width: '7%', key: 'lane' },
  { title: 'Velocidade [Km/h]', width: '12%', key: 'speed' },
]

export type GroupedEnhancedDetection = {
  location: string
  radars: Radar[]
  detections: EnhancedDetectionDTO[]
}

export interface RadarReportDocumentProps {
  data: GroupedEnhancedDetection[]
  parameters: {
    from: Date
    to: Date
    radarIds: string[]
    plate?: string
    colors?: string[]
    brandModels?: string[]
  }
}

// Function to remove duplicate detections
const removeDuplicates = (detections: EnhancedDetectionDTO[]) => {
  const uniqueDetections = new Map<string, EnhancedDetectionDTO>()
  detections.forEach((detection) => {
    const key = `${detection.timestamp}-${detection.plate}-${detection.cameraNumber}-${detection.lane}-${detection.speed}`
    if (!uniqueDetections.has(key)) {
      uniqueDetections.set(key, detection)
    }
  })
  return Array.from(uniqueDetections.values())
}

export function RadarReportDocument({
  data,
  parameters,
}: RadarReportDocumentProps) {
  const reportTitle = 'Relatório de detecção de placas por radar'

  // Remove duplicates from each group's detections
  const filteredData = data.map((group) => ({
    ...group,
    detections: removeDuplicates(group.detections),
  }))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title={reportTitle} />

        {filteredData.map((group, i) => (
          <View key={i + 1} style={{ marginTop: i > 0 ? 60 : 0 }}>
            {filteredData.length > 1 && (
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
              brandModels={parameters.brandModels}
              colors={parameters.colors}
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
                              : row[column.key as keyof EnhancedDetectionDTO]}
                          </Text>
                        ))}
                      </View>
                    )
                  })}
                </View>
                {filteredData.length > 1 ? (
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
