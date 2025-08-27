import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import { dateConfig } from '@/lib/date-config'
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  table: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  tableRow: {
    flexDirection: 'row',
  tableCaption: {
    marginTop: 4,
  tableHeader: {
    border: 1,
    borderColor: 'black',
    marginTop: -1,
    marginRight: -1,
    paddingTop: 2,
  tableData: {
})
const columns = [
  { title: 'Data e Hora', width: '25%', key: 'timestamp' },
  { title: 'Placa', width: '15%', key: 'plate' },
  { title: 'Radar', width: '15%', key: 'cetRioCode' },
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
// Function to remove duplicate detections
const removeDuplicates = (detections: DetectionDTO[]) => {
  const uniqueDetections = new Map<string, DetectionDTO>()
  detections.forEach((detection) => {
    const key = `${detection.timestamp}-${detection.plate}-${detection.cetRioCode}-${detection.lane}-${detection.speed}`
    if (!uniqueDetections.has(key)) {
      uniqueDetections.set(key, detection)
    }
  })
  return Array.from(uniqueDetections.values())
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
              radarIds={group.radars.map((r) => r.cetRioCode)}
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
                              ? format(row.timestamp, 'dd/MM/yyyy HH:mm:ss', {
                                  locale: dateConfig.locale,
                                })
                              : column.key === 'plate' &&
                                  row[column.key as keyof RadarDetection] === ''
                                ? '-------'
                                : row[column.key as keyof RadarDetection]}
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
                  >{`Tabela ${i + 1}: Detecções`}</Text>
                )}
              </>
            ) : (
              <RadarReportEmptyResult
                fromDate={parameters.from}
                toDate={parameters.to}
              />
          </View>
        ))}
        <ReportFooter />
      </Page>
    </Document>
  )
