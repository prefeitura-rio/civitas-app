/** Posição da leitura no mapa e a distância em linha reta entre dois pontos. */
import type { Detection } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

export function detectionPoint(detection: Detection): [number, number] {
  return [detection.latitude, detection.longitude]
}
export function straightDistanceKm(
  from: Pick<Detection, 'latitude' | 'longitude'>,
  to: Pick<Detection, 'latitude' | 'longitude'>,
) {
  const earthRadiusKm = 6371
  const radians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = radians(to.latitude - from.latitude)
  const longitudeDelta = radians(to.longitude - from.longitude)
  const fromLatitude = radians(from.latitude)
  const toLatitude = radians(to.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2
  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}
