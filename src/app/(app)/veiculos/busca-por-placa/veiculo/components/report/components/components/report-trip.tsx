import { Font, Text, View } from '@react-pdf/renderer'

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
  const hash = new Set<string>() // Conjunto de hash para armazenar as coordenadas dos pontos no chunk atual
  let mapPoints: Point[] = [] // Array para armazenar os pontos no chunk atual
  const tripChuncks: Point[][] = [] // Array para armazenar os chunks de pontos

  // Para cada ponto na viagem, adiciona-o ao chunk atual ou cria um novo
  trip.points.forEach((point, index) => {
    const coordinates = point.from.toString()

    // Se ainda há um próximo ponto, calcula a distância entre o último ponto e o ponto atual
    // Se não, distance = 0
    const distance =
      point.to && mapPoints.length >= 1
        ? haversineDistance({
            pointA: mapPoints[mapPoints.length - 1].from, // Último ponto
            pointB: point.from, // Ponto atual
          })
        : 0

    // Verifica se deve finalizar o chunk atual
    // 1. Se houver mais de um ponto nas mesmas coordenadas no chunk atual
    // 2. Se a distância entre o último ponto e o ponto atual for maior que 5000 metros
    // 3. Se o chunk atual já tiver 10 pontos
    if (hash.has(coordinates) || distance > 5000 || mapPoints.length >= 10) {
      tripChuncks.push([...mapPoints]) // Salva o chunk atual de pontos
      hash.clear() // Limpa o conjunto de hash para o próximo chunk
      mapPoints = [] // Reseta mapPoints para o próximo chunk
    }

    // Adiciona o ponto atual ao mapPoints
    mapPoints.push(point) // Adiciona o ponto atual ao mapPoints
    hash.add(coordinates) // Adiciona as coordenadas do ponto atual ao conjunto de hash

    // Se o ponto atual é o último, salva o chunk atual de pontos
    if (index === trip.points.length - 1 && mapPoints.length > 0) {
      tripChuncks.push([...mapPoints])
      mapPoints = [] // Reseta mapPoints após adicionar o último chunk
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
            >{`Viagem ${trip.index + 1}${tripChuncks.length > 1 ? ` - Parte ${index + 1} de ${tripChuncks.length}` : ''}:`}</Text>
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
