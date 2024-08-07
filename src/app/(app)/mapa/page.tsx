'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

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
