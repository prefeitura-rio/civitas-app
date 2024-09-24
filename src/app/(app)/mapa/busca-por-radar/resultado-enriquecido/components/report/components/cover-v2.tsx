import '@/utils/string-extensions'

import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

interface RadarReportCoverProps {
  radarIds: string[]
  location: string
  latitude: number
  longitude: number
  fromDate: Date
  toDate: Date
  totalDetections: number
  colors?: string[]
  brandModels?: string[]
  plate?: string
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
  radarIds,
  latitude,
  longitude,
  location,
  fromDate,
  toDate,
  totalDetections,
  brandModels,
  colors,
  plate,
}: RadarReportCoverProps) {
  const commons = [
    {
      label: 'Localização:',
      value: location,
    },
    {
      label: 'Período analisado:',
      value: `De ${formatDate(fromDate, 'dd/MM/yyyy HH:mm:ss')} até ${formatDate(toDate, 'dd/MM/yyyy HH:mm:ss')}`,
    },
    {
      label: 'Placa:',
      value: plate,
    },
    {
      label: 'Latitude:',
      value: latitude,
    },
    {
      label: 'Longitude:',
      value: longitude,
    },
    {
      label: 'Total de placas detectadas:',
      value: totalDetections,
    },
    {
      label: 'Radares:',
      value: radarIds.join(', '),
    },
    {
      label: 'Cores:',
      value: colors?.join(', '),
    },
    {
      label: 'Marca/Modelos:',
      value: brandModels?.join(', '),
    },
  ]

  return (
    <View style={styles.container}>
      {commons.map(
        (item, index) =>
          !!item.value && (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text>{item.value}</Text>
            </View>
          ),
      )}
    </View>
  )
}
