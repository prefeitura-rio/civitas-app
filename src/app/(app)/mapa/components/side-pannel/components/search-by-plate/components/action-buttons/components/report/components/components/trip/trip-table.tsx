/* eslint-disable jsx-a11y/alt-text */
import { Font, Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import alert from '@/assets/triangle-alert.png'
import type { Point } from '@/models/entities'

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
    width: '9%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  location: {
    borderRight: 1,
    width: '39%',
    paddingHorizontal: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
    textAlign: 'justify',
  },
  data: {
    textAlign: 'center',
    borderRight: 1,
    width: '13%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  time: {
    textAlign: 'center',
    borderRight: 1,
    width: '7%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  speed: {
    textAlign: 'center',
    borderRight: 1,
    width: '19%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  radar: {
    textAlign: 'center',
    width: '13%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
})

export function TripTable({ points }: TripTableProps) {
  return (
    <View style={{ flexDirection: 'column' }}>
      <View style={styles.row} wrap={false}>
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
        <View style={styles.speed}>
          <Text>Velocidade [Km/h]</Text>
        </View>
        <View style={styles.radar}>
          <Text>Radar nº</Text>
        </View>
      </View>

      {points.map((item) => {
        const location = item.location.capitalizeFirstLetter()
        const direction = item.direction.capitalizeFirstLetter()
        const district = item.district.capitalizeFirstLetter()

        return (
          <>
            <View style={styles.row} wrap={false}>
              <View style={styles.index}>
                {item.cloneAlert && (
                  <View
                    style={{
                      marginTop: -6,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Image style={{ width: 12, height: 12 }} src={alert.src} />
                  </View>
                )}
                <Text>{item.index + 1}</Text>
              </View>
              <View style={styles.location}>
                <Text>{`${location}, ${district}; Sentido: ${direction}; Faixa: ${item.lane}`}</Text>
              </View>
              <View style={styles.data}>
                <Text>{format(item.startTime, 'dd/MM/yyyy')}</Text>
              </View>
              <View style={styles.time}>
                <Text>{format(item.startTime, 'HH:mm')}</Text>
              </View>
              <View style={styles.speed}>
                <Text>{item.speed.toFixed(0)}</Text>
              </View>
              <View style={styles.radar}>
                <Text>{item.cameraNumber}</Text>
              </View>
            </View>

            <View
              style={{ position: 'absolute', bottom: 0, left: 0 }}
              fixed
            ></View>
          </>
        )
      })}
    </View>
  )
}
