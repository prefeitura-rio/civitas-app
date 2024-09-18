import { Search } from 'lucide-react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface RadarMultiSelectProps {
  inputValue?: string
  onInputValueChange?: (value: string) => void
  options: string[]
  width?: string | number
  height?: string | number
  value: string[]
  onValueChange: (value: string[]) => void
}

export function RadarMultiSelect({
  inputValue,
  onInputValueChange,
}: RadarMultiSelectProps) {
  function handleSearch() {
    console.log('search')
  }

  return (
    // <Popover>
    //   <PopoverTrigger className="group flex w-full items-center justify-between rounded-md border-[1.250px] border-secondary px-4 py-2">
    //     <span>Selecione um radar</span>
    //     <ChevronUp className="size-4 transition-all duration-100 group-data-[state='open']:-rotate-180" />
    //   </PopoverTrigger>
    //   <PopoverContent style={{ width, height }} className="overflow-scroll">
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => onInputValueChange?.(e.target.value)}
          className="w-full pl-8"
          placeholder="Encontre um radar"
          onKeyDown={(e) => {
            if (e.code === 'Enter') handleSearch()
          }}
        />
        <Search className="absolute-y-centered left-3 size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex w-full justify-end">
        <Button size="sm" onClick={handleSearch}>
          Pesquisar
        </Button>
      </div>
    </div>
    // </PopoverContent>
    // </Popover>
  )
}
