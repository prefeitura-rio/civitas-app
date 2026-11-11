import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  formatNumber,
  formatPercent,
} from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileLocation } from '@/modules/vehicle-intelligence/types/domain'

export function LocationsTable({
  locations,
  total,
  onPointFocus,
  onPointOpen,
}: {
  locations: PlateProfileLocation[]
  total: number
  onPointFocus?: (pointId: string | null) => void
  onPointOpen?: (pointId: string) => void
}) {
  const [search, setSearch] = useState('')
  const filteredLocations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (!query) return locations
    return locations.filter((item) =>
      [
        item.point_id,
        item.camera,
        item.location,
        item.neighborhood,
        item.direction,
      ]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  }, [locations, search])
  return (
    <div className="profile-loc-table">
      <div className="profile-loc-tools">
        <label>
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar ponto, radar ou bairro"
            aria-label="Pesquisar pontos de coleta"
          />
        </label>
        <span>
          {filteredLocations.length} de {locations.length} pontos
        </span>
      </div>
      <div className="profile-loc-head">
        <span>#</span>
        <span>Ponto de coleta</span>
        <span>Bairro</span>
        <span>Sentido</span>
        <span className="num">Passagens</span>
        <span className="num">Do total</span>
      </div>
      <div className="profile-loc-body">
        {filteredLocations.map((item, index) => (
          <div
            className="profile-loc-row"
            key={`${item.point_id}-${index}`}
            onMouseEnter={() => onPointFocus?.(item.point_id)}
            onMouseLeave={() => onPointFocus?.(null)}
            onFocus={() => onPointFocus?.(item.point_id)}
            onBlur={() => onPointFocus?.(null)}
            onClick={() => onPointOpen?.(item.point_id)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onPointOpen?.(item.point_id)
            }}
            role="button"
            aria-label={`Abrir ${item.location || item.point_id} no mapa`}
            tabIndex={0}
          >
            <span className="profile-rank-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="profile-loc-name">
              <strong>{item.location || 'Local não informado'}</strong>
            </span>
            <span>{item.neighborhood || '—'}</span>
            <span>{item.direction || '—'}</span>
            <span className="num strong">{formatNumber(item.detections)}</span>
            <span className="num">
              {total > 0 ? formatPercent((100 * item.detections) / total) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
