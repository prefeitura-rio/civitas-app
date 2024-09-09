/* eslint-disable jsx-a11y/alt-text */
import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'

import logoCivitas from '@/assets/CIVITAS_h_azul_completa.png'
import logoPrefeitura from '@/assets/prefeitura-do-rio-logo.png'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pageIndex: {},
  text: {},
  images: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingVertical: 2,
  },
  image: {
    width: 'auto',
    height: 20,
  },
})

export function ReportFooter() {
  return (
    <View style={styles.container} fixed debug>
      <Text>
        Este relatório foi gerado com base nos dados do Sistema Cerco Digital
      </Text>
      <View style={styles.images}>
        <Image style={styles.image} src={logoPrefeitura.src} />
        <Image style={styles.image} src={logoCivitas.src} />
      </View>
      <Text
        style={{ fontSize: 10 }}
        render={({ pageNumber }) => pageNumber}
      ></Text>
    </View>
  )
}
