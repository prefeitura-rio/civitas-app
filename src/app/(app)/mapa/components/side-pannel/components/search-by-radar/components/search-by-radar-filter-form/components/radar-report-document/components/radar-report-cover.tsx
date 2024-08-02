import '@/utils/string-extensions'

import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import type { Radar } from '@/models/entities'

interface RadarReportCoverProps {
  radar: Radar
  fromDate: Date
  toDate: Date
  totalDetections: number
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Times-Roman',
    flexDirection: 'column',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  label: {
    fontWeight: 'bold',
  },
})

export function RadarReportCover({
  radar,
  fromDate,
  toDate,
  totalDetections,
}: RadarReportCoverProps) {
  const rows = [
    {
      label: 'Código do radar (CIVITAS):',
      value: radar.cameraNumber,
    },
    {
      label: 'Código do radar (CET-Rio):',
      value: radar.cetRioCode,
    },
    {
      label: 'Período analisado:',
      value: `De ${format(fromDate, 'dd/MM/yyyy HH:mm:ss')} até ${format(toDate, 'dd/MM/yyyy HH:mm:ss')}`,
    },
    {
      label: 'Localização:',
      value: radar.location.capitalizeFirstLetter(),
    },
    {
      label: 'Bairro:',
      value: radar.district.capitalizeFirstLetter(),
    },
    {
      label: 'Latitude:',
      value: radar.latitude,
    },
    {
      label: 'Longitude:',
      value: radar.longitude,
    },
    {
      label: 'Total de placas detectadas:',
      value: totalDetections,
    },
  ]

  return (
    <View style={styles.container}>
      {rows.map((item) => (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Text>{item.value}</Text>
        </View>
      ))}
    </View>
  )
}
