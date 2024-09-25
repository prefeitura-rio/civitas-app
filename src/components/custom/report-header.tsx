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
    marginBottom: 35,
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
    padding: 2,
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
})

interface ReportHeaderProps {
  title: string
}

export function ReportHeader({ title }: ReportHeaderProps) {
  const now = new Date()
  const code = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${now.getMilliseconds().toString().padStart(3, '0')}`

  return (
    <View style={styles.header} fixed>
      <View style={styles.headerRow}>
        <View style={styles.column}>
          <View style={styles.images}>
            <Image style={styles.image} src={logoPrefeitura.src} />
            <Image style={styles.image} src={logoCivitas.src} />
          </View>
        </View>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      <View style={styles.headerRowSecond}>
        <Text style={styles.subTitle}>{`ID: ${code}`}</Text>
      </View>
    </View>
  )
}
