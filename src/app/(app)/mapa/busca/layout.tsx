'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

import { Map } from '../components/map'
import { SearchTopbar } from '../components/search-topbar'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MapContextProvider>
      <div className="h-screen w-full p-2">
        <SearchTopbar />
        <div className="h-[calc(100vh-7rem)]">
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
