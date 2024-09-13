'use client'

import Map from '../components/map'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

import { Topbar } from '../components/topbar'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MapContextProvider>
      <div className="h-screen w-full p-2">
        <Topbar />
        <div className='h-[calc(100vh-7.625rem)]'>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={22} defaultSize={67}>
              {children}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={28} defaultSize={33}>
              <Map />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </MapContextProvider>
  )
}
