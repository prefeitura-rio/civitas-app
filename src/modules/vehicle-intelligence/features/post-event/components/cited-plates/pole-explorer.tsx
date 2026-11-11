import { useCallback, useMemo, useState } from 'react'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { TerritoriesLayer } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { Checkbox } from '@/modules/vehicle-intelligence/components/ui/checkbox'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import { ConnectionLines } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/connection-lines'
import { DestinationPoleMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/destination-pole-markers'
import { ExplorerSide } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/explorer-side'
import { MapLegend } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/map-legend'
import { MapResize } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/map-resize'
import { MapViewport } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/map-viewport'
import { OriginPointMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/origin-point-markers'
import { OriginPoleMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/origin-pole-markers'
import {
  connectionsOfPole,
  explorerViewport,
  originPoints,
  poleObstacles,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { PopupCloser } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/popup-closer'
import { RadarMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/radar-markers'
import { usePoleSelection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/use-pole-selection'
import { territoryFocusOf } from '@/modules/vehicle-intelligence/features/post-event/components/shared/territory-focus'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function PoleExplorer({
  data,
  active,
  onlyTracked,
  onOpenPlate,
}: {
  data: PostEventData
  active: boolean
  onlyTracked: boolean
  onOpenPlate: (plate: string) => void
}) {
  const [showTerritories, setShowTerritories] = useState(true)
  const [legendOpen, setLegendOpen] = useState(false)
  const closeLegend = useCallback(() => setLegendOpen(false), [])
  const { selection, expansion, animating, settle, clear, open } =
    usePoleSelection(closeLegend)
  const origin = selection?.startsWith('origin:')
    ? (data.origin_poles.find((pole) => pole.id === selection.slice(7)) ?? null)
    : null
  const destination = selection?.startsWith('destination:')
    ? (data.destination_poles.find((pole) => pole.id === selection.slice(12)) ??
      null)
    : null
  const connections = useMemo(
    () => connectionsOfPole(data.pole_connections, origin, destination),
    [data.pole_connections, destination, origin],
  )
  const relatedOrigins = useMemo(
    () => new Set(connections.map((connection) => connection.origin_id)),
    [connections],
  )
  const relatedDestinations = useMemo(
    () => new Set(connections.map((connection) => connection.destination_id)),
    [connections],
  )
  const points = useMemo(() => (origin ? originPoints(origin) : []), [origin])
  const visibleOrigins = useMemo(
    () =>
      data.origin_poles.filter(
        (pole) => !onlyTracked || pole.tracked_occurrences > 0,
      ),
    [data.origin_poles, onlyTracked],
  )
  // `data` muda junto com as listas de polos (cada resposta é um objeto novo): as dependências são as mesmas.
  const viewport = useMemo(
    () => explorerViewport(data, { origin, destination, points, connections }),
    [connections, data, destination, origin, points],
  )
  const originMax = Math.max(
    ...data.origin_poles.map((pole) => pole.occurrences),
    1,
  )
  const destinationMax = Math.max(
    ...data.destination_poles.map((pole) => pole.occurrences),
    1,
  )
  const connectionMax = Math.max(
    ...connections.map((connection) => connection.occurrences),
    1,
  )
  const radarMax = Math.max(
    ...(destination?.radars.map((radar) => radar.occurrences) ?? [1]),
    1,
  )
  const pointMax = Math.max(...points.map((point) => point.events.length), 1)
  // Os nomes de território desviam dos polos desenhados; com um polo aberto, só os perto dele e dos ligados ficam fortes.
  const territoryObstacles = useMemo(
    () =>
      poleObstacles(
        visibleOrigins,
        data.destination_poles,
        originMax,
        destinationMax,
      ),
    [data.destination_poles, destinationMax, originMax, visibleOrigins],
  )
  const territoryFocus = useMemo(
    () => territoryFocusOf(origin ?? destination, connections),
    [connections, destination, origin],
  )

  return (
    <section className="panel explorer-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ANÁLISE 1 · FLUXO ENTRE POLOS</span>
          <h2>Dos polos de roubo e furto aos polos de desconexão</h2>
          <p>
            Abra um polo para ver os pontos que o formam, as placas citadas que
            passaram por ele e para onde elas foram depois do fato.
          </p>
        </div>
        <p className="panel-heading-note">
          {formatNumber(data.cluster_coverage.destination_pairs_clustered)} de{' '}
          {formatNumber(data.cluster_coverage.destination_pairs)} desconexões
          caem num polo
          <br />
          {formatNumber(
            data.cluster_coverage.tracked_events_in_origin_poles,
          )}{' '}
          ocorrências dentro de um polo de origem
        </p>
      </div>
      <div className="explorer-layout">
        <div className="explorer-map">
          <MapContainer
            className="post-event-leaflet"
            center={[-22.95, -43.19]}
            zoom={13}
            zoomControl
          >
            <BaseTiles />
            {showTerritories && (
              <TerritoriesLayer
                obstacles={territoryObstacles}
                focus={territoryFocus}
              />
            )}
            <MapResize active={active} />
            <MapViewport
              points={viewport}
              active={active}
              animate={animating}
              onSettled={settle}
            />
            <PopupCloser selection={selection} />
            <ConnectionLines
              connections={connections}
              maximum={connectionMax}
              expansion={expansion}
            />
            <OriginPoleMarkers
              poles={visibleOrigins}
              selectedId={origin?.id}
              hasSelection={Boolean(selection)}
              relatedIds={relatedOrigins}
              maximum={originMax}
              onOpen={open}
            />
            <DestinationPoleMarkers
              poles={data.destination_poles}
              selectedId={destination?.id}
              hasSelection={Boolean(selection)}
              relatedIds={relatedDestinations}
              maximum={destinationMax}
              onOpen={open}
            />
            {destination && (
              <RadarMarkers
                destination={destination}
                maximum={radarMax}
                expansion={expansion}
                onOpenPlate={onOpenPlate}
              />
            )}
            {origin && (
              <OriginPointMarkers
                origin={origin}
                points={points}
                maximum={pointMax}
                expansion={expansion}
                onOpenPlate={onOpenPlate}
              />
            )}
          </MapContainer>
          <div className="territory-map-checkbox">
            <Checkbox
              id="show-territories-cited"
              checked={showTerritories}
              onCheckedChange={(checked) =>
                setShowTerritories(checked === true)
              }
            />
            <Label htmlFor="show-territories-cited">
              Territórios dominados
            </Label>
          </div>
          <MapLegend
            data={data}
            open={legendOpen}
            setOpen={setLegendOpen}
            territories={showTerritories}
          />
        </div>
        <ExplorerSide
          data={data}
          selection={selection}
          origin={origin}
          destination={destination}
          connections={connections}
          onOpenPlate={onOpenPlate}
          onSelect={open}
          onClose={clear}
        />
      </div>
    </section>
  )
}
