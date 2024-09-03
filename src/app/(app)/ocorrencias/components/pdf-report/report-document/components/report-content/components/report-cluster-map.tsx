/* eslint-disable jsx-a11y/alt-text */
import { Image, Text, View } from '@react-pdf/renderer'

import { config } from '@/config'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

import { styles } from '../../styles'

export function ReportClusterMap() {
  const accessToken = config.mapboxAccessToken
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
      <Text style={styles.h4}>1.2 Mapa de Clusters de Denúncias</Text>
      <Text style={styles.p}>
        O mapa abaixo apresenta os agrupamentos das denúncias de acordo com os
        parâmetros buscados. Assim, todos os pontos no mapa representam
        denúncias do Disque Denúncia e/ou do 1746 aglomeradas nos locais mais
        frequentes de ocorrências, possibilitando o dimensionamento do
        quantitativo de denúncias em cada região.
      </Text>
      <Image src={mapboxUrl} />
    </View>
  )
}
