import { Font, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { Trip } from '@/utils/formatCarPathResponse'

import { ReportFooter } from './report-footer'
import { ReportHeader } from './report-header'
import { MapView } from './trip/map-view'
import { TripTable } from './trip/trip-table'

interface ReportTripProps {
  trip: Trip
  index: number
  plate: string
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

export function ReportTrip({ trip, index, plate }: ReportTripProps) {
  const date = trip.points[0].startTime

  return (
    <>
      <ReportHeader />
      <View style={{ flexDirection: 'column', gap: 20, paddingVertical: 20 }}>
        <View style={{ flexDirection: 'column', gap: 4 }}>
          <Text
            style={{
              fontFamily: 'Open Sans',
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >{`PLACA ${plate}`}</Text>
          <Text
            style={{
              fontFamily: 'Open Sans',
              fontSize: 14,
              textAlign: 'center',
            }}
          >{`Viagem ${index + 1} - Dia ${formatDate(date, 'dd/MM/yyyy')}`}</Text>
        </View>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <MapView points={trip.points} />
          <Text
            style={{
              textAlign: 'center',
              fontFamily: 'Open Sans',
              fontSize: 11,
            }}
          >{`Figura ${index + 1}: Mapa dos pontos de detecção da viagem ${index + 1}`}</Text>
        </View>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <TripTable points={trip.points} />
          <Text
            style={{
              textAlign: 'center',
              fontFamily: 'Open Sans',
              fontSize: 11,
            }}
          >{`Tabela ${index + 1}: Pontos de detecção referentes ao mapa da figura ${index + 1}`}</Text>
        </View>
      </View>
      <ReportFooter />
    </>
  )
}
