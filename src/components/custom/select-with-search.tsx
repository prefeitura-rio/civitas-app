'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
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
import type { ComboboxOption } from '@/models/utils'

export const SELECT_WITH_SEARCH_PAGE_SIZE = 100
const SEARCH_DEBOUNCE_MS = 350

export type SelectWithSearchPage = {
  items: ComboboxOption[]
  page: number
  pages: number
}

export type SelectWithSearchFetchPageArgs = {
  page: number
  size: number
  search: string
}

interface SelectWithSearchProps {
  value: string
  options?: ComboboxOption[]
  selectedOption?: ComboboxOption
  onSelect: (item: ComboboxOption) => void
  placeholder: string
  disabled?: boolean
  emptyIndicator?: ReactNode
  topAction?: ReactNode
  fetchPage?: (
    args: SelectWithSearchFetchPageArgs,
  ) => Promise<SelectWithSearchPage>
  queryKey?: unknown[]
  enabled?: boolean
  pageSize?: number
}

function mergeSelectedOption(
  items: ComboboxOption[],
  selectedOption?: ComboboxOption,
) {
  if (!selectedOption?.value) return items
  if (items.some((item) => item.value === selectedOption.value)) return items
  return [selectedOption, ...items]
}

function InfiniteScrollSentinel({
  disabled,
  onVisible,
}: {
  disabled: boolean
  onVisible: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    const root = el.closest('[cmdk-list]')
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible()
      },
      { root, rootMargin: '48px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [disabled, onVisible])

  return <div ref={ref} className="h-1 w-full" aria-hidden />
}

export function SelectWithSearch({
  value,
  options = [],
  selectedOption,
  onSelect,
  placeholder,
  disabled = false,
  emptyIndicator,
  topAction,
  fetchPage,
  queryKey,
  enabled = true,
  pageSize = SELECT_WITH_SEARCH_PAGE_SIZE,
}: SelectWithSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)
  const isAsync = Boolean(fetchPage)

  const infiniteQuery = useInfiniteQuery({
    queryKey: [
      ...(queryKey ?? ['select-with-search']),
      debouncedSearch,
      pageSize,
    ],
    queryFn: ({ pageParam }) => {
      if (!fetchPage) {
        return { items: [] as ComboboxOption[], page: 1, pages: 1 }
      }

      return fetchPage({
        page: pageParam,
        size: pageSize,
        search: debouncedSearch.trim(),
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    enabled: isAsync && enabled,
  })

  const asyncOptions = useMemo(() => {
    const seen = new Set<string>()
    const items: ComboboxOption[] = []

    for (const page of infiniteQuery.data?.pages ?? []) {
      for (const item of page.items) {
        if (seen.has(item.value)) continue
        seen.add(item.value)
        items.push(item)
      }
    }

    return items
  }, [infiniteQuery.data?.pages])

  const displayOptions = mergeSelectedOption(
    isAsync ? asyncOptions : options,
    selectedOption,
  )

  const selectedLabel =
    selectedOption?.label ??
    displayOptions.find((item) => item.label === value || item.value === value)
      ?.label ??
    value

  const loadMore = useCallback(() => {
    if (!infiniteQuery.hasNextPage || infiniteQuery.isFetchingNextPage) return
    infiniteQuery.fetchNextPage().catch(() => {})
  }, [
    infiniteQuery.fetchNextPage,
    infiniteQuery.hasNextPage,
    infiniteQuery.isFetchingNextPage,
  ])

  const isInitialLoading =
    isAsync &&
    infiniteQuery.isFetching &&
    !infiniteQuery.isFetchingNextPage &&
    asyncOptions.length === 0

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) setSearch('')
  }

  return (
    <Popover modal={true} open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="min-w-0 truncate">
            {value ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(29rem,calc(100vw-2rem))] p-0">
        <Command shouldFilter={!isAsync}>
          <CommandInput
            placeholder="Pesquise"
            className="h-9"
            {...(isAsync ? { value: search, onValueChange: setSearch } : {})}
          />
          <CommandList>
            {isInitialLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Carregando…
              </div>
            ) : (
              <>
                <CommandEmpty className="flex justify-center p-2">
                  {emptyIndicator || (
                    <span className="text-muted-foreground">
                      Nenhum resultado encontrado
                    </span>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {topAction}
                  {displayOptions.map((item) => (
                    <CommandItem
                      value={item.label}
                      key={item.value}
                      onSelect={() => {
                        onSelect({ label: item.label, value: item.value })
                        handleOpenChange(false)
                      }}
                    >
                      {item.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          item.label === value || item.value === value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                  {isAsync &&
                  (infiniteQuery.hasNextPage ||
                    infiniteQuery.isFetchingNextPage) ? (
                    <>
                      {infiniteQuery.isFetchingNextPage ? (
                        <div className="py-2 text-center text-xs text-muted-foreground">
                          Carregando…
                        </div>
                      ) : null}
                      <InfiniteScrollSentinel
                        disabled={
                          !infiniteQuery.hasNextPage ||
                          infiniteQuery.isFetchingNextPage
                        }
                        onVisible={loadMore}
                      />
                    </>
                  ) : null}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
