import { useMemo, useState } from 'react'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { TerritoriesLayer } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { Checkbox } from '@/modules/vehicle-intelligence/components/ui/checkbox'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import { territoryFocusOf } from '@/modules/vehicle-intelligence/features/post-event/components/shared/territory-focus'
import { CispBoundaries } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/cisp-boundaries'
import {
  isRecurringConnection,
  originClusterPoints,
  RECURRENT_CONNECTION_MINIMUM_OCCURRENCES,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { ConnectionLines } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/connection-lines'
import { DestinationClusterMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/destination-cluster-markers'
import { DestinationMemberMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/destination-member-markers'
import {
  connectionsOfSelection,
  destinationPoleCoverage,
  poleMaximumOf,
  poleObstacles,
  viewportPointsOf,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/explorer-geometry'
import { ExplorerLegend } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/explorer-legend'
import { MapPopupCloser } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/map-popup-closer'
import { MapViewport } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/map-viewport'
import { OriginClusterMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/origin-cluster-markers'
import { OriginPointMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/origin-point-markers'
import { PoleDetailPanel } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/pole-detail-panel'
import {
  modalityName,
  PRIMARY,
  SECONDARY,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import { TerminalHubMarkers } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/terminal-hub-markers'
import { useCispGeometry } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/use-cisp-geometry'
import { usePoleSelection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/use-pole-selection'
import type { MasterPostData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { DashboardFilters } from '@/modules/vehicle-intelligence/types/domain'

export function LastLocationsExplorer({
  data,
  cispLimit,
  filters,
}: {
  data: MasterPostData
  cispLimit: number
  filters: DashboardFilters
}) {
  const [showTerritories, setShowTerritories] = useState(true)
  const {
    showCisps,
    setShowCisps,
    cispGeometry,
    cispGeometryLoading,
    cispGeometryError,
  } = useCispGeometry(filters)
  const [showLegend, setShowLegend] = useState(false)
  const {
    selectedClusterKey,
    clusterExpansion,
    viewportAnimating,
    selectedOriginId,
    selectedDestinationId,
    selectedTerminalPointId,
    selectedOrigin,
    selectedDestination,
    selectedTerminal,
    settleClusterTransition,
    clearSelection,
    openDestinationCluster,
    openOriginCluster,
    openTerminalPoint,
  } = usePoleSelection(data, () => setShowLegend(false))
  const selectedOriginPoints = useMemo(
    () => (selectedOrigin ? originClusterPoints(selectedOrigin) : []),
    [selectedOrigin],
  )
  const expandedDestinationMaximum = Math.max(
    ...(selectedDestination?.destinations.map((item) => item.occurrences) || [
      1,
    ]),
    1,
  )
  const expandedOriginMaximum = Math.max(
    ...selectedOriginPoints.map((item) => item.occurrences),
    1,
  )
  const recurringConnections = useMemo(
    () => data.cluster_connections.filter(isRecurringConnection),
    [data.cluster_connections],
  )
  const selectedConnections = useMemo(
    () =>
      connectionsOfSelection(
        recurringConnections,
        selectedOriginId,
        selectedDestinationId,
        selectedTerminalPointId,
      ),
    [
      recurringConnections,
      selectedDestinationId,
      selectedOriginId,
      selectedTerminalPointId,
    ],
  )
  const relatedOriginIds = useMemo(
    () =>
      new Set(
        selectedConnections.map((connection) => connection.origin_cluster_id),
      ),
    [selectedConnections],
  )
  const relatedDestinationIds = useMemo(
    () =>
      new Set(
        selectedConnections.map(
          (connection) => connection.destination_cluster_id,
        ),
      ),
    [selectedConnections],
  )
  const relatedTerminalIds = useMemo(
    () =>
      new Set(
        selectedConnections.map((connection) => connection.destination_hub_id),
      ),
    [selectedConnections],
  )
  // `data` muda junto com as listas de polos (cada resposta é um objeto novo): as dependências são as mesmas.
  const viewportPoints = useMemo(
    () =>
      viewportPointsOf(data, {
        terminal: selectedTerminal,
        originPoints: selectedOriginPoints,
        destination: selectedDestination,
        connections: selectedConnections,
      }),
    [
      data,
      selectedConnections,
      selectedDestination,
      selectedOriginPoints,
      selectedTerminal,
    ],
  )
  const poleMaximum = poleMaximumOf(data)
  // Os nomes de território desviam dos polos desenhados; com um polo aberto, só os perto dele e dos ligados ficam fortes.
  const territoryObstacles = useMemo(
    () => poleObstacles(data, poleMaximum),
    [data, poleMaximum],
  )
  const territoryFocus = useMemo(
    () =>
      territoryFocusOf(
        selectedDestination ?? selectedTerminal ?? selectedOrigin,
        selectedConnections,
      ),
    [
      selectedConnections,
      selectedDestination,
      selectedOrigin,
      selectedTerminal,
    ],
  )
  const selectedConnectionMaximum = Math.max(
    ...selectedConnections.map((item) => item.occurrences),
    1,
  )
  const selectedCispSet = useMemo(
    () => new Set(filters.cisps.map((code) => String(code).padStart(3, '0'))),
    [filters.cisps],
  )
  const destinationPoleCoveragePercentage = destinationPoleCoverage(data)
  const poleMarkerProps = {
    connections: data.cluster_connections,
    hasSelection: Boolean(selectedClusterKey),
    poleMaximum,
  }

  return (
    <section className="panel map-explorer-panel last-locations-section">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ANÁLISE 1 · FLUXO ENTRE POLOS</span>
          <h2>
            Dos polos de {modalityName(PRIMARY)} e {modalityName(SECONDARY)} aos
            polos de desconexão
          </h2>
          <p>
            Todo círculo representa um polo. As conexões ligam polos de
            subtração aos polos de desconexão pela própria ocorrência, sem
            desenhar uma rota viária inferida.
          </p>
        </div>
        <p className="panel-heading-note">
          {filters.cisps.length > 0 ? (
            `A CISP selecionada é a âncora territorial: ficam os polos internos e, fora do limite, só os ligados a eles por ${RECURRENT_CONNECTION_MINIMUM_OCCURRENCES}+ ocorrências.`
          ) : (
            <>
              {formatNumber(destinationPoleCoveragePercentage)}% das ocorrências
              acompanhadas terminam num polo de desconexão
              <br />O mapa mostra só conexões com{' '}
              {RECURRENT_CONNECTION_MINIMUM_OCCURRENCES}+ ocorrências
            </>
          )}
        </p>
      </div>
      <div className="last-locations-map route-map">
        <MapContainer
          className="post-event-leaflet"
          center={viewportPoints[0] || [-22.91, -43.37]}
          zoom={11}
        >
          <BaseTiles />
          <MapViewport
            points={viewportPoints}
            animate={viewportAnimating}
            detailPanelOpen={Boolean(selectedClusterKey)}
            onViewSettled={settleClusterTransition}
          />
          <MapPopupCloser selectedId={selectedClusterKey} />
          {showCisps && cispGeometry && (
            <CispBoundaries
              geometry={cispGeometry}
              selectedCisps={selectedCispSet}
            />
          )}
          {showTerritories && (
            <TerritoriesLayer
              obstacles={territoryObstacles}
              focus={territoryFocus}
            />
          )}
          <ConnectionLines
            connections={selectedConnections}
            maximum={selectedConnectionMaximum}
          />
          <DestinationClusterMarkers
            {...poleMarkerProps}
            clusters={data.destination_clusters}
            selectedId={selectedDestinationId}
            relatedIds={relatedDestinationIds}
            onOpen={openDestinationCluster}
          />
          <TerminalHubMarkers
            {...poleMarkerProps}
            hubs={data.destination_hubs}
            selectedId={selectedTerminalPointId}
            relatedIds={relatedTerminalIds}
            onOpen={openTerminalPoint}
          />
          {selectedDestination && (
            <DestinationMemberMarkers
              cluster={selectedDestination}
              maximum={expandedDestinationMaximum}
              expansion={clusterExpansion}
              cispLimit={cispLimit}
            />
          )}
          <OriginClusterMarkers
            {...poleMarkerProps}
            clusters={data.origin_clusters}
            selectedId={selectedOriginId}
            relatedIds={relatedOriginIds}
            onOpen={openOriginCluster}
          />
          {selectedOrigin && (
            <OriginPointMarkers
              origin={selectedOrigin}
              points={selectedOriginPoints}
              maximum={expandedOriginMaximum}
              expansion={clusterExpansion}
            />
          )}
        </MapContainer>
        {selectedClusterKey && (
          <PoleDetailPanel
            origin={selectedOrigin}
            destination={selectedDestination}
            terminal={selectedTerminal}
            connections={selectedConnections}
            cispLimit={cispLimit}
            onClose={clearSelection}
          />
        )}
        <div className="territory-map-checkbox">
          <Checkbox
            id="show-criminal-territories"
            checked={showTerritories}
            onCheckedChange={(checked) => setShowTerritories(checked === true)}
          />
          <Label htmlFor="show-criminal-territories">
            Territórios dominados
          </Label>
        </div>
        <div className="territory-map-checkbox cisp-map-checkbox">
          <Checkbox
            id="show-cisp-boundaries"
            checked={showCisps}
            disabled={cispGeometryLoading}
            onCheckedChange={(checked) => setShowCisps(checked === true)}
          />
          <Label htmlFor="show-cisp-boundaries">
            {cispGeometryLoading
              ? 'Carregando CISPs…'
              : cispGeometryError
                ? 'CISPs indisponíveis'
                : 'Limites de CISP'}
          </Label>
        </div>
        <ExplorerLegend
          methodology={data.methodology}
          open={showLegend}
          onToggle={() => setShowLegend((current) => !current)}
          selectedConnectionCount={selectedConnections.length}
          selectedConnectionMaximum={selectedConnectionMaximum}
          showCisps={showCisps}
          showTerritories={showTerritories}
        />
      </div>
    </section>
  )
}
