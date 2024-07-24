import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { SearchByPlate } from './components/search-by-plate/index'
import { SearchByRadar } from './components/search-by-radar/index'

export function SidePanel() {
  const {
    layers: {
      radars: {
        layerStates: { setIsVisible, isVisible },
      },
    },
  } = useMap()

  return (
    <div className="flex h-screen w-full max-w-md flex-col px-4 py-2">
      <Tabs
        onValueChange={(e) => {
          if (e === 'radar' && !isVisible) {
            setIsVisible(true)
          }
        }}
        className="h-[calc(100%-3rem)]"
        defaultValue="plate"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plate">Busca por placa</TabsTrigger>
          <TabsTrigger value="radar">Busca por radar</TabsTrigger>
        </TabsList>
        <TabsContent value="plate" className="h-full">
          <SearchByPlate />
        </TabsContent>
        <TabsContent value="radar" className="h-full">
          <SearchByRadar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
