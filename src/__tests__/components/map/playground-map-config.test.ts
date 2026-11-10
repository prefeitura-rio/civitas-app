import type { Feature, Point } from 'geojson'
import type { StyleSpecification } from 'mapbox-gl'

import {
  createPlaygroundClusterLayers,
  createPlaygroundDrawStyles,
  createPlaygroundPointSource,
  PLAYGROUND_MAP_IDS,
} from '@/app/(app)/playground/components/map/playground-map-config'
import { getPlaygroundPointCollection } from '@/app/(app)/playground/components/map/playground-point-clusters'

const {
  expression,
  featureFilter,
  validate,
}: typeof import('mapbox-gl/dist/style-spec') = jest.requireActual(
  '../../../../node_modules/mapbox-gl/dist/style-spec/index.cjs',
)

function matchesDraw(
  type: 'Point' | 'LineString' | 'Polygon',
  properties: Record<string, unknown>,
  zoom: number,
) {
  return createPlaygroundDrawStyles().filter(
    (layer) =>
      zoom >= (layer.minzoom ?? 0) &&
      zoom < (layer.maxzoom ?? 24) &&
      featureFilter(layer.filter).filter({ zoom }, { type, properties }),
  )
}

describe('playground public Mapbox style policy', () => {
  it('validates the complete Draw and native cluster style with the installed Mapbox style-spec', () => {
    const style: StyleSpecification = {
      version: 8,
      glyphs: 'https://example.test/{fontstack}/{range}.pbf',
      sources: {
        draw: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        },
        [PLAYGROUND_MAP_IDS.pointSource]: createPlaygroundPointSource(),
      },
      layers: [
        ...createPlaygroundDrawStyles().map((layer) => ({
          ...layer,
          source: 'draw',
        })),
        ...createPlaygroundClusterLayers(),
      ],
    }

    expect(validate(style)).toEqual([])
  })

  it.each([15.99, 16, 16.99, 17, 17.01])(
    'has exactly one inactive-point renderer at zoom %s',
    (zoom) => {
      const properties = {
        meta: 'feature',
        active: 'false',
        mode: 'simple_select',
      }
      const drawPoints = matchesDraw('Point', properties, zoom)
      const nativeLeaves = createPlaygroundClusterLayers().filter(
        (layer) =>
          layer.id === PLAYGROUND_MAP_IDS.unclusteredPoints &&
          zoom < (layer.maxzoom ?? 24),
      )

      expect(drawPoints.length > 0).toBe(zoom >= 17)
      expect(nativeLeaves.length > 0).toBe(zoom < 17)
      expect(
        Number(drawPoints.length > 0) + Number(nativeLeaves.length > 0),
      ).toBe(1)
    },
  )

  it.each([12, 16.99, 17])(
    'keeps selected points editable at zoom %s without inactive styling',
    (zoom) => {
      const styles = matchesDraw(
        'Point',
        { meta: 'feature', active: 'true', mode: 'simple_select' },
        zoom,
      )
      expect(styles).toHaveLength(2)
      expect(styles.every((style) => style.id.includes('-point-active-'))).toBe(
        true,
      )
    },
  )

  it.each(['Polygon', 'LineString'] as const)(
    'preserves %s rendering and editing handles below the cluster threshold',
    (type) => {
      expect(
        matchesDraw(type, { meta: 'feature', active: 'false' }, 12).length,
      ).toBeGreaterThan(0)
      expect(
        matchesDraw(
          'Point',
          { meta: 'vertex', active: 'false', mode: 'direct_select' },
          12,
        ),
      ).toHaveLength(2)
      expect(
        matchesDraw('Point', { meta: 'midpoint', mode: 'direct_select' }, 12),
      ).toHaveLength(1)
    },
  )

  it.each(['true', 'false'])(
    'reads the public user_color property for active=%s',
    (active) => {
      const styles = matchesDraw(
        'Point',
        { meta: 'feature', active, mode: 'simple_select' },
        17,
      )
      const inner = styles.find((layer) => layer.id.endsWith('-inner'))
      if (!inner || inner.type !== 'circle')
        throw new Error('Missing inner point style')
      const compiled = expression.createExpression(
        inner.paint?.['circle-color'],
      )
      if (compiled.result !== 'success')
        throw new Error(JSON.stringify(compiled.value))

      expect(
        compiled.value.evaluate(
          { zoom: 17 },
          { type: 'Point', properties: { active, user_color: '#027516' } },
        ),
      ).toBe('#027516')
    },
  )

  it('caps all native layers at the same first Draw zoom', () => {
    const source = createPlaygroundPointSource()
    expect(source.cluster).toBe(true)
    expect(
      createPlaygroundClusterLayers().every(
        (layer) => layer.maxzoom === (source.clusterMaxZoom ?? 0) + 1,
      ),
    ).toBe(true)
  })

  it('preserves the same unselected point size and outline at the zoom handoff', () => {
    const drawStyles = matchesDraw(
      'Point',
      { meta: 'feature', active: 'false', mode: 'simple_select' },
      17,
    )
    const leafLayer = createPlaygroundClusterLayers().find(
      (layer) => layer.id === PLAYGROUND_MAP_IDS.unclusteredPoints,
    )
    const drawOuter = drawStyles.find((layer) =>
      layer.id.endsWith('-point-inactive-outer'),
    )
    const drawInner = drawStyles.find((layer) =>
      layer.id.endsWith('-point-inactive-inner'),
    )
    if (!leafLayer || leafLayer.type !== 'circle')
      throw new Error('Missing native leaf style')
    if (!drawOuter || drawOuter.type !== 'circle')
      throw new Error('Missing Draw outer point style')
    if (!drawInner || drawInner.type !== 'circle')
      throw new Error('Missing Draw inner point style')
    const drawOuterRadius = drawOuter.paint?.['circle-radius']
    const drawInnerRadius = drawInner.paint?.['circle-radius']
    const nativeRadius = leafLayer.paint?.['circle-radius']
    const nativeOutlineWidth = leafLayer.paint?.['circle-stroke-width']
    if (
      typeof drawOuterRadius !== 'number' ||
      typeof drawInnerRadius !== 'number' ||
      typeof nativeRadius !== 'number' ||
      typeof nativeOutlineWidth !== 'number'
    )
      throw new Error('Native leaf size must be pixel values')

    // Mapbox draws circle strokes outside the fill radius.
    expect(drawOuterRadius).toBe(8.5)
    expect(drawInnerRadius).toBe(7)
    expect(nativeRadius + nativeOutlineWidth).toBe(drawOuterRadius)
    expect(nativeRadius).toBe(drawInnerRadius)

    const active = matchesDraw(
      'Point',
      { meta: 'feature', active: 'true', mode: 'simple_select' },
      17,
    ).find((layer) => layer.id.endsWith('-point-active-outer'))
    if (!active || active.type !== 'circle')
      throw new Error('Missing Draw active point style')
    expect(active.paint?.['circle-radius']).toBeGreaterThan(drawOuterRadius)
  })
})

describe('playground point mirror identity', () => {
  const point: Feature<Point> = {
    type: 'Feature',
    id: 'A',
    properties: { color: '#027516' },
    geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
  }

  it('retains IDs/colors, omits selected features, and includes only complete point geometries', () => {
    const features: Feature[] = [
      point,
      { ...point, id: 'selected' },
      { ...point, id: 'draft', geometry: { type: 'Point', coordinates: [] } },
      {
        ...point,
        id: 'line',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-43, -22],
            [-44, -23],
          ],
        },
      },
    ]
    const before = JSON.stringify(features)
    const mirrored = getPlaygroundPointCollection(features, ['selected'])

    expect(mirrored.features).toEqual([
      { ...point, properties: { color: '#027516', drawFeatureId: 'A' } },
    ])
    expect(JSON.stringify(features)).toBe(before)
  })

  it('splits combined MultiPoints while retaining their shared Draw identity and color', () => {
    const mirrored = getPlaygroundPointCollection(
      [
        {
          ...point,
          id: 'combined',
          geometry: {
            type: 'MultiPoint',
            coordinates: [
              [-43, -22],
              [-44, -23],
            ],
          },
        },
      ],
      [],
    )

    expect(mirrored.features.map((feature) => feature.id)).toEqual([
      'combined:point:0',
      'combined:point:1',
    ])
    expect(
      mirrored.features.every(
        (feature) =>
          feature.properties.drawFeatureId === 'combined' &&
          feature.properties.color === '#027516',
      ),
    ).toBe(true)
  })
})
