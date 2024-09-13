'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import Map from './components/map'
import { MapContextProvider } from '@/contexts/map-context'

import { Topbar } from './components/topbar'

export default function Mapa() {
  return (
    <MapContextProvider>
      <div className="h-full w-full">
        <Topbar />
        <div className='h-[calc(100vh-7rem)]'>
          <Map />
        </div>
      </div>
    </MapContextProvider>
  )
}
