import { Check, ChevronDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  cispSecondaryLabel,
  foldAccents,
  toggle,
} from '@/modules/vehicle-intelligence/components/filters/filter-options'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Input } from '@/modules/vehicle-intelligence/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { CispOption } from '@/modules/vehicle-intelligence/types/domain'

export function CispFilter({
  options,
  selected,
  onChange,
  unified = false,
}: {
  options: CispOption[]
  selected: string[]
  onChange: (value: string[]) => void
  unified?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const query = foldAccents(search)
    return options.filter((item) =>
      foldAccents(`${item.codigo} ${item.nome}`).includes(query),
    )
  }, [options, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={unified ? 'min-w-0' : 'cisp-select'}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={
              unified
                ? 'h-12 w-full min-w-0 justify-between rounded-lg border-border bg-background px-3 text-left shadow-none data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-ring/20'
                : 'select-trigger'
            }
            aria-label="Selecionar CISPs"
          >
            <span
              className={
                unified ? 'flex min-w-0 flex-col items-start gap-1' : undefined
              }
            >
              <small
                className={
                  unified
                    ? 'text-[0.625rem] tracking-[0.12em] text-muted-foreground'
                    : undefined
                }
              >
                CISP
              </small>
              <strong
                className={
                  unified
                    ? 'truncate text-xs font-medium text-foreground'
                    : undefined
                }
              >
                {selected.length
                  ? `${selected.length} selecionada${selected.length > 1 ? 's' : ''}`
                  : 'Todas as CISPs'}
              </strong>
            </span>
            <ChevronDown size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={7}
          className={
            unified
              ? 'max-h-[var(--radix-popover-content-available-height)] w-[min(350px,calc(100vw-24px))] overflow-hidden rounded-xl border-border bg-popover p-2'
              : 'select-menu max-h-[var(--radix-popover-content-available-height)] w-[min(350px,calc(100vw-24px))] overflow-hidden'
          }
        >
          <label className={unified ? 'relative block' : 'select-search'}>
            <Search
              className={
                unified
                  ? 'pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
                  : undefined
              }
              size={15}
            />
            <Input
              type="search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Buscar CISP ou delegacia"
              className={
                unified
                  ? 'h-11 rounded-lg border-border bg-background pl-9 pr-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:h-9'
                  : 'select-search-input h-full rounded-lg border-border bg-background pl-9 pr-3 shadow-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:h-full'
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar CISP ou delegacia"
            />
          </label>
          <div
            className={
              unified
                ? 'flex items-center justify-between gap-3 px-1 py-2'
                : 'select-actions'
            }
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={unified ? 'px-2 text-xs text-primary' : undefined}
              onClick={() => onChange([])}
            >
              Usar todas as CISPs
            </Button>
            <span
              className={
                unified ? 'text-[0.6875rem] text-muted-foreground' : undefined
              }
            >
              {selected.length
                ? `${selected.length} no recorte`
                : 'Sem restrição territorial'}
            </span>
          </div>
          <div
            className={
              unified
                ? 'max-h-[min(310px,calc(var(--radix-popover-content-available-height)-140px))] overflow-y-auto overscroll-contain'
                : 'select-list max-h-[min(310px,calc(var(--radix-popover-content-available-height)-140px))] overscroll-contain'
            }
          >
            {filtered.map((item) => {
              const active = selected.includes(item.codigo)
              const secondaryLabel = cispSecondaryLabel(item)
              return (
                <Button
                  type="button"
                  variant="ghost"
                  key={item.codigo}
                  className={
                    unified
                      ? 'grid min-h-11 w-full grid-cols-[1.25rem_minmax(0,1fr)_auto] justify-start gap-2 rounded-lg px-2 text-left data-[state=selected]:bg-accent'
                      : active
                        ? 'selected'
                        : ''
                  }
                  data-state={unified && active ? 'selected' : undefined}
                  aria-pressed={active}
                  onClick={() => onChange(toggle(selected, item.codigo))}
                >
                  <span
                    className={
                      unified
                        ? 'grid size-4 place-items-center rounded border border-border data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'
                        : 'checkbox'
                    }
                    data-active={active}
                  >
                    {active && <Check size={13} />}
                  </span>
                  <span
                    className={
                      unified
                        ? 'flex min-w-0 flex-col'
                        : `cisp-copy${secondaryLabel ? '' : ' single-line'}`
                    }
                  >
                    <strong
                      className={
                        unified ? 'text-xs text-foreground' : undefined
                      }
                    >
                      CISP {item.codigo}
                    </strong>
                    {secondaryLabel && (
                      <small
                        className={
                          unified
                            ? 'truncate text-[0.6875rem] text-muted-foreground'
                            : undefined
                        }
                      >
                        {secondaryLabel}
                      </small>
                    )}
                  </span>
                  {item.total > 0 && (
                    <em
                      className={
                        unified
                          ? 'text-[0.6875rem] not-italic tabular-nums text-muted-foreground'
                          : undefined
                      }
                    >
                      {formatNumber(item.total)}
                    </em>
                  )}
                </Button>
              )
            })}
            {!filtered.length && (
              <div
                className={
                  unified
                    ? 'grid min-h-24 place-items-center p-4 text-center text-xs text-muted-foreground'
                    : 'select-empty'
                }
              >
                Nenhuma CISP encontrada para essa busca.
              </div>
            )}
          </div>
          <Button
            type="button"
            className={unified ? 'mt-2 w-full' : 'select-done'}
            onClick={() => setOpen(false)}
          >
            Aplicar seleção
          </Button>
        </PopoverContent>
      </div>
    </Popover>
  )
}
