import { useEffect, useState } from 'react'

import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Spinner } from './spinner'

interface MultiselectCheckboxProps {
  value: string[] | undefined
  onChange: (selectedOptions: string[]) => void
  options: string[] | undefined
  isLoading: boolean
}

export function MultiselectCheckbox({
  value = [],
  options: defaultOptions = [],
  onChange,
  isLoading,
}: MultiselectCheckboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState(
    defaultOptions.reduce(
      (acc, cur) => {
        acc[cur] = value.some((item) => item === cur)
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  console.log({ defaultOptions })

  useEffect(() => {
    setOptions(
      defaultOptions.reduce(
        (acc, cur) => {
          acc[cur] = value.some((item) => item === cur)
          return acc
        },
        {} as Record<string, boolean>,
      ),
    )
  }, [defaultOptions])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-auto min-h-10 w-full">
          {value.length > 0 ? (
            <span className="whitespace-pre-wrap">{value.join(', ')}</span>
          ) : (
            <span className="text-muted-foreground">Todos</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {isLoading ? (
          <Spinner />
        ) : (
          <ul>
            {Object.entries(options).map(([key, value]) => (
              <li className="flex items-center gap-2">
                <Checkbox
                  checked={value}
                  onCheckedChange={(e) => {
                    const newOptions = {
                      ...options,
                      [key]: !!e,
                    }
                    setOptions(newOptions)
                    onChange(
                      Object.keys(newOptions).filter((key) => newOptions[key]),
                    )
                  }}
                />
                <span>{key}</span>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
