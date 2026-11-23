import { bbox, booleanPointInPolygon } from '@turf/turf'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

import { isValidGeographicCoordinates } from './geographic-coordinates'

type RioSearchArea = {
  bounds: [number, number, number, number]
  contains: (coordinates: unknown) => coordinates is [number, number]
}

let searchArea: Promise<RioSearchArea> | undefined

/** Uses the municipal neighborhood boundaries already distributed with the app. */
export function getRioSearchArea(): Promise<RioSearchArea> {
  if (!searchArea) {
    searchArea = fetch('/vehicle-intelligence/data/bairros_rio.geojson')
      .then(async (response) => {
        if (!response.ok)
          throw new Error('Não foi possível carregar o limite municipal')
        const boundaries: FeatureCollection<Polygon | MultiPolygon> =
          await response.json()
        if (!boundaries.features.length)
          throw new Error('Limite municipal vazio')
        const bounds = bbox(boundaries) as [number, number, number, number]
        return {
          bounds,
          contains: (coordinates: unknown): coordinates is [number, number] =>
            isValidGeographicCoordinates(coordinates) &&
            coordinates[0] >= bounds[0] &&
            coordinates[0] <= bounds[2] &&
            coordinates[1] >= bounds[1] &&
            coordinates[1] <= bounds[3] &&
            boundaries.features.some((boundary) =>
              booleanPointInPolygon(coordinates, boundary),
            ),
        }
      })
      .catch((error) => {
        searchArea = undefined
        throw error
      })
  }
  return searchArea
}
