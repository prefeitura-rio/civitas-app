'use client'

import examples from 'libphonenumber-js/examples.mobile.json'
import { getExampleNumber } from 'libphonenumber-js/min'
import { Check, ChevronDown } from 'lucide-react'
import * as React from 'react'
import type { Country } from 'react-phone-number-input'
import {
  getCountries,
  getCountryCallingCode,
  isPossiblePhoneNumber,
  parsePhoneNumber,
} from 'react-phone-number-input'
import PhoneInputCore from 'react-phone-number-input/input'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const displayNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['pt-BR', 'en'], { type: 'region' })
    : null

function getCountryLabel(country: Country) {
  return displayNames?.of(country) ?? country
}

function getMaxLength(country: Country): number {
  return getExampleNumber(country, examples)?.formatNational()?.length ?? 20
}

function getPlaceholder(country: Country): string {
  return (
    getExampleNumber(country, examples)?.formatNational() ?? 'Digite o telefone'
  )
}

type PhoneInputProps = {
  className?: string
  defaultCountry?: Country
  disabled?: boolean
  id?: string
  name?: string
  placeholder?: string
  value?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onChange?: (value: string) => void
}

function CountryFlag({ country }: { country: Country }) {
  const codePoints = country
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))

  return (
    <span className="text-base leading-none">
      {String.fromCodePoint(...codePoints)}
    </span>
  )
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      defaultCountry = 'BR',
      disabled,
      id,
      name,
      onBlur,
      onChange,
      placeholder,
      value,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [country, setCountry] = React.useState<Country>(defaultCountry)

    React.useEffect(() => {
      if (!value) {
        return
      }

      const parsed = parsePhoneNumber(value)
      if (parsed?.country) {
        setCountry(parsed.country)
      }
    }, [value])

    const countryOptions = React.useMemo(
      () =>
        getCountries().map((optionCountry) => ({
          country: optionCountry,
          label: getCountryLabel(optionCountry),
          callingCode: `+${getCountryCallingCode(optionCountry)}`,
        })),
      [],
    )

    const selectedCountry =
      countryOptions.find((option) => option.country === country) ??
      countryOptions[0]

    const maxLength = React.useMemo(() => getMaxLength(country), [country])
    const dynamicPlaceholder = React.useMemo(
      () => placeholder ?? getPlaceholder(country),
      [country, placeholder],
    )

    return (
      <div className={cn('flex w-full gap-2', className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-[132px] shrink-0 justify-between px-3"
              disabled={disabled}
            >
              <span className="flex min-w-0 items-center gap-2">
                <CountryFlag country={selectedCountry.country} />
                <span className="truncate text-sm">
                  {selectedCountry.callingCode}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar país" />
              <CommandList>
                <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                {countryOptions.map((option) => (
                  <CommandItem
                    key={option.country}
                    value={`${option.country} ${option.label} ${option.callingCode}`}
                    onSelect={() => {
                      setCountry(option.country)
                      onChange?.('')
                      setOpen(false)
                    }}
                  >
                    <span className="mr-2">
                      <CountryFlag country={option.country} />
                    </span>
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="mr-2 text-muted-foreground">
                      {option.callingCode}
                    </span>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        option.country === country
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <PhoneInputCore
          ref={ref}
          country={country}
          smartCaret={false}
          value={value || undefined}
          onChange={(nextValue) => onChange?.(nextValue ?? '')}
          inputComponent={Input}
          id={id}
          name={name}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={dynamicPlaceholder}
          className="flex-1"
          maxLength={maxLength}
        />
      </div>
    )
  },
)

PhoneInput.displayName = 'PhoneInput'

export { isPossiblePhoneNumber }
