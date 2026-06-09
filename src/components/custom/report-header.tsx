/* eslint-disable jsx-a11y/alt-text */
import { Font, Image, StyleSheet, Text, View } from '@react-pdf/renderer'

import logoPrefeituraCivitas from '@/assets/pref-civitas-horizontal_Azul_transparente.png'

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
    alignItems: 'stretch',
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
    width: 180,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  images: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  image: {
    width: 171,
    height: 22.46,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 1.1,
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
            <Image style={styles.image} src={logoPrefeituraCivitas.src} />
          </View>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.headerRowSecond}>
        <Text style={styles.subTitle}>{`ID: ${code}`}</Text>
      </View>
    </View>
  )
}
