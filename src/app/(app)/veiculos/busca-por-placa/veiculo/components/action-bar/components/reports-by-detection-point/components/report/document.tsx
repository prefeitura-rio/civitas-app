import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import { RadarReportEmptyResult } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/report/components/radar-report-empty-result'
import { ReportFooter } from '@/components/custom/report-footer'
import { ReportHeader } from '@/components/custom/report-header'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import type { RadarDetection } from '@/models/entities'

type ReportDataRow = {
  detections: DetectionDTO[]
  monitoredPlateTimestamp: string
  from: string
  to: string
  groupLocation: string
  latitude: number
  longitude: number
  totalDetections: number
  radarIds: string[]
}
export type ReportData = ReportDataRow[]

interface ReportDocumentProps {
  data: ReportData
  params: {
    plate: string
    endTime: string
    startTime: string
  }
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
    fontFamily: 'Times-Roman',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    // marginBottom: 12,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // marginTop: 20,
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

const paramsStyle = StyleSheet.create({
  container: {
    fontFamily: 'Times-Roman',
    flexDirection: 'column',
    fontSize: 11,
    marginTop: 12,
    marginBottom: 18,
    marginRight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  label: {
    fontWeight: 'bold',
  },
})

const columns = [
  { title: 'Data e Hora', width: '25%', key: 'timestamp' },
  { title: 'Placa', width: '15%', key: 'plate' },
  { title: 'Radar', width: '15%', key: 'cameraNumber' },
  { title: 'Faixa', width: '10%', key: 'lane' },
  { title: 'Velocidade [Km/h]', width: '20%', key: 'speed' },
]

export function ReportDocument({ data, params }: ReportDocumentProps) {
  const reportTitle = 'Relatório de detecções conjuntas por radar'

  const coverParams = [
    {
      label: 'Placa monitorada:',
      value: params.plate,
    },
    {
      label: 'Período analisado:',
      value: `De ${format(params.startTime, 'dd/MM/yyyy HH:mm:ss')} até ${format(params.endTime, 'dd/MM/yyyy HH:mm:ss')}`,
    },
    {
      label: 'Total de detecções da placa monitorada:',
      value: data.length,
    },
    {
      label: 'Total de detecções de todos os radares e placas:',
      value: data.reduce((acc, group) => acc + group.totalDetections, 0),
    },
  ]

  const getDetectionParams = (data: ReportDataRow) => {
    return [
      {
        label: 'Data e hora da detecção da placa monitorada:',
        value: format(data.monitoredPlateTimestamp, 'dd/MM/yyyy HH:mm:ss'),
      },
      {
        label: 'Período analisado:',
        value: `De ${format(data.from, 'dd/MM/yyyy HH:mm:ss')} até ${format(data.to, 'dd/MM/yyyy HH:mm:ss')}`,
      },
      {
        label: 'Radares:',
        value: data.radarIds.join(', '),
      },
      {
        label: 'Coordenadas:',
        value: `Latitude: ${data.latitude}, Longitude: ${data.longitude}`,
      },
      {
        label: 'Endereço:',
        value: data.groupLocation,
      },
      {
        label: 'Total de detecções:',
        value: data.totalDetections,
      },
    ]
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title={reportTitle} />

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

        {data.map((group, i) => (
          <View key={i + 1} style={{ marginTop: i > 0 ? 60 : 0 }}>
            {data.length > 1 && (
              <Text
                style={styles.groupTitle}
              >{`Detecção ${i + 1} da placa monitorada`}</Text>
            )}
            {data.length === 1 && (
              <Text style={styles.groupTitle}>
                Deteção única da placa monitorada
              </Text>
            )}
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
            </View>
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
                      <View
                        key={i}
                        style={{
                          ...styles.tableRow,
                          backgroundColor:
                            row.plate === params.plate ? 'yellow' : 'white',
                        }}
                        wrap={false}
                      >
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
                  >{`Tabela ${i + 1}: Detecções conjuntas àquela de número ${i + 1} da placa monitorada`}</Text>
                ) : (
                  <Text
                    style={styles.tableCaption}
                  >{`Tabela ${i + 1}: Detecções conjuntas àquela da placa monitorada`}</Text>
                )}
              </>
            ) : (
              <RadarReportEmptyResult
                fromDate={new Date(params.startTime)}
                toDate={new Date(params.endTime)}
              />
            )}
          </View>
        ))}

        <ReportFooter />
      </Page>
    </Document>
  )
}