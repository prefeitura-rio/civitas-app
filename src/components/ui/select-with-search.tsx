'use client'

import { CheckIcon, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ComboboxOption } from '@/models/utils'

import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface SelectWithSearchProps {
  value: string
  options: ComboboxOption[]
  onSelect: (item: ComboboxOption) => void
}

export function SelectWithSearch({
  value,
  options,
  onSelect,
}: SelectWithSearchProps) {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
          )}
        >
          {value
            ? options.find((item) => item.label === value)?.label
            : 'Select language'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[29rem] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((item) => (
                <CommandItem
                  value={item.label}
                  key={item.label}
                  onSelect={() =>
                    onSelect({ label: item.label, value: item.value })
                  }
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      item.label === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
