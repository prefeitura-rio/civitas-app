import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/** Fecha o popup aberto quando o evento ativo muda. */
export function PopupReset({ eventKey }: { eventKey: string }) {
  const map = useMap()
  useEffect(() => {
    map.closePopup()
  }, [eventKey, map])
  return null
}
