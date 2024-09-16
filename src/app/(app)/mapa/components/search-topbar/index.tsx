import { CarIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import { Label } from '@/components/ui/label'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

import { RadarSearch } from './components/radar-search'
import { WideSearch } from './components/wide-search'

export function SearchTopbar() {
  const pathname = usePathname()
  const initialSearchType = pathname.includes('radares') ? 'radar' : 'wide'
  const [searchType, setSearchType] = useState<'radar' | 'wide'>(
    initialSearchType,
  )

  return (
    <div className="h-28 px-10">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-14 flex-col justify-between">
          <div className="flex items-center space-x-4">
            <CarIcon className="h-6 w-6 text-primary dark:text-blue-400" />
            <h1 className="text-xl font-bold dark:text-white">
              Busca de Veículos
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="search-type" className="dark:text-white">
              Tipo de Busca:
            </Label>
            <Switch
              id="search-type"
              checked={searchType === 'radar'}
              onCheckedChange={(checked) =>
                setSearchType(checked ? 'radar' : 'wide')
              }
            />
            <span className="text-sm font-medium dark:text-white">
              {searchType === 'radar' ? 'Radar' : 'Cidade Inteira'}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          {searchType === 'radar' ? <RadarSearch /> : <WideSearch />}
        </div>
      </div>
    </div>
  )
}
