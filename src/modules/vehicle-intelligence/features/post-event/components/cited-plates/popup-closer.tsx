import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function PopupCloser({ selection }: { selection: string | null }) {
  const map = useMap()
  useEffect(() => {
    map.closePopup()
  }, [map, selection])
  return null
}
