import { Font, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { Point, Trip } from '@/models/entities'
import { haversineDistance } from '@/utils/haversine-distance'

import { MapView } from './trip/map-view'
import { TripTable } from './trip/trip-table'

interface ReportTripProps {
  trip: Trip
  plate: string
  useImgCounter: () => number
  useTableCounter: () => number
}

Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600,
    },
  ],
})

export function ReportTrip({ trip, plate, useImgCounter }: ReportTripProps) {
  const date = trip.points[0].startTime

  const hash = new Set<string>()
  let mapPoints: Point[] = []
  const tripChuncks: Point[][] = []

  trip.points.forEach((point) => {
    const coordinates = point.from.toString()

    const distance =
      point.to && mapPoints.length >= 1
        ? haversineDistance({
            pointA: mapPoints[mapPoints.length - 1].from, // Last point
            pointB: point.from, // Current point
          })
        : 0
    console.log(distance)
    if (hash.has(coordinates) || distance > 5000 || mapPoints.length >= 10) {
      tripChuncks.push([...mapPoints])
      hash.clear()
      mapPoints = []
    }

    mapPoints.push(point)
    hash.add(coordinates)

    if (!point.to) {
      tripChuncks.push([...mapPoints])
    }
  })

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: 20,
        paddingBottom: 20,
        zIndex: 10,
      }}
    >
      <Text
        style={{
          marginTop: 20,
          fontFamily: 'Open Sans',
          fontSize: 16,
          fontWeight: 600,
          textAlign: 'center',
        }}
        fixed
      >{`PLACA ${plate}`}</Text>

      {tripChuncks.map((tripChunck, index) => (
        <View key={index} style={{ flexDirection: 'column', gap: 16 }}>
          <View style={{ flexDirection: 'column', gap: 2 }} wrap={false}>
            <Text
              style={{
                fontFamily: 'Open Sans',
                fontSize: 14,
                textAlign: 'center',
              }}
            >{`Viagem ${trip.index + 1} - Dia ${formatDate(date, 'dd/MM/yyyy')}${tripChuncks.length > 1 ? ` - Parte ${index + 1} de ${tripChuncks.length}` : ''}:`}</Text>
            <MapView points={tripChunck} />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontSize: 11,
              }}
            >
              {tripChunck.length === 1
                ? `Figura ${useImgCounter()}: Mapa do ponto de detecção de posição ${tripChunck[0].index + 1} referente à viagem ${trip.index + 1}.`
                : `Figura ${useImgCounter()}: Mapa dos pontos de detecção de posição ${tripChunck[0].index + 1} a ${tripChunck[tripChunck.length - 1].index + 1} referentes à viagem ${trip.index + 1}.`}
            </Text>
          </View>

          <View style={{ flexDirection: 'column', gap: 2 }}>
            <TripTable points={tripChunck} />
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Open Sans',
                fontSize: 11,
              }}
            >
              {tripChunck.length === 1
                ? `Tabela ${useImgCounter()}: Ponto de detecção de posição ${tripChunck[0].index + 1} referente à viagem ${trip.index + 1}.`
                : `Tabela ${useImgCounter()}: Pontos de detecção de posição ${tripChunck[0].index + 1} a ${tripChunck[tripChunck.length - 1].index + 1} referentes à viagem ${trip.index + 1}.`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
