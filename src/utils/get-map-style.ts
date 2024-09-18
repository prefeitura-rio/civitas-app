export enum MapStyle {
  'Map' = 'Map',
  'Satellite' = 'Satellite',
}

export function getMapStyle(mapStyle: MapStyle) {
  return mapStyle === 'Map'
    ? 'mapbox://styles/mapbox/streets-v12'
    : 'mapbox://styles/mapbox/satellite-streets-v12'
}
