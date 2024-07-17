import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SearchByPlate } from './side-pannel/search-by-plate/search-by-plate'
import { SearchByRadar } from './side-pannel/search-by-radar/search-by-radar'

export function SidePanel() {
  return (
    <div className="flex h-screen w-full max-w-md flex-col px-4 py-2">
      <Tabs defaultValue="plate" className="block h-[calc(100%-1rem)] w-full">
        <TabsList className="w-full">
          <TabsTrigger value="plate" className="w-full">
            Busca por placa
          </TabsTrigger>
          <TabsTrigger value="radar" className="w-full">
            Busca por radar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plate" className="h-[calc(100%-2rem)] w-full">
          <SearchByPlate />
        </TabsContent>
        <TabsContent value="radar" className="h-[calc(100%-2rem)] w-full">
          <SearchByRadar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
