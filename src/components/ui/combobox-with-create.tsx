'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
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

import { ScrollArea } from './scroll-area'

export type ComboboxOptions = {
  value: string
  label: string
}

type Mode = 'single' | 'multiple'

interface ComboboxProps {
  mode?: Mode
  options: ComboboxOptions[]
  selected: string | string[] // Updated to handle multiple selections
  className?: string
  placeholder?: string
  onChange?: (event: string | string[]) => void // Updated to handle multiple selections
  onCreate?: (value: string) => void
}

export function Combobox({
  options,
  selected,
  className,
  placeholder,
  mode = 'single',
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>('')

  const trimedQuery = query.endsWith(' ') ? query.trimEnd() : query
  const optionsExists = options.some((item) => item.label === trimedQuery)

  return (
    <div className={cn('block', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            key={'combobox-trigger'}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected && selected.length > 0 ? (
              <div className="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
                <span>
                  {mode === 'multiple' && Array.isArray(selected)
                    ? selected
                        .map(
                          (selectedValue: string) =>
                            options.find((item) => item.value === selectedValue)
                              ?.label,
                        )
                        .join(', ')
                    : mode === 'single' &&
                      options.find((item) => item.value === selected)?.label}
                </span>
              </div>
            ) : (
              placeholder ?? 'Select Item...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[29rem] p-0">
          <Command
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1
              return 0
            }}
            // shouldFilter={true}
          >
            <CommandInput
              placeholder="Pequise por uma operação..."
              value={query}
              onValueChange={(value: string) => setQuery(value)}
            />
            <ScrollArea>
              <div className="max-h-80">
                <CommandGroup>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.label}
                        value={option.label}
                        onSelect={() => {
                          if (onChange) {
                            if (
                              mode === 'multiple' &&
                              Array.isArray(selected)
                            ) {
                              onChange(
                                selected.includes(option.value)
                                  ? selected.filter(
                                      (item) => item !== option.value,
                                    )
                                  : [...selected, option.value],
                              )
                            } else {
                              onChange(option.value)
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                    {query && !optionsExists && (
                      <CommandItem
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                        key={query}
                        value={query}
                        onSelect={() => {
                          if (onCreate) {
                            onCreate(query)
                            setQuery('')
                            if (onChange) {
                              onChange(query)
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selected === query ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="space-x">
                          <span className="text-muted-foreground">Criar: </span>
                          <span className="">{query}</span>
                        </div>
                      </CommandItem>
                    )}
                  </CommandList>
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
