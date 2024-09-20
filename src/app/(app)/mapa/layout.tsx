import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

import { Map } from './components/map'
import { SearchTabs } from './components/search-tabs'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MapContextProvider>
      <div className="h-screen w-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={28} defaultSize={50}>
            <SearchTabs />
            {children}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={28} defaultSize={50}>
            <Map />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MapContextProvider>
  )
}
