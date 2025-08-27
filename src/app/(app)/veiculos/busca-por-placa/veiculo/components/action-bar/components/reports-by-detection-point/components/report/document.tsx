import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import { dateConfig } from '@/lib/date-config'
import { RadarReportEmptyResult } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/report/components/radar-report-empty-result'
import { ReportFooter } from '@/components/custom/report-footer'
import { ReportHeader } from '@/components/custom/report-header'
import type { DetectionGroup, RadarDetection } from '@/models/entities'
import { ReportEmptyResult } from '../../../../../report/components/components/report-empty-result'
import { CoverDisclaimer } from './cover'
interface ReportDocumentProps {
  data: DetectionGroup[]
  params: {
    plate: string
    endTime: string
    startTime: string
    nMinutes: number
    nPlates: number
  }
  ranking: { plate: string; count: number }[]
}
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
    paddingTop: 20,
    // marginBottom: 12,
  table: {
    display: 'flex',
    alignItems: 'center',
    // marginTop: 20,
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
const paramsStyle = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 18,
    marginRight: 20,
  row: {
    gap: 4,
  label: {
const detectionColumns = [
  { title: 'Data e Hora', width: '23%', key: 'timestamp' },
  { title: 'Placa', width: '14%', key: 'plate' },
  { title: 'Radar', width: '14%', key: 'codcet' },
  { title: 'Faixa', width: '9%', key: 'lane' },
  { title: 'Velocidade [Km/h]', width: '20%', key: 'speed' },
  { title: 'Nº de ocorrências', width: '20%', key: 'count' },
]
const rankingColumns = [
  { title: 'Placa', width: '15%', key: 'plate' },
export function ReportDocument({ data, params, ranking }: ReportDocumentProps) {
  const reportTitle = 'RELATÓRIO DE DETECÇÃO DE PLACAS CONJUNTAS'
  const totalDetections = data.reduce(
    (acc, group) => acc + group.total_detections,
    0,
  )
  const coverParams = [
    {
      label: 'Placa monitorada:',
      value: params.plate,
    },
      label: 'Período analisado:',
      value: `De ${format(params.startTime, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })} até ${format(params.endTime, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })}`,
      label: 'Limite de placas antes e depois:',
      value: params.nPlates,
      label: 'Total de detecções da placa monitorada:',
      value: data.length,
      label: 'Total de detecções de todos os radares e placas:',
      value: data.reduce((acc, group) => acc + group.total_detections, 0),
  ]
  const getDetectionParams = (data: DetectionGroup) => {
    const startTime = new Date(data.start_time)
    const endTime = new Date(data.end_time)
    const diff = endTime.getTime() - startTime.getTime()
    const monitoredPlateTimeStamp = new Date(startTime.getTime() + diff / 2)
    return [
      {
        label: 'Data e hora da detecção da placa monitorada:',
        value: format(monitoredPlateTimeStamp, 'dd/MM/yyyy HH:mm:ss', {
          locale: dateConfig.locale,
        }),
      },
        label: 'Período analisado:',
        value: `De ${format(data.start_time, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })} até ${format(data.end_time, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })}`,
        label: 'Radares:',
        value: data.radars.join(', '),
        label: 'Coordenadas:',
        value: `Latitude: ${data.latitude}, Longitude: ${data.longitude}`,
        label: 'Endereço:',
        value: data.location,
        label: 'Total de detecções:',
        value: data.total_detections,
    ]
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title={reportTitle} />
        <CoverDisclaimer />
        <Text style={styles.groupTitle}>Parâmetros Gerais</Text>
        <View style={paramsStyle.container}>
          {coverParams.map(
            (item, index) =>
              (item === undefined || item === null || item.value !== '') && (
                <View key={index} style={paramsStyle.row}>
                  <Text style={paramsStyle.label}>{item.label}</Text>
                  <Text>{item.value}</Text>
                </View>
              ),
          )}
        </View>
        {totalDetections > 0 ? (
          <>
            <Text style={styles.groupTitle}>
              Placas com mais de uma ocorrência
            </Text>
            {ranking.length > 0 ? (
              <>
                <View style={{ ...styles.table, marginVertical: 20 }}>
                  <View style={styles.tableRow} wrap={false}>
                    {rankingColumns.map((column, j) => (
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
                  {ranking.map((row, i) => {
                    return (
                      <View
                        key={i}
                          ...styles.tableRow,
                          backgroundColor:
                            row.plate === params.plate ? 'yellow' : 'white',
                        wrap={false}
                        {rankingColumns.map((column, j) => (
                          <Text
                            key={j}
                            style={{
                              ...styles.tableData,
                              width: column.width,
                            }}
                          >
                            {row[column.key as keyof typeof row]}
                          </Text>
                        ))}
                      </View>
                    )
                  })}
              </>
            ) : (
              <Text
                style={{
                  paddingVertical: 20,
                  fontFamily: 'Open Sans',
                  fontSize: 11,
                  textAlign: 'justify',
                }}
              >
                {`Nenhuma placa foi detectada mais de uma vez nesse relatório além da própria placa monitorada.`}
              </Text>
            )}
            {data.map((group, i) => (
              <View key={i + 1} style={{ marginTop: i > 0 ? 60 : 0 }}>
                {data.length > 1 && (
                  <Text
                    style={styles.groupTitle}
                  >{`Detecção ${i + 1} da placa monitorada`}</Text>
                )}
                {data.length === 1 && (
                  <Text style={styles.groupTitle}>
                    Detecção única da placa monitorada
                  </Text>
                <View style={paramsStyle.container}>
                  {getDetectionParams(group).map(
                    (item, index) =>
                      (item === undefined ||
                        item === null ||
                        item.value !== '') && (
                        <View key={index} style={paramsStyle.row}>
                          <Text style={paramsStyle.label}>{item.label}</Text>
                          <Text>{item.value}</Text>
                        </View>
                      ),
                  )}
                {group.detections.length > 0 ? (
                  <>
                    <View style={styles.table}>
                      <View style={styles.tableRow} wrap={false}>
                        {detectionColumns.map((column, j) => (
                              ...styles.tableHeader,
                            {column.title}
                      {group.detections.map((row, i) => {
                        return (
                          <View
                            key={i}
                              ...styles.tableRow,
                              backgroundColor:
                                row.plate === params.plate ? 'yellow' : 'white',
                            wrap={false}
                            {detectionColumns.map((column, j) => (
                              <Text
                                key={j}
                                style={{
                                  ...styles.tableData,
                                  width: column.width,
                                }}
                              >
                                {column.key === 'timestamp'
                                  ? format(
                                      row.timestamp,
                                      'dd/MM/yyyy HH:mm:ss',
                                      { locale: dateConfig.locale },
                                    )
                                  : row[column.key as keyof RadarDetection]}
                              </Text>
                            ))}
                          </View>
                        )
                      })}
                    </View>
                    {data.length > 1 ? (
                        style={styles.tableCaption}
                      >{`Tabela ${i + 1}: Detecções conjuntas àquela de número ${i + 1} da placa monitorada`}</Text>
                    ) : (
                      >{`Tabela ${i + 1}: Detecções conjuntas àquela da placa monitorada`}</Text>
                    )}
                  </>
                ) : (
                  <RadarReportEmptyResult
                    fromDate={new Date(params.startTime)}
                    toDate={new Date(params.endTime)}
                  />
              </View>
            ))}
          </>
        ) : (
          <ReportEmptyResult searchParams={params} />
        )}
        <ReportFooter />
      </Page>
    </Document>
