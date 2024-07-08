/* eslint-disable jsx-a11y/alt-text */
import { Font, Image, StyleSheet, Text, View } from '@react-pdf/renderer'

import logoCivitas from '@/assets/CIVITAS_h_azul_completa.png'
import logoPrefeitura from '@/assets/prefeitura-do-rio-logo.png'

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  header: {
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'column',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerRowSecond: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingVertical: 2,
  },
  column: {
    width: '35%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    height: 30,
  },
  title: {
    width: '65%',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 2,
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
})

export function ReportHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.column}>
          <View style={styles.images}>
            <Image style={styles.image} src={logoPrefeitura.src} />
            <Image style={styles.image} src={logoCivitas.src} />
          </View>
        </View>
        <Text style={styles.title}>
          RELATÓRIO DE IDENTIFICAÇÃO DE PONTOS DE DETECÇÃO
        </Text>
      </View>
      <View style={styles.headerRowSecond}>
        <Text style={styles.subTitle}>Nº 0008/2024</Text>
      </View>
    </View>
  )
}
