'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import Map from '@/app/(app)/mapa-v4/components/map'
import { MapContextProvider } from '@/contexts/map-context'

import { Topbar } from './components/topbar'

export default function Mapa() {
  return (
    <MapContextProvider>
      <div className="h-screen w-full">
        <Topbar />
        <Map />
      </div>
    </MapContextProvider>
  )
}
