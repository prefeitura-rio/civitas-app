import type { Feature, Polygon } from 'geojson'

import { getCollectionPointIdsWithinPolygon } from '@/components/custom/collection-point-picker/collection-point-picker-utils'
import type { CollectionPoint } from '@/models/entities'

const collectionPoints: CollectionPoint[] = [
  {
    cetRioCode: 'RADAR-1',
    company: null,
    latitude: -22.9058,
    longitude: -43.1729,
    location: 'Centro',
    district: 'Centro',
    direction: null,
    lastDetectionTime: null,
    activeInLast24Hours: true,
    lane: null,
  },
  {
    cetRioCode: 'RADAR-2',
    company: null,
    latitude: -22.9072,
    longitude: -43.1754,
    location: 'Lapa',
    district: 'Centro',
    direction: null,
    lastDetectionTime: null,
    activeInLast24Hours: true,
    lane: null,
  },
  {
    cetRioCode: 'RADAR-3',
    company: null,
    latitude: -22.915,
    longitude: -43.2,
    location: 'Botafogo',
    district: 'Zona Sul',
    direction: null,
    lastDetectionTime: null,
    activeInLast24Hours: false,
    lane: null,
  },
]

describe('getCollectionPointIdsWithinPolygon', () => {
  it('returns the radars inside the drawn polygon', () => {
    const polygon: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-43.18, -22.91],
            [-43.17, -22.91],
            [-43.17, -22.9],
            [-43.18, -22.9],
            [-43.18, -22.91],
          ],
        ],
      },
    }

    expect(
      getCollectionPointIdsWithinPolygon(collectionPoints, polygon),
    ).toEqual(['RADAR-1', 'RADAR-2'])
  })

  it('returns an empty list for unsupported geometry', () => {
    const lineFeature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-43.18, -22.91],
          [-43.17, -22.9],
        ],
      },
    }

    expect(
      getCollectionPointIdsWithinPolygon(collectionPoints, lineFeature),
    ).toEqual([])
  })
})
