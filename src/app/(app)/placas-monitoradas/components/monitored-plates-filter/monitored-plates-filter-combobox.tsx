'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type FilterComboboxOption = {
  id: string
  label: string
}

type MonitoredPlatesFilterComboboxProps = {
  id: string
  valueId: string
  valueLabel: string
  allLabel: string
  searchPlaceholder: string
  options: FilterComboboxOption[]
  pinnedOptions?: FilterComboboxOption[]
  isLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  onSelect: (option: FilterComboboxOption | null) => void
  onOpenChange?: (open: boolean) => void
}

export function MonitoredPlatesFilterCombobox({
  id,
  valueId,
  valueLabel,
  allLabel,
  searchPlaceholder,
  options,
  pinnedOptions = [],
  isLoading = false,
  search,
  onSearchChange,
  onSelect,
  onOpenChange,
}: MonitoredPlatesFilterComboboxProps) {
  const [open, setOpen] = useState(false)
  const isAll = valueId === 'all'
  const pinnedLabel = pinnedOptions.find((item) => item.id === valueId)?.label

  function handleOpenChange(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            isAll && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {isAll ? allLabel : (pinnedLabel ?? valueLabel)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <Spinner className="size-4" />
                </div>
              ) : (
                'Nenhum resultado encontrado'
              )}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onSelect(null)
                  handleOpenChange(false)
                }}
              >
                {allLabel}
                <Check
                  className={cn(
                    'ml-auto h-4 w-4',
                    isAll ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
              {pinnedOptions.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onSelect(item)
                    handleOpenChange(false)
                  }}
                >
                  <span className="truncate">{item.label}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      valueId === item.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
              {options.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onSelect(item)
                    handleOpenChange(false)
                  }}
                >
                  <span className="truncate">{item.label}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      valueId === item.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
