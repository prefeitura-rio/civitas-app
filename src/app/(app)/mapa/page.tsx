'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { CarPathContextProvider } from '@/contexts/car-path-context'
import { MapLayersContextProvider } from '@/contexts/map-layers-context'

const Map = dynamic(() => import('./components/map').then((mod) => mod.Map), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
    </div>
  ),
  ssr: false, // Disable server-side rendering
})

const SidePanel = dynamic(
  () => import('./components/side-panel').then((mod) => mod.SidePanel),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function Mapa() {
  return (
    <CarPathContextProvider>
      <MapLayersContextProvider>
        <div className="relative flex h-screen w-full pt-0">
          <Map />
          <SidePanel />
        </div>
      </MapLayersContextProvider>
    </CarPathContextProvider>
  )
}
