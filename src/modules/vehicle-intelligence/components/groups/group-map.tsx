/**
 * Território e circulação do perfil do grupo: o mapa de polos. Cada polo é um local de leitura (câmera) num tipo:
 * partida (primeira leitura do dia do fato), passagem junta (2+ placas do grupo na mesma câmera perto da hora do
 * fato) e desconexão (último local antes de 8 h sem leitura). O número é quantas leituras do grupo caem ali.
 * Clicar num polo, na lista ou no mapa, mostra as placas, os horários e os ROs ligados a ele.
 */
import { useMemo, useState } from 'react'
import { CircleMarker, Marker, Polyline, Tooltip } from 'react-leaflet'

import { Toggle } from '@/modules/vehicle-intelligence/components/groups/controls'
import { FitSelection } from '@/modules/vehicle-intelligence/components/groups/pole-map/fit-selection'
import { PointKindSymbol } from '@/modules/vehicle-intelligence/components/groups/pole-map/point-kind-symbol'
import { PoleDetail } from '@/modules/vehicle-intelligence/components/groups/pole-map/pole-detail'
import { poleIcon } from '@/modules/vehicle-intelligence/components/groups/pole-map/pole-icon'
import { PoleList } from '@/modules/vehicle-intelligence/components/groups/pole-map/pole-list'
import {
  buildPoles,
  KIND_ORDER,
  POINT_KINDS,
  type PoleMapData,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'
import { TerritorySummary } from '@/modules/vehicle-intelligence/components/groups/pole-map/territory-summary'
import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { FitBounds } from '@/modules/vehicle-intelligence/components/map/fit-bounds'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import {
  type MapObstacle,
  TerritoriesLayer,
} from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { shortAddress } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  GroupEvent,
  PointKind,
} from '@/modules/vehicle-intelligence/types/groups'

/**
 * `showPlateList`: os botões que ligam e desligam cada placa (o território, com dezenas de placas, não mostra);
 * `showSummary`: a faixa "Parte de · Passa junto por · Desconecta perto de"; `footnote`: o texto sob o mapa.
 */
export function PoleMap({
  data,
  colors,
  showPlateList = true,
  showSummary = true,
  footnote,
}: {
  data: PoleMapData
  colors: Record<string, string>
  showPlateList?: boolean
  showSummary?: boolean
  footnote?: string
}) {
  const [kindFilter, setKindFilter] = useState<'all' | PointKind>('all')
  // Só os tipos que existem nos dados (o território não tem passagem junta).
  const kinds = useMemo(
    () =>
      KIND_ORDER.filter((kind) =>
        data.points.some((point) => point.kind === kind),
      ),
    [data],
  )
  const [hiddenPlates, setHiddenPlates] = useState<string[]>([])
  const [showEvents, setShowEvents] = useState(false)
  const [showTerritories, setShowTerritories] = useState(true)
  const [showSingleReads, setShowSingleReads] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const plates = useMemo(
    () =>
      new Set(
        data.members
          .map((m) => m.plate)
          .filter((p) => !hiddenPlates.includes(p)),
      ),
    [data, hiddenPlates],
  )
  const visiblePoles = useMemo(
    () =>
      buildPoles(
        data.points,
        plates,
        kindFilter === 'all' ? KIND_ORDER : [kindFilter],
      ).filter((pole) => showSingleReads || pole.count >= 2),
    [data, plates, kindFilter, showSingleReads],
  )
  const selectedPole =
    visiblePoles.find((item) => item.id === selectedId) ?? null
  const eventsById = useMemo(
    () => new Map(data.events.map((e) => [e.event_id, e])),
    [data],
  )
  const hasLocation = (
    groupEvent: GroupEvent | undefined,
  ): groupEvent is GroupEvent =>
    Boolean(
      groupEvent && groupEvent.latitude != null && groupEvent.longitude != null,
    )
  const visibleEvents = useMemo(
    () =>
      selectedPole
        ? selectedPole.events
            .map((id) => eventsById.get(id))
            .filter(hasLocation)
        : showEvents
          ? data.events.filter(hasLocation)
          : [],
    [selectedPole, showEvents, eventsById, data],
  )
  const relevantComplexes = useMemo(
    () =>
      new Set(
        [
          ...(data.territory?.departure ?? []),
          ...(data.territory?.disconnection ?? []),
        ].map((item) => item.complex),
      ),
    [data],
  )
  const initialPoints = useMemo(
    () => [
      ...visiblePoles.map((p) => [p.lat, p.lng] as [number, number]),
      ...data.events
        .filter(hasLocation)
        .map((e) => [e.latitude!, e.longitude!] as [number, number]),
    ],
    // Só o primeiro enquadramento usa isso; a lista muda com os filtros sem reenquadrar.
    // Dependências incompletas de propósito.
    [data],
  )
  const selectionPoints = useMemo(
    () =>
      selectedPole
        ? [
            [selectedPole.lat, selectedPole.lng] as [number, number],
            ...selectedPole.events
              .map((id) => eventsById.get(id))
              .filter(hasLocation)
              .map((e) => [e.latitude!, e.longitude!] as [number, number]),
          ]
        : null,
    [selectedPole, eventsById],
  )
  // Os nomes dos complexos desviam dos polos e dos fatos desenhados (o raio é metade do ícone, como em `poleIcon`).
  const obstacles = useMemo<MapObstacle[]>(
    () => [
      ...visiblePoles.map((item) => {
        const d = Math.min(18 + Math.sqrt(item.count) * 7, 46)
        return {
          lat: item.lat,
          lng: item.lng,
          radius: (item.kind === 'passage' ? d * 0.86 : d) / 2,
        }
      }),
      ...visibleEvents.map((groupEvent) => ({
        lat: groupEvent.latitude!,
        lng: groupEvent.longitude!,
        radius: selectedPole ? 6 : 4.5,
      })),
    ],
    [visiblePoles, visibleEvents, selectedPole],
  )
  const togglePlate = (plate: string) =>
    setHiddenPlates((current) =>
      current.includes(plate)
        ? current.filter((p) => p !== plate)
        : current.length + 1 >= data.members.length
          ? current
          : [...current, plate],
    )

  return (
    <>
      {showSummary && <TerritorySummary data={data} />}
      <div className="group-map-controls">
        <div className="group-map-filters">
          <div
            className="group-segments"
            role="group"
            aria-label="Tipo de polo"
          >
            {(['all', ...kinds] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={kindFilter === value}
                className={kindFilter === value ? 'active' : ''}
                onClick={() => {
                  setKindFilter(value)
                  setSelectedId(null)
                }}
              >
                {value !== 'all' && <PointKindSymbol kind={value} size={10} />}
                {value === 'all' ? 'Tudo' : POINT_KINDS[value].plural}
              </button>
            ))}
          </div>
          {showPlateList && (
            <div className="group-map-plates">
              {data.members.map((m) => {
                const visible = !hiddenPlates.includes(m.plate)
                return (
                  <button
                    key={m.plate}
                    type="button"
                    aria-pressed={visible}
                    title="Mostrar ou esconder esta placa"
                    className={visible ? '' : 'off'}
                    onClick={() => togglePlate(m.plate)}
                  >
                    <i
                      style={{
                        background: visible ? colors[m.plate] : 'transparent',
                        borderColor: colors[m.plate],
                      }}
                      aria-hidden="true"
                    />
                    {m.plate}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="group-map-keys">
          <Toggle small checked={showEvents} onChange={setShowEvents}>
            Fatos
          </Toggle>
          <Toggle small checked={showTerritories} onChange={setShowTerritories}>
            Territórios
          </Toggle>
          <Toggle small checked={showSingleReads} onChange={setShowSingleReads}>
            Polos com 1 leitura
          </Toggle>
        </div>
      </div>
      <div className="group-map">
        <div className="group-map-area">
          <MapContainer
            className="group-map-leaflet"
            center={[-22.97, -43.2]}
            zoom={13}
            zoomControl
            scrollWheelZoom
          >
            <BaseTiles />
            {showTerritories && relevantComplexes.size > 0 && (
              <TerritoriesLayer
                highlighted={relevantComplexes}
                obstacles={obstacles}
                focus={selectionPoints}
              />
            )}
            <FitBounds
              points={initialPoints}
              padding={36}
              maxZoom={15}
              retryMs={[250, 900]}
            />
            <FitSelection points={selectionPoints} />
            {selectedPole &&
              visibleEvents.map((groupEvent) => (
                <Polyline
                  key={`linha-${groupEvent.event_id}`}
                  positions={[
                    [selectedPole.lat, selectedPole.lng],
                    [groupEvent.latitude!, groupEvent.longitude!],
                  ]}
                  pathOptions={{
                    color: POINT_KINDS[selectedPole.kind].mapColor,
                    weight: 2,
                    opacity: 0.75,
                    dashArray:
                      selectedPole.kind === 'passage' ? undefined : '5 5',
                  }}
                  interactive={false}
                />
              ))}
            {visibleEvents.map((groupEvent) => (
              <CircleMarker
                key={`fato-${groupEvent.event_id}`}
                center={[groupEvent.latitude!, groupEvent.longitude!]}
                radius={selectedPole ? 6 : 4.5}
                pathOptions={{
                  color: '#fff',
                  weight: 1.5,
                  fillColor: '#1d2328',
                  fillOpacity: 0.9,
                }}
              >
                <Tooltip direction="top">{`RO ${groupEvent.event_id} · ${shortAddress(groupEvent.address)}`}</Tooltip>
              </CircleMarker>
            ))}
            {[...visiblePoles].reverse().map((item) => (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={poleIcon(
                  item,
                  item.id === selectedPole?.id,
                  Boolean(selectedPole) && item.id !== selectedPole?.id,
                )}
                zIndexOffset={item.id === selectedPole?.id ? 1000 : item.count}
                eventHandlers={{
                  click: () =>
                    setSelectedId(item.id === selectedId ? null : item.id),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                >{`${POINT_KINDS[item.kind].name} · ${item.location}`}</Tooltip>
              </Marker>
            ))}
          </MapContainer>
          <div className="group-map-legend">
            {kinds.includes('departure') && (
              <span>
                <i className="example departure" aria-hidden="true" />
                Partida
              </span>
            )}
            {kinds.includes('disconnection') && (
              <span>
                <i className="example disconnection" aria-hidden="true" />
                Desconexão
              </span>
            )}
            {kinds.includes('passage') && (
              <span>
                <i className="example passage" aria-hidden="true" />
                Passagem junta
              </span>
            )}
            <span>
              <i className="example fact" aria-hidden="true" />
              Fato
            </span>
            <span className="note">Tamanho e número: leituras no polo</span>
          </div>
        </div>
        <aside className="group-map-side">
          {selectedPole ? (
            <PoleDetail
              pole={selectedPole}
              eventsById={eventsById}
              colors={colors}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <PoleList poles={visiblePoles} onSelect={setSelectedId} />
          )}
        </aside>
      </div>
      <p className="group-map-footer">
        {footnote ??
          `Partida: primeira leitura do dia do fato. Passagem junta: duas ou mais placas do grupo na mesma câmera perto da hora do fato. Desconexão: último local antes de 8 h sem leitura. Territórios só aparecem quando o grupo fica acima da taxa das outras ${recorte.groups.items}; não há câmera dentro das comunidades.`}
      </p>
    </>
  )
}
