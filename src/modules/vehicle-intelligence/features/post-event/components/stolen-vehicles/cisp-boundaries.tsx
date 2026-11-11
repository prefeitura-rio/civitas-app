import type { PathOptions } from 'leaflet'
import { GeoJSON } from 'react-leaflet'

import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

/** Os limites das CISPs; com CISP no filtro, as selecionadas ficam fortes e as outras apagadas. */
export function CispBoundaries({
  geometry,
  selectedCisps,
}: {
  geometry: DashboardData['mapa']
  selectedCisps: Set<string>
}) {
  return (
    <GeoJSON
      data={geometry}
      interactive={false}
      style={(feature) => {
        const code = String(feature?.properties?.cisp || '').padStart(3, '0')
        const selected = selectedCisps.size === 0 || selectedCisps.has(code)
        return {
          className: 'cisp-boundary',
          color: selected ? '#0e7490' : '#64748b',
          dashArray: selected ? '6 4' : '3 5',
          fillColor: '#18c7dd',
          fillOpacity: selected ? 0.035 : 0.008,
          opacity: selected ? 0.9 : 0.28,
          weight: selected ? 1.7 : 0.7,
        } as PathOptions
      }}
    />
  )
}
