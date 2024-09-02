'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import dynamic from 'next/dynamic'

import { Spinner } from '@/components/custom/spinner'
import { MapContextProvider } from '@/contexts/map-context'

import { Topbar } from './components/topbar'

const Map = dynamic(
  () => import('@/app/(app)/mapa/components/map').then((mod) => mod.Map),
  {
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    ),
    ssr: false, // Disable server-side rendering
  },
)

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
