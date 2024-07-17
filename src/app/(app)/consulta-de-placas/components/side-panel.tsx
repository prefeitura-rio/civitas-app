import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SearchByPlate } from './side-pannel/search-by-plate'
import { SearchByRadar } from './side-pannel/search-by-radar'

export function SidePanel() {
  return (
    <div className="flex h-screen w-full max-w-md flex-col px-2">
      <Tabs defaultValue="plate" className="p-2">
        <TabsList className="w-full">
          <TabsTrigger value="plate" className="w-full">
            Busca por placa
          </TabsTrigger>
          <TabsTrigger value="radar" className="w-full">
            Busca por radar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plate">
          <SearchByPlate />
        </TabsContent>
        <TabsContent value="radar">
          <SearchByRadar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
