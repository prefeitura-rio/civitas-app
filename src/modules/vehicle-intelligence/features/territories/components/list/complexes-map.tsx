import { useMemo, useState } from 'react'
import { Marker, Tooltip } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { FitBounds } from '@/modules/vehicle-intelligence/components/map/fit-bounds'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { TerritoriesLayer } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { complexIcon } from '@/modules/vehicle-intelligence/features/territories/components/list/complex-icon'
import type { ComplexRow } from '@/modules/vehicle-intelligence/features/territories/components/list/complex-rows'
import { ITEMS } from '@/modules/vehicle-intelligence/features/territories/vocabulary'

/** O mapa dos complexos com placa em destaque; clicar no marcador abre o território. */
export function ComplexesMap({
  rows,
  onOpen,
}: {
  rows: ComplexRow[]
  onOpen: (complex: string) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  // Só os complexos com placa em destaque: os outros (alguns fora do município) afastariam o mapa e encheriam de nomes.
  const located = rows.filter(
    (l) =>
      l.latitude != null && l.longitude != null && l.highlighted.length > 0,
  )
  const highlightedComplexes = useMemo(
    () => new Set(located.map((l) => l.complex)),
    [located],
  )
  // O enquadramento inicial fica no município: complexos fora dele (ex. Malvinas, em Macaé) continuam no mapa, mas não
  // levam a vista para a escala do estado.
  const points = useMemo(() => {
    const inCity = located.filter((l) => l.region)
    return (inCity.length ? inCity : located).map(
      (l) => [l.latitude!, l.longitude!] as [number, number],
    )
  }, [located])
  const obstacles = useMemo(
    () =>
      located.map((l) => ({
        lat: l.latitude!,
        lng: l.longitude!,
        radius: Math.min(16 + Math.sqrt(l.highlighted.length) * 6, 44) / 2,
      })),
    [located],
  )
  return (
    <div className="territories-map">
      <MapContainer
        className="group-map-leaflet"
        center={[-22.95, -43.25]}
        zoom={12}
        zoomControl
        scrollWheelZoom
      >
        <BaseTiles />
        {highlightedComplexes.size > 0 && (
          <TerritoriesLayer
            highlighted={highlightedComplexes}
            obstacles={obstacles}
          />
        )}
        <FitBounds points={points} padding={40} maxZoom={14} retryMs={[300]} />
        {[...located].reverse().map((l) => (
          <Marker
            key={l.complex}
            position={[l.latitude!, l.longitude!]}
            icon={complexIcon(l, hovered === l.complex)}
            zIndexOffset={l.highlighted.length}
            eventHandlers={{
              click: () => onOpen(l.complex),
              mouseover: () => setHovered(l.complex),
              mouseout: () => setHovered(null),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -12]}
            >{`${l.complex} · ${l.plates} ${ITEMS} de base · ${l.highlighted.length} em destaque · ${l.unmarked.length} sem citação nem Cerco`}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div className="group-map-legend">
        <span>
          <i className="territory-legend origin" aria-hidden="true" />
          Fora da região do recorte (origem)
        </span>
        <span>
          <i className="territory-legend home" aria-hidden="true" />
          Na região (tende a ser moradia)
        </span>
        <span className="note">
          Tamanho e número: {ITEMS} em destaque com base no complexo
        </span>
      </div>
    </div>
  )
}
