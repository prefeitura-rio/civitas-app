/**
 * Relato (dinâmica) das ocorrências: o painel que o busca e o texto com os termos marcados. Outras telas importam
 * tudo daqui.
 */
import { Popup as LeafletPopup } from 'leaflet'
import { useCallback } from 'react'
import { useMap } from 'react-leaflet'

import { OccurrenceDynamicsPanel } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics-panel'

export { fetchOccurrenceDynamics } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics-api'
export {
  foldSearchText,
  HighlightedText,
} from '@/modules/vehicle-intelligence/components/occurrence/highlighted-text'
export { OccurrenceDynamicsPanel }

/** Dentro de um popup do Leaflet: reposiciona o popup quando o relato chega. */
export function OccurrenceDynamics({ eventIds }: { eventIds: string[] }) {
  const map = useMap()
  const refreshPopups = useCallback(() => {
    map.eachLayer((layer) => {
      if (layer instanceof LeafletPopup && layer.isOpen()) layer.update()
    })
  }, [map])
  return (
    <OccurrenceDynamicsPanel eventIds={eventIds} onSettled={refreshPopups} />
  )
}
