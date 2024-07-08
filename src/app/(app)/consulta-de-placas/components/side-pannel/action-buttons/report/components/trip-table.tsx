import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import type { Point } from '@/utils/formatCarPathResponse'
import { toPascalCase } from '@/utils/toPascalCase'

interface TripTableProps {
  points: Point[]
}

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    border: 1,
    borderColor: 'black',
    marginTop: -1,
    fontSize: 11,
  },
  index: {
    textAlign: 'center',
    borderRight: 1,
    width: '15%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  location: {
    borderRight: 1,
    width: '50%',
    paddingHorizontal: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
    textAlign: 'justify',
  },
  data: {
    textAlign: 'center',
    borderRight: 1,
    width: '22%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  time: {
    textAlign: 'center',
    borderRight: 1,
    width: '12%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  radar: {
    textAlign: 'center',
    width: '22%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
})

export function TripTable({ points }: TripTableProps) {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={styles.row}>
        <View style={styles.index}>
          <Text>Posição</Text>
        </View>
        <View style={styles.location}>
          <Text>Local (via, logradouro)</Text>
        </View>
        <View style={styles.data}>
          <Text>Data</Text>
        </View>
        <View style={styles.time}>
          <Text>Hora</Text>
        </View>
        <View style={styles.radar}>
          <Text>Radar nº</Text>
        </View>
      </View>

      {points.map((item, index) => {
        const location = toPascalCase(item.location)
        const direction = toPascalCase(item.direction)

        return (
          <View style={styles.row} wrap={false}>
            <View style={styles.index}>
              <Text>{index + 1}</Text>
            </View>
            <View style={styles.location}>
              <Text>{`${location}; Sentido: ${direction}; Faixa: ${item.lane}`}</Text>
            </View>
            <View style={styles.data}>
              <Text>{format(item.startTime, 'dd/MM/yyyy')}</Text>
            </View>
            <View style={styles.time}>
              <Text>{format(item.startTime, 'HH:mm')}</Text>
            </View>
            <View style={styles.radar}>
              <Text>{item.cameraNumber}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
