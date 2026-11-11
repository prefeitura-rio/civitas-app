import { ArrowRight, Search } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import {
  type OpenSearchedPlate,
  PLATE_PATTERN_HINT,
  type PlateSearchField,
  PlateSearchResults,
  usePlateSearchField,
} from '@/modules/vehicle-intelligence/components/plate/plate-search'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Input } from '@/modules/vehicle-intelligence/components/ui/input'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'

interface PlateQuickSearchProps {
  onOpenPlate: OpenSearchedPlate
  /** Classe do invólucro (o perfil de placa dá a largura e o estilo do campo). */
  className?: string
  /** Texto do campo no cabeçalho; o padrão é "Buscar placa". */
  placeholder?: string
}

function submitLabel(field: PlateSearchField): string {
  if (!field.ready) return 'Digite uma placa para buscar nos três recortes'
  return field.exact
    ? `Abrir perfil da placa ${field.pattern}`
    : `Ver as placas no padrão ${field.pattern}`
}

/** Busca de placa do cabeçalho: os resultados dos três recortes aparecem abaixo do campo. */
export function PlateQuickSearch({
  onOpenPlate,
  className,
  placeholder = 'Buscar placa',
}: PlateQuickSearchProps) {
  const inputId = useId()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(false)
  const close = () => {
    setPopoverOpen(false)
    setResultsOpen(false)
  }
  const field = usePlateSearchField(onOpenPlate, close)
  const inlineForm = useRef<HTMLFormElement>(null)
  const inlineResults = useRef<HTMLDivElement>(null)
  const popoverResults = useRef<HTMLDivElement>(null)

  const searchForm = (variant: 'inline' | 'popover') => {
    const id = `${inputId}-${variant}`
    const results = variant === 'inline' ? inlineResults : popoverResults
    return (
      <form
        ref={variant === 'inline' ? inlineForm : undefined}
        className={`plate-quick-search-form ${variant}`}
        onSubmit={(event) => field.submit(event, results)}
      >
        <label
          htmlFor={id}
          className={variant === 'inline' ? 'sr-only' : undefined}
        >
          Buscar placa nos três recortes
        </label>
        <div className="plate-quick-search-control">
          <Search aria-hidden="true" size={15} />
          <Input
            id={id}
            value={field.value}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            placeholder={
              variant === 'inline' ? placeholder : 'ABC1D23 ou RJQ9F9-'
            }
            title={PLATE_PATTERN_HINT}
            aria-describedby={variant === 'popover' ? `${id}-hint` : undefined}
            onFocus={() => {
              if (variant === 'inline') setResultsOpen(true)
            }}
            onChange={(event) => {
              field.setValue(event.target.value)
              if (variant === 'inline') setResultsOpen(true)
            }}
          />
          {(field.ready || variant === 'popover') && (
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              disabled={!field.ready}
              aria-label={submitLabel(field)}
              title={submitLabel(field)}
            >
              <ArrowRight size={15} />
            </Button>
          )}
        </div>
        {variant === 'popover' && !field.showResults && (
          <small id={`${id}-hint`}>{PLATE_PATTERN_HINT}</small>
        )}
      </form>
    )
  }

  return (
    <div
      className={
        className ? `plate-quick-search ${className}` : 'plate-quick-search'
      }
    >
      <Popover
        open={resultsOpen && field.showResults}
        onOpenChange={setResultsOpen}
      >
        <PopoverAnchor asChild>
          <div className="plate-quick-search-inline">
            {searchForm('inline')}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          className="plate-search-popover"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (inlineForm.current?.contains(event.target as Node))
              event.preventDefault()
          }}
        >
          <PlateSearchResults field={field} listRef={inlineResults} />
        </PopoverContent>
      </Popover>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="plate-quick-search-trigger"
            aria-label="Buscar outra placa"
            title="Buscar outra placa"
          >
            <Search size={17} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={`plate-quick-search-popover${field.showResults ? ' with-results' : ''}`}
        >
          {searchForm('popover')}
          {field.showResults && (
            <PlateSearchResults field={field} listRef={popoverResults} />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
