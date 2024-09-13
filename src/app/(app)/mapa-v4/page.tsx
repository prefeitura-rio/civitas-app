'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { MapContextProvider } from '@/contexts/map-context'

import Map from './components/map'
import { SearchTopbar } from './components/search-topbar'

export default function Mapa() {
  return (
    <MapContextProvider>
      <div className="h-full w-full">
        <SearchTopbar />
        <div className="h-[calc(100vh-7rem)]">
          <Map />
        </div>
      </div>
    </MapContextProvider>
  )
}
