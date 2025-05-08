import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

import { Map } from './components/map'
// import { SearchTabs } from './components/search-tabs'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MapContextProvider>
      <div className="h-screen w-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={10} defaultSize={50}>
            <Map />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25} defaultSize={50}>
            {/* <SearchTabs /> */}
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MapContextProvider>
  )
}
