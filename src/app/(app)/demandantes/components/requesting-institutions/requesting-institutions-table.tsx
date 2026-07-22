'use client'
import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Search, Trash, X } from 'lucide-react'
import { useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  institutionJurisdictionLabels,
  institutionJurisdictionOptions,
} from '@/constants/institutions'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import {
  getRequestingInstitutions,
  type RequestingInstitution,
  type RequestingInstitutionSortBy,
  type SortDirection,
} from '@/http/requesting-institutions'
import { notAllowed } from '@/utils/template-messages'

const sortableColumns = {
  name: 'name',
  type: 'type',
  agency: 'agency',
  jurisdiction_level: 'jurisdiction_level',
  created_at: 'created_at',
} as const satisfies Record<string, RequestingInstitutionSortBy>

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

export function RequestingInstitutionsTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [jurisdictionFilter, setJurisdictionFilter] =
    useState<JurisdictionFilter>('all')
  const [sortingState, setSortingState] = useState<SortingState>([])
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteRequestingInstitutionProps,
    deleteAlertDisclosure,
  } = useRequestingInstitutions()
  const { data: profile } = useProfile()

  const sortBy = getSortBy(sortingState)
  const sortDirection = getSortDirection(sortingState)
  const debouncedSearch = useDebounce(search, 350)
  const debouncedTypeFilter = useDebounce(typeFilter, 350)
  const debouncedAgencyFilter = useDebounce(agencyFilter, 350)
  const hasActiveFilters =
    search.trim().length > 0 ||
    typeFilter.trim().length > 0 ||
    agencyFilter.trim().length > 0 ||
    jurisdictionFilter !== 'all'

  function resetPageAndRun(action: () => void) {
    action()
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setTypeFilter('')
    setAgencyFilter('')
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
      'requesting-institutions',
      page,
      size,
      debouncedSearch,
      debouncedTypeFilter,
      debouncedAgencyFilter,
      jurisdictionFilter,
      sortBy,
      sortDirection,
    ],
    queryFn: () =>
      getRequestingInstitutions({
        page,
        size,
        search: debouncedSearch,
        type: debouncedTypeFilter,
        agency: debouncedAgencyFilter,
        jurisdictionLevel:
          jurisdictionFilter === 'all' ? undefined : jurisdictionFilter,
        sortBy,
        sortDirection,
      }),
  })

  const data = response?.data

  const columns: ColumnDef<RequestingInstitution>[] = [
    {
      accessorKey: 'name',
      header: 'Demandante',
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      enableSorting: true,
    },
    {
      accessorKey: 'agency',
      header: 'Órgão',
      enableSorting: true,
    },
    {
      id: 'jurisdiction_level',
      accessorKey: 'jurisdictionLevel',
      header: 'Competência',
      cell: ({ row }) =>
        institutionJurisdictionLabels[row.original.jurisdictionLevel],
      enableSorting: true,
    },
    {
      id: 'created_at',
      accessorKey: 'createdAt',
      header: 'Criada em',
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
            <Tooltip
              text="Editar"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setDialogInitialData({ id: row.original.id })
                  formDialogDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
              >
                <span className="sr-only">Editar</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text="Excluir"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setOnDeleteRequestingInstitutionProps({
                    id: row.original.id,
                    name: row.original.name,
                  })
                  deleteAlertDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
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
      <div className="grid gap-3 rounded-md border bg-background/40 p-3 md:grid-cols-[minmax(16rem,1.4fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="requesting-institutions-search">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="requesting-institutions-search"
              value={search}
              onChange={(event) =>
                resetPageAndRun(() => setSearch(event.target.value))
              }
              placeholder="Demandante"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="requesting-institutions-type">Tipo</Label>
          <Input
            id="requesting-institutions-type"
            value={typeFilter}
            onChange={(event) =>
              resetPageAndRun(() => setTypeFilter(event.target.value))
            }
            placeholder="Tipo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="requesting-institutions-agency">Órgão</Label>
          <Input
            id="requesting-institutions-agency"
            value={agencyFilter}
            onChange={(event) =>
              resetPageAndRun(() => setAgencyFilter(event.target.value))
            }
            placeholder="Órgão"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="requesting-institutions-jurisdiction">
            Competência
          </Label>
          <Select
            value={jurisdictionFilter}
            onValueChange={(value: JurisdictionFilter) =>
              resetPageAndRun(() => setJurisdictionFilter(value))
            }
          >
            <SelectTrigger id="requesting-institutions-jurisdiction">
              <SelectValue placeholder="Todas" />
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
