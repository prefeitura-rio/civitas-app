'use client'
import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import {
  Check,
  ChevronsUpDown,
  Copy,
  PencilLine,
  Search,
  Trash,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  parsePhoneNumber,
} from 'react-phone-number-input'
import { toast } from 'sonner'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { institutionJurisdictionOptions } from '@/constants/institutions'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import {
  getInstitutionAuthorities,
  type InstitutionAuthority,
  type InstitutionAuthoritySortBy,
  type SortDirection,
} from '@/http/institution-authorities'
import {
  getRequestingInstitutions,
  type RequestingInstitution,
} from '@/http/requesting-institutions'
import { cn } from '@/lib/utils'

const sortableColumns = {
  name: 'name',
  requesting_institution_name: 'requesting_institution_name',
  created_at: 'created_at',
} as const satisfies Record<string, InstitutionAuthoritySortBy>

type FocalPointFilter = 'all' | 'true' | 'false'
type JurisdictionFilter = RequestingInstitution['jurisdictionLevel'] | 'all'

function getSortBy(sortingState: SortingState) {
  const columnId = sortingState[0]?.id

  if (!columnId) return undefined

  return sortableColumns[columnId as keyof typeof sortableColumns]
}

function getSortDirection(
  sortingState: SortingState,
): SortDirection | undefined {
  const sort = sortingState[0]

  if (!sort) return undefined

  return sort.desc ? 'desc' : 'asc'
}

function getPrimaryPhone(authority: InstitutionAuthority) {
  return (
    authority.primaryContact?.phone?.phone ??
    authority.contacts?.phones.find((item) => item.isPrimary)?.phone ??
    authority.contacts?.phones.at(0)?.phone
  )
}

function getPrimaryEmail(authority: InstitutionAuthority) {
  return (
    authority.primaryContact?.email?.email ??
    authority.contacts?.emails.find((item) => item.isPrimary)?.email ??
    authority.contacts?.emails.at(0)?.email
  )
}

function formatPhoneForDisplay(value: string) {
  const parsed = parsePhoneNumber(value)
  if (!parsed) return value

  if (parsed.country === 'BR') return formatPhoneNumber(value)

  return formatPhoneNumberIntl(value)
}

function getFocalPointFilterValue(value: FocalPointFilter) {
  if (value === 'all') return undefined
  return value === 'true'
}

async function copyContact(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copiado.`)
  } catch {
    toast.error('Não foi possível copiar o contato.')
  }
}

function ContactValue({
  label,
  value,
  displayValue = value,
}: {
  label: string
  value?: string
  displayValue?: string
}) {
  if (!value) return null

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="truncate">{displayValue}</span>
      <Tooltip text={`Copiar ${label.toLowerCase()}`} asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => copyContact(value, label)}
        >
          <span className="sr-only">Copiar {label.toLowerCase()}</span>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </Tooltip>
    </div>
  )
}

function ContactsCell({ authority }: { authority: InstitutionAuthority }) {
  const phone = getPrimaryPhone(authority)
  const email = getPrimaryEmail(authority)

  if (!phone && !email) return '—'

  return (
    <div className="flex max-w-[18rem] flex-col gap-1">
      <ContactValue
        label="Telefone"
        value={phone}
        displayValue={phone ? formatPhoneForDisplay(phone) : undefined}
      />
      <ContactValue label="E-mail" value={email} />
    </div>
  )
}

export function InstitutionAuthoritiesTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [search, setSearch] = useState('')
  const [requestingInstitutionId, setRequestingInstitutionId] = useState('all')
  const [requestingInstitutionName, setRequestingInstitutionName] = useState('')
  const [requestingInstitutionSearch, setRequestingInstitutionSearch] =
    useState('')
  const [
    isRequestingInstitutionFilterOpen,
    setIsRequestingInstitutionFilterOpen,
  ] = useState(false)
  const [focalPointFilter, setFocalPointFilter] =
    useState<FocalPointFilter>('all')
  const [jurisdictionFilter, setJurisdictionFilter] =
    useState<JurisdictionFilter>('all')
  const [sortingState, setSortingState] = useState<SortingState>([])
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteInstitutionAuthorityProps,
    deleteAlertDisclosure,
  } = useInstitutionAuthorities()

  const sortBy = getSortBy(sortingState)
  const sortDirection = getSortDirection(sortingState)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedRequestingInstitutionSearch = useDebounce(
    requestingInstitutionSearch,
    350,
  )
  const hasActiveFilters =
    search.trim().length > 0 ||
    requestingInstitutionId !== 'all' ||
    focalPointFilter !== 'all' ||
    jurisdictionFilter !== 'all'

  function resetPageAndRun(action: () => void) {
    action()
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setRequestingInstitutionId('all')
    setRequestingInstitutionName('')
    setRequestingInstitutionSearch('')
    setFocalPointFilter('all')
    setJurisdictionFilter('all')
    setPage(1)
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSortingState((current) =>
      typeof updater === 'function' ? updater(current) : updater,
    )
    setPage(1)
  }

  const { data: response, isLoading } = useQuery({
    queryKey: [
      'institution-authorities',
      page,
      size,
      debouncedSearch,
      requestingInstitutionId,
      focalPointFilter,
      jurisdictionFilter,
      sortBy,
      sortDirection,
    ],
    queryFn: () =>
      getInstitutionAuthorities({
        page,
        size,
        search: debouncedSearch,
        requestingInstitutionId:
          requestingInstitutionId === 'all'
            ? undefined
            : requestingInstitutionId,
        isFocalPoint: getFocalPointFilterValue(focalPointFilter),
        jurisdictionLevel:
          jurisdictionFilter === 'all' ? undefined : jurisdictionFilter,
        sortBy,
        sortDirection,
      }),
  })

  const {
    data: requestingInstitutionsResponse,
    isLoading: isLoadingRequesters,
  } = useQuery({
    queryKey: [
      'requesting-institutions',
      'filter-options',
      debouncedRequestingInstitutionSearch,
    ],
    queryFn: () =>
      getRequestingInstitutions({
        page: 1,
        size: 20,
        search: debouncedRequestingInstitutionSearch,
        sortBy: 'name',
        sortDirection: 'asc',
      }),
    enabled: isRequestingInstitutionFilterOpen,
  })

  const requestingInstitutionOptions =
    requestingInstitutionsResponse?.data.items ?? []

  const data = response?.data

  const columns: ColumnDef<InstitutionAuthority>[] = [
    {
      accessorKey: 'name',
      header: 'Requisitante',
      enableSorting: true,
    },
    {
      id: 'requesting_institution_name',
      accessorFn: (row) => row.requestingInstitution?.name ?? '',
      header: 'Demandante',
      cell: ({ row }) => row.original.requestingInstitution?.name ?? '—',
      enableSorting: true,
    },
    {
      accessorKey: 'isFocalPoint',
      enableSorting: false,
      header: 'Ponto focal',
      cell: ({ row }) => (row.original.isFocalPoint ? 'Sim' : 'Não'),
    },
    {
      id: 'contacts',
      enableSorting: false,
      header: 'Contatos',
      cell: ({ row }) => <ContactsCell authority={row.original} />,
    },
    {
      id: 'created_at',
      accessorKey: 'createdAt',
      header: 'Criado em',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm')
          : '—',
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => (
        <div className="flex justify-end">
          <p className="w-[4.5rem] text-center">Ações</p>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Tooltip text="Editar" asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setDialogInitialData({ id: row.original.id })
                  formDialogDisclosure.onOpen()
                }}
              >
                <span className="sr-only">Editar</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip text="Excluir" asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setOnDeleteInstitutionAuthorityProps({
                    id: row.original.id,
                    name: row.original.name,
                  })
                  deleteAlertDisclosure.onOpen()
                }}
              >
                <span className="sr-only">Excluir</span>
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-md border bg-background/40 p-3 md:grid-cols-[minmax(16rem,1.5fr)_minmax(12rem,1fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="institution-authorities-search">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="institution-authorities-search"
              value={search}
              onChange={(event) =>
                resetPageAndRun(() => setSearch(event.target.value))
              }
              placeholder="Ex.: João Silva, Polícia Civil"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="institution-authorities-demandante">Demandante</Label>
          <Popover
            open={isRequestingInstitutionFilterOpen}
            onOpenChange={setIsRequestingInstitutionFilterOpen}
          >
            <PopoverTrigger asChild>
              <Button
                id="institution-authorities-demandante"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={isRequestingInstitutionFilterOpen}
                className={cn(
                  'w-full justify-between',
                  requestingInstitutionId === 'all' && 'text-muted-foreground',
                )}
              >
                <span className="truncate">
                  {requestingInstitutionId === 'all'
                    ? 'Todos'
                    : requestingInstitutionName}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  value={requestingInstitutionSearch}
                  onValueChange={setRequestingInstitutionSearch}
                  placeholder="Nome do demandante"
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoadingRequesters ? (
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
                        resetPageAndRun(() => {
                          setRequestingInstitutionId('all')
                          setRequestingInstitutionName('')
                          setRequestingInstitutionSearch('')
                        })
                        setIsRequestingInstitutionFilterOpen(false)
                      }}
                    >
                      Todos
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          requestingInstitutionId === 'all'
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                    {requestingInstitutionOptions.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          resetPageAndRun(() => {
                            setRequestingInstitutionId(item.id)
                            setRequestingInstitutionName(item.name)
                          })
                          setIsRequestingInstitutionFilterOpen(false)
                        }}
                      >
                        <span className="truncate">{item.name}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            requestingInstitutionId === item.id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="institution-authorities-focal-point">
            Ponto focal
          </Label>
          <Select
            value={focalPointFilter}
            onValueChange={(value: FocalPointFilter) =>
              resetPageAndRun(() => setFocalPointFilter(value))
            }
          >
            <SelectTrigger id="institution-authorities-focal-point">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="institution-authorities-jurisdiction">
            Competência
          </Label>
          <Select
            value={jurisdictionFilter}
            onValueChange={(value: JurisdictionFilter) =>
              resetPageAndRun(() => setJurisdictionFilter(value))
            }
          >
            <SelectTrigger id="institution-authorities-jurisdiction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {institutionJurisdictionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        sorting
        sortingState={sortingState}
        onSortingChange={handleSortingChange}
        manualSorting
      />
      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
