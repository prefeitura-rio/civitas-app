import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { SearchByPlate } from './side-pannel/search-by-plate/search-by-plate'
import { SearchByRadar } from './side-pannel/search-by-radar/search-by-radar'

export function SidePanel() {
  const {
    layerHooks: {
      radars: {
        layerStates: { setIsVisible, isVisible },
      },
    },
  } = useMapLayers()

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
      {/* {isRadarsEnabled ? <SearchByRadar /> : <SearchByPlate />} */}
    </div>
  )
}
