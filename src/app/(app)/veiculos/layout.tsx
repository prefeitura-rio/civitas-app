import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { MapContextProvider } from '@/contexts/map-context'

import { MapWrapper } from './components/map'
import { SearchTabs } from './components/search-tabs'

export default async function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MapContextProvider>
      <div className="h-screen w-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={10} defaultSize={50}>
            <MapWrapper />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25} defaultSize={50}>
            <SearchTabs />
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MapContextProvider>
  )
}
