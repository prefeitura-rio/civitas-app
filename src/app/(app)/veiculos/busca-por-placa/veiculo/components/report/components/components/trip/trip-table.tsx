/* eslint-disable jsx-a11y/alt-text */
import { Font, Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import { dateConfig } from '@/lib/date-config'
import alert from '@/assets/triangle-alert.png'
import type { Point } from '@/models/entities'
interface TripTableProps {
  points: Point[]
}
Font.registerHyphenationCallback((word) => [word])
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'black',
    marginTop: -1,
    fontSize: 11,
  },
  index: {
    textAlign: 'center',
    borderRightWidth: 1,
    width: '7%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  location: {
    width: '29%',
    paddingHorizontal: 4,
    textAlign: 'justify',
  latitude: {
    width: '12%',
  longitude: {
  data: {
  time: {
  speed: {
    width: '10%',
  radar: {
    width: '11%',
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
        <View style={styles.latitude}>
          <Text>Latitude</Text>
        <View style={styles.longitude}>
          <Text>Longitude</Text>
        <View style={styles.data}>
          <Text>Data</Text>
        <View style={styles.time}>
          <Text>Hora</Text>
        <View style={styles.speed}>
          <Text>Velocidade [Km/h]</Text>
        <View style={styles.radar}>
          <Text>Radar nº</Text>
      </View>
      {points.map((item) => {
        const location = item.location?.capitalizeFirstLetter()
        const direction = item.direction?.capitalizeFirstLetter()
        const district = item.district?.capitalizeFirstLetter()
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
              <View style={styles.latitude}>
                <Text>
                  {item.latitude !== undefined ? item.latitude.toFixed(6) : ''}
                </Text>
              <View style={styles.longitude}>
                  {item.longitude !== undefined
                    ? item.longitude.toFixed(6)
                    : ''}
              <View style={styles.data}>
                <Text>{format(item.startTime, 'dd/MM/yyyy')}</Text>
              <View style={styles.time}>
                <Text>{format(item.startTime, 'HH:mm', { locale: dateConfig.locale })}</Text>
              <View style={styles.speed}>
                <Text>{item.speed.toFixed(0)}</Text>
              <View style={styles.radar}>
                <Text>{item.cetRioCode}</Text>
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
