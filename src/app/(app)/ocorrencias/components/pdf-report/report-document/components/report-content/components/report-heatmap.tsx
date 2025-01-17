/* eslint-disable jsx-a11y/alt-text */
import { Image, Text, View } from '@react-pdf/renderer'

import { getEnv } from '@/env/server'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

import { styles } from '../../styles'

export async function ReportHeatmap() {
  const env = await getEnv()
  const accessToken = env.MAPBOX_ACCESS_TOKEN
  const mapStyle = 'mapbox/streets-v12'
  const mapWidth = '800'
  const mapHeight = '550'

  const lon = INITIAL_VIEW_PORT.longitude.toString()
  const lat = INITIAL_VIEW_PORT.latitude.toString()
  const zoom = INITIAL_VIEW_PORT.zoom.toString()
  const bearing = '0'
  const pitch = '0'
  const viewport = `${lon},${lat},${zoom},${bearing},${pitch}`

  const mapboxUrl = `https://api.mapbox.com/styles/v1/${mapStyle}/static/${viewport}/${mapWidth}x${mapHeight}?access_token=${accessToken}`

  return (
    <View style={styles.contentModuloContainer}>
      <Text style={styles.h4}>1.1 Mapa de Calor</Text>
      <Text style={styles.p}>
        O mapa abaixo apresenta os pontos quentes de denúncias (DD e/ou 1746) de
        acordo com os parâmetros buscados.
      </Text>
      <Image src={mapboxUrl} />
    </View>
  )
}
