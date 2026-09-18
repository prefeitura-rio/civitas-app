'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'

import {
  type FilterComboboxOption,
  MonitoredPlatesFilterCombobox,
} from './monitored-plates-filter-combobox'

const activeOptions = ['all', 'true', 'false'] as const
type ActiveFilter = (typeof activeOptions)[number]

function parseDateOnly(value: string | null | undefined) {
  if (!value) return undefined
  return new Date(`${value}T00:00:00`)
}

function formatDateOnly(date: Date | undefined) {
  if (!date) return undefined
  return format(date, 'yyyy-MM-dd')
}

function readActiveParam(value: string | null): ActiveFilter {
  if (value && activeOptions.includes(value as ActiveFilter)) {
    return value as ActiveFilter
  }
  return 'true'
}

function readValidUntilToParam(searchParams: URLSearchParams) {
  return searchParams.get('validUntilTo')
}

type FilterSnapshot = {
  plateContains: string
  referenceNumberContains: string
  requestingInstitutionId: string
  institutionAuthorityId: string
  active: ActiveFilter
  validUntilTo?: string
  size?: string | null
}

function buildFilterParams({
  plateContains,
  referenceNumberContains,
  requestingInstitutionId,
  institutionAuthorityId,
  active,
  validUntilTo,
  size,
}: FilterSnapshot) {
  const params = new URLSearchParams()
  const plate = plateContains.trim().toUpperCase()

  if (plate) params.set('plateContains', plate)
  if (referenceNumberContains.trim())
    params.set('referenceNumberContains', referenceNumberContains.trim())
  if (requestingInstitutionId !== 'all')
    params.set('requestingInstitutionId', requestingInstitutionId)
  if (institutionAuthorityId !== 'all')
    params.set('institutionAuthorityId', institutionAuthorityId)
  params.set('active', active)
  if (validUntilTo) params.set('validUntilTo', validUntilTo)
  if (size && size !== '10') params.set('size', size)

  return params
}

export function MonitoredPlatesFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()
  const skipNextUrlSync = useRef(false)

  const [plateContains, setPlateContains] = useState(
    () => searchParams.get('plateContains') ?? '',
  )
  const [referenceNumberContains, setReferenceNumberContains] = useState(
    () => searchParams.get('referenceNumberContains') ?? '',
  )
  const [requestingInstitutionId, setRequestingInstitutionId] = useState(
    () => searchParams.get('requestingInstitutionId') ?? 'all',
  )
  const [requestingInstitutionName, setRequestingInstitutionName] = useState('')
  const [requestingInstitutionSearch, setRequestingInstitutionSearch] =
    useState('')
  const [isRequestingInstitutionOpen, setIsRequestingInstitutionOpen] =
    useState(false)
  const [institutionAuthorityId, setInstitutionAuthorityId] = useState(
    () => searchParams.get('institutionAuthorityId') ?? 'all',
  )
  const [institutionAuthorityName, setInstitutionAuthorityName] = useState('')
  const [institutionAuthoritySearch, setInstitutionAuthoritySearch] =
    useState('')
  const [isAuthorityOpen, setIsAuthorityOpen] = useState(false)

  const [active, setActive] = useState<ActiveFilter>(() =>
    readActiveParam(searchParams.get('active')),
  )
  const [endValidUntil, setEndValidUntil] = useState<Date | undefined>(() =>
    parseDateOnly(readValidUntilToParam(searchParams)),
  )

  const debouncedPlateContains = useDebounce(plateContains, 350)
  const debouncedReferenceNumberContains = useDebounce(
    referenceNumberContains,
    350,
  )
  const debouncedRequestingInstitutionSearch = useDebounce(
    requestingInstitutionSearch,
    350,
  )
  const debouncedAuthoritySearch = useDebounce(institutionAuthoritySearch, 350)

  const hasActiveFilters =
    plateContains.trim().length > 0 ||
    referenceNumberContains.trim().length > 0 ||
    requestingInstitutionId !== 'all' ||
    institutionAuthorityId !== 'all' ||
    active !== 'true' ||
    endValidUntil != null

  const { data: authoritiesResponse, isLoading: isLoadingAuthorities } =
    useQuery({
      queryKey: [
        'institution-authorities',
        'filter',
        debouncedAuthoritySearch,
        requestingInstitutionId,
      ],
      queryFn: () =>
        getInstitutionAuthorities({
          page: 1,
          size: 20,
          search: debouncedAuthoritySearch,
          requestingInstitutionId:
            requestingInstitutionId === 'all'
              ? undefined
              : requestingInstitutionId,
        }),
      enabled: isAuthorityOpen || institutionAuthorityId !== 'all',
    })

  const {
    data: requestingInstitutionsResponse,
    isLoading: isLoadingRequestingInstitutions,
  } = useQuery({
    queryKey: [
      'requesting-institutions',
      'filter',
      debouncedRequestingInstitutionSearch,
    ],
    queryFn: () =>
      getRequestingInstitutions({
        page: 1,
        size: 100,
        search: debouncedRequestingInstitutionSearch,
      }),
    enabled: isRequestingInstitutionOpen || requestingInstitutionId !== 'all',
  })

  const requestingInstitutionOptions: FilterComboboxOption[] = (
    requestingInstitutionsResponse?.data.items ?? []
  ).map((item) => ({ id: item.id, label: item.name }))

  const authorityOptions: FilterComboboxOption[] = (
    authoritiesResponse?.data.items ?? []
  ).map((item) => ({ id: item.id, label: item.name }))

  useEffect(() => {
    if (requestingInstitutionId === 'all' || requestingInstitutionName) return
    const match = requestingInstitutionOptions.find(
      (item) => item.id === requestingInstitutionId,
    )
    if (match) setRequestingInstitutionName(match.label)
  }, [
    requestingInstitutionId,
    requestingInstitutionName,
    requestingInstitutionOptions,
  ])

  useEffect(() => {
    if (institutionAuthorityId === 'all' || institutionAuthorityName) return
    const match = authorityOptions.find(
      (item) => item.id === institutionAuthorityId,
    )
    if (match) setInstitutionAuthorityName(match.label)
  }, [authorityOptions, institutionAuthorityId, institutionAuthorityName])

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }

    setPlateContains(searchParams.get('plateContains') ?? '')
    setReferenceNumberContains(
      searchParams.get('referenceNumberContains') ?? '',
    )
    setRequestingInstitutionId(
      searchParams.get('requestingInstitutionId') ?? 'all',
    )
    setInstitutionAuthorityId(
      searchParams.get('institutionAuthorityId') ?? 'all',
    )
    setActive(readActiveParam(searchParams.get('active')))
    setEndValidUntil(parseDateOnly(readValidUntilToParam(searchParams)))
  }, [searchParams])

  useEffect(() => {
    const nextParams = buildFilterParams({
      plateContains: debouncedPlateContains,
      referenceNumberContains: debouncedReferenceNumberContains,
      requestingInstitutionId,
      institutionAuthorityId,
      active,
      validUntilTo: formatDateOnly(endValidUntil),
      size: searchParams.get('size'),
    })
    const nextQuery = nextParams.toString()

    const currentComparable = buildFilterParams({
      plateContains: searchParams.get('plateContains') ?? '',
      referenceNumberContains:
        searchParams.get('referenceNumberContains') ?? '',
      requestingInstitutionId:
        searchParams.get('requestingInstitutionId') ?? 'all',
      institutionAuthorityId:
        searchParams.get('institutionAuthorityId') ?? 'all',
      active: readActiveParam(searchParams.get('active')),
      validUntilTo: readValidUntilToParam(searchParams) ?? undefined,
      size: searchParams.get('size'),
    }).toString()

    if (nextQuery === currentComparable) return

    skipNextUrlSync.current = true
    router.replace(nextQuery ? `${pathName}?${nextQuery}` : pathName)
  }, [
    active,
    debouncedPlateContains,
    debouncedReferenceNumberContains,
    institutionAuthorityId,
    pathName,
    requestingInstitutionId,
    router,
    searchParams,
    endValidUntil,
  ])

  function clearFilters() {
    setPlateContains('')
    setReferenceNumberContains('')
    setRequestingInstitutionId('all')
    setRequestingInstitutionName('')
    setRequestingInstitutionSearch('')
    setInstitutionAuthorityId('all')
    setInstitutionAuthorityName('')
    setInstitutionAuthoritySearch('')
    setActive('true')
    setEndValidUntil(undefined)

    const params = buildFilterParams({
      plateContains: '',
      referenceNumberContains: '',
      requestingInstitutionId: 'all',
      institutionAuthorityId: 'all',
      active: 'true',
      validUntilTo: undefined,
      size: searchParams.get('size'),
    })

    skipNextUrlSync.current = true
    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <div className="grid gap-3 rounded-md border bg-background/40 p-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end xl:grid-cols-[minmax(9rem,0.9fr)_minmax(11rem,1fr)_minmax(12rem,1.1fr)_minmax(12rem,1.1fr)_minmax(12rem,1.1fr)_minmax(11rem,1fr)_auto]">
      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-plate">Placa</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="monitored-plates-plate"
            value={plateContains}
            onChange={(event) =>
              setPlateContains(event.target.value.toUpperCase())
            }
            placeholder="ABC1D23"
            className="h-11 pl-9 uppercase"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-reference-number">
          Número de referência
        </Label>
        <Input
          id="monitored-plates-reference-number"
          value={referenceNumberContains}
          onChange={(event) => setReferenceNumberContains(event.target.value)}
          placeholder="Número de referência"
          className="h-11"
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-requesting-institution">
          Demandante
        </Label>
        <MonitoredPlatesFilterCombobox
          id="monitored-plates-requesting-institution"
          valueId={requestingInstitutionId}
          valueLabel={requestingInstitutionName}
          allLabel="Todos"
          searchPlaceholder="Nome do demandante"
          options={requestingInstitutionOptions}
          isLoading={isLoadingRequestingInstitutions}
          search={requestingInstitutionSearch}
          onSearchChange={setRequestingInstitutionSearch}
          onOpenChange={setIsRequestingInstitutionOpen}
          onSelect={(option) => {
            setInstitutionAuthorityId('all')
            setInstitutionAuthorityName('')
            setInstitutionAuthoritySearch('')
            if (!option) {
              setRequestingInstitutionId('all')
              setRequestingInstitutionName('')
              setRequestingInstitutionSearch('')
              return
            }
            setRequestingInstitutionId(option.id)
            setRequestingInstitutionName(option.label)
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-authority">Requisitante</Label>
        <MonitoredPlatesFilterCombobox
          id="monitored-plates-authority"
          valueId={institutionAuthorityId}
          valueLabel={institutionAuthorityName}
          allLabel="Todos"
          searchPlaceholder="Nome do requisitante"
          options={authorityOptions}
          isLoading={isLoadingAuthorities}
          search={institutionAuthoritySearch}
          onSearchChange={setInstitutionAuthoritySearch}
          onOpenChange={setIsAuthorityOpen}
          onSelect={(option) => {
            if (!option) {
              setInstitutionAuthorityId('all')
              setInstitutionAuthorityName('')
              setInstitutionAuthoritySearch('')
              return
            }
            setInstitutionAuthorityId(option.id)
            setInstitutionAuthorityName(option.label)
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Vence até</Label>
        <DatePicker
          value={endValidUntil}
          onChange={(date) => {
            setEndValidUntil(date instanceof Date ? date : undefined)
          }}
          className="h-11 w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-active">Status</Label>
        <Select
          value={active}
          onValueChange={(value: ActiveFilter) => setActive(value)}
        >
          <SelectTrigger id="monitored-plates-active" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativa (com vínculo ativo)</SelectItem>
            <SelectItem value="false">Inativa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="h-11 gap-2"
      >
        <X className="h-4 w-4" />
        Limpar
      </Button>
    </div>
  )
}
