import { TileLayer } from 'react-leaflet'

import { tileUrl } from '@/modules/vehicle-intelligence/lib/api'

/** O mapa-base CARTO dos mapas Leaflet (claro, "voyager", ou escuro, "dark_all"), servido pelo backend com a chave. */
export function BaseTiles({
  style = 'voyager',
}: {
  style?: 'voyager' | 'dark_all' | 'light_all'
}) {
  return (
    <TileLayer
      attribution="&copy; OpenStreetMap &copy; CARTO"
      url={tileUrl(style)}
    />
  )
}
