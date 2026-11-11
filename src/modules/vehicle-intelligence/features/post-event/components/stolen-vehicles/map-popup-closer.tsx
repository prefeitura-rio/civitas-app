import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapPopupCloser({ selectedId }: { selectedId: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedId === null) map.closePopup()
  }, [map, selectedId])
  return null
}
