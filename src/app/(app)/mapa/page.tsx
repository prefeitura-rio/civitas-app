'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

import { MapContextProvider } from '@/contexts/map-context'

const Map = dynamic(
  () => import('./components/map/index').then((mod) => mod.Map),
  {
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false, // Disable server-side rendering
  },
)

const SidePanel = dynamic(
  () => import('./components/side-pannel/index').then((mod) => mod.SidePanel),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function Mapa() {
  return (
    <MapContextProvider>
      <div className="relative flex h-screen w-full pt-0">
        <Map />
        <SidePanel />
      </div>
    </MapContextProvider>
  )
}
