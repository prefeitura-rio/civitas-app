'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import dynamic from 'next/dynamic'

import { Spinner } from '@/components/custom/spinner'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

const Map = dynamic(
  () => import('./components/map/index').then((mod) => mod.Map),
  {
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    ),
    ssr: false, // Disable server-side rendering
  },
)

const SidePanel = dynamic(
  () => import('./components/side-pannel/index').then((mod) => mod.SidePanel),
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
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={10} defaultSize={67}>
          <Map />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={22} defaultSize={33}>
          <SidePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </MapContextProvider>
  )
}
