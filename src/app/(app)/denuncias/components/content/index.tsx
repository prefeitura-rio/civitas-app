'use client'
import { Map as MapIcon, Table as TableIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

import { Views } from './components/common/views'
import { Dashboard } from './components/dashboard'
import { Map } from './components/map'
import { SidePanel } from './components/side-panel'
import { Table } from './components/table'

export function Content() {
  const [view, setView] = useState<Views>(Views.MAP)

  return (
    <div className="flex h-[calc(100%-3.75rem)] w-full">
      <div className="w-full space-y-2 overflow-y-scroll pr-2">
        <Dashboard className="w-full" />

        <div className="relative h-[calc(100%-24rem)] bg-blue-500">
          {view === Views.MAP && <Map className="h-full" />}
          {view === Views.TABLE && <Table className="h-full" />}

          <Button
            variant="outline"
            className="absolute right-2 top-2 h-9 w-9 border-0 p-0"
            onClick={() =>
              setView(view === Views.MAP ? Views.TABLE : Views.MAP)
            }
          >
            {view === Views.MAP && (
              <Tooltip text="Visualização de tabela" asChild>
                <TableIcon className="h-6 w-6" />
              </Tooltip>
            )}
            {view === Views.TABLE && (
              <Tooltip text="Visualização de mapa" asChild>
                <MapIcon className="h-6 w-6" />
              </Tooltip>
            )}
          </Button>
        </div>
      </div>
      <SidePanel className="w-96 border-l-2" />
    </div>
  )
}
