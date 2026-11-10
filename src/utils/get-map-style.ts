export enum MapStyle {
  'Map' = 'Map',
  'Satellite' = 'Satellite',
  'Dark' = 'Dark',
}

export function getMapStyle(mapStyle: MapStyle) {
  switch (mapStyle) {
    case MapStyle.Satellite:
      return 'mapbox://styles/mapbox/satellite-streets-v12'
    case MapStyle.Dark:
      return 'mapbox://styles/mapbox/dark-v11'
    case MapStyle.Map:
    default:
      return 'mapbox://styles/mapbox/streets-v12'
  }
}
