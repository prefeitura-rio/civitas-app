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
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'

import {
  type FilterComboboxOption,
  MonitoredPlatesFilterCombobox,
} from './monitored-plates-filter-combobox'
import {
  PENDING_CADASTRO_FILTER_ID,
  PENDING_CADASTRO_FILTER_LABEL,
} from './pending-cadastro-filter'

const activeOptions = ['all', 'true', 'false'] as const
type ActiveFilter = (typeof activeOptions)[number]

const NO_AUTHORITY_FILTER_OPTION: FilterComboboxOption = {
  id: PENDING_CADASTRO_FILTER_ID,
  label: PENDING_CADASTRO_FILTER_LABEL,
}

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

function readStartDateParam(searchParams: URLSearchParams) {
  return (
    searchParams.get('startTimeCreate') || searchParams.get('createdAtFrom')
  )
}

function readEndDateParam(searchParams: URLSearchParams) {
  return searchParams.get('endTimeCreate') || searchParams.get('createdAtTo')
}

type FilterSnapshot = {
  plateContains: string
  institutionAuthorityId: string
  notificationChannelId: string
  active: ActiveFilter
  startTimeCreate?: string
  endTimeCreate?: string
  size?: string | null
}

function buildFilterParams({
  plateContains,
  institutionAuthorityId,
  notificationChannelId,
  active,
  startTimeCreate,
  endTimeCreate,
  size,
}: FilterSnapshot) {
  const params = new URLSearchParams()
  const plate = plateContains.trim().toUpperCase()

  if (plate) params.set('plateContains', plate)
  if (institutionAuthorityId !== 'all')
    params.set('institutionAuthorityId', institutionAuthorityId)
  if (notificationChannelId !== 'all')
    params.set('notificationChannelId', notificationChannelId)
  params.set('active', active)
  if (startTimeCreate) params.set('startTimeCreate', startTimeCreate)
  if (endTimeCreate) params.set('endTimeCreate', endTimeCreate)
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
  const [institutionAuthorityId, setInstitutionAuthorityId] = useState(
    () => searchParams.get('institutionAuthorityId') ?? 'all',
  )
  const [institutionAuthorityName, setInstitutionAuthorityName] = useState(
    () =>
      searchParams.get('institutionAuthorityId') === PENDING_CADASTRO_FILTER_ID
        ? NO_AUTHORITY_FILTER_OPTION.label
        : '',
  )
  const [institutionAuthoritySearch, setInstitutionAuthoritySearch] =
    useState('')
  const [isAuthorityOpen, setIsAuthorityOpen] = useState(false)

  const [notificationChannelId, setNotificationChannelId] = useState(
    () => searchParams.get('notificationChannelId') ?? 'all',
  )
  const [notificationChannelTitle, setNotificationChannelTitle] = useState('')
  const [notificationChannelSearch, setNotificationChannelSearch] = useState('')
  const [isChannelOpen, setIsChannelOpen] = useState(false)

  const [active, setActive] = useState<ActiveFilter>(() =>
    readActiveParam(searchParams.get('active')),
  )
  const [startTimeCreate, setStartTimeCreate] = useState<Date | undefined>(() =>
    parseDateOnly(readStartDateParam(searchParams)),
  )
  const [endTimeCreate, setEndTimeCreate] = useState<Date | undefined>(() =>
    parseDateOnly(readEndDateParam(searchParams)),
  )

  const debouncedPlateContains = useDebounce(plateContains, 350)
  const debouncedAuthoritySearch = useDebounce(institutionAuthoritySearch, 350)
  const debouncedChannelSearch = useDebounce(notificationChannelSearch, 350)

  const hasActiveFilters =
    plateContains.trim().length > 0 ||
    institutionAuthorityId !== 'all' ||
    notificationChannelId !== 'all' ||
    active !== 'true' ||
    startTimeCreate != null ||
    endTimeCreate != null

  const { data: authoritiesResponse, isLoading: isLoadingAuthorities } =
    useQuery({
      queryKey: ['institution-authorities', 'filter', debouncedAuthoritySearch],
      queryFn: () =>
        getInstitutionAuthorities({
          page: 1,
          size: 20,
          search: debouncedAuthoritySearch,
        }),
      enabled:
        isAuthorityOpen ||
        (institutionAuthorityId !== 'all' &&
          institutionAuthorityId !== PENDING_CADASTRO_FILTER_ID),
    })

  const { data: channelsResponse, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['notification-channels', 'filter', 100],
    queryFn: () => getNotificationChannels({ page: 1, size: 100 }),
    enabled: isChannelOpen || notificationChannelId !== 'all',
  })

  const authorityOptions: FilterComboboxOption[] = (
    authoritiesResponse?.data.items ?? []
  ).map((item) => ({ id: item.id, label: item.name }))

  const channelOptions: FilterComboboxOption[] = (
    channelsResponse?.data.items ?? []
  )
    .filter((item) => {
      const query = debouncedChannelSearch.trim().toLowerCase()
      if (!query) return true
      return (item.title || item.id).toLowerCase().includes(query)
    })
    .map((item) => ({
      id: item.id,
      label: item.title || item.id,
    }))

  useEffect(() => {
    if (
      institutionAuthorityId === 'all' ||
      institutionAuthorityId === PENDING_CADASTRO_FILTER_ID ||
      institutionAuthorityName
    )
      return
    const match = authorityOptions.find(
      (item) => item.id === institutionAuthorityId,
    )
    if (match) setInstitutionAuthorityName(match.label)
  }, [authorityOptions, institutionAuthorityId, institutionAuthorityName])

  useEffect(() => {
    if (notificationChannelId === 'all' || notificationChannelTitle) return
    const match = channelOptions.find(
      (item) => item.id === notificationChannelId,
    )
    if (match) setNotificationChannelTitle(match.label)
  }, [channelOptions, notificationChannelId, notificationChannelTitle])

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }

    setPlateContains(searchParams.get('plateContains') ?? '')
    const nextAuthorityId = searchParams.get('institutionAuthorityId') ?? 'all'
    setInstitutionAuthorityId(nextAuthorityId)
    if (nextAuthorityId === PENDING_CADASTRO_FILTER_ID) {
      setInstitutionAuthorityName(NO_AUTHORITY_FILTER_OPTION.label)
    } else if (nextAuthorityId === 'all') {
      setInstitutionAuthorityName('')
    }
    setNotificationChannelId(searchParams.get('notificationChannelId') ?? 'all')
    setActive(readActiveParam(searchParams.get('active')))
    setStartTimeCreate(parseDateOnly(readStartDateParam(searchParams)))
    setEndTimeCreate(parseDateOnly(readEndDateParam(searchParams)))
  }, [searchParams])

  useEffect(() => {
    const nextParams = buildFilterParams({
      plateContains: debouncedPlateContains,
      institutionAuthorityId,
      notificationChannelId,
      active,
      startTimeCreate: formatDateOnly(startTimeCreate),
      endTimeCreate: formatDateOnly(endTimeCreate),
      size: searchParams.get('size'),
    })
    const nextQuery = nextParams.toString()

    const currentComparable = buildFilterParams({
      plateContains: searchParams.get('plateContains') ?? '',
      institutionAuthorityId:
        searchParams.get('institutionAuthorityId') ?? 'all',
      notificationChannelId: searchParams.get('notificationChannelId') ?? 'all',
      active: readActiveParam(searchParams.get('active')),
      startTimeCreate: readStartDateParam(searchParams) ?? undefined,
      endTimeCreate: readEndDateParam(searchParams) ?? undefined,
      size: searchParams.get('size'),
    }).toString()

    if (nextQuery === currentComparable) return

    skipNextUrlSync.current = true
    router.replace(nextQuery ? `${pathName}?${nextQuery}` : pathName)
  }, [
    active,
    debouncedPlateContains,
    endTimeCreate,
    institutionAuthorityId,
    notificationChannelId,
    pathName,
    router,
    searchParams,
    startTimeCreate,
  ])

  function clearFilters() {
    setPlateContains('')
    setInstitutionAuthorityId('all')
    setInstitutionAuthorityName('')
    setInstitutionAuthoritySearch('')
    setNotificationChannelId('all')
    setNotificationChannelTitle('')
    setNotificationChannelSearch('')
    setActive('true')
    setStartTimeCreate(undefined)
    setEndTimeCreate(undefined)

    const params = buildFilterParams({
      plateContains: '',
      institutionAuthorityId: 'all',
      notificationChannelId: 'all',
      active: 'true',
      size: searchParams.get('size'),
    })

    skipNextUrlSync.current = true
    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <div className="grid gap-3 rounded-md border bg-background/40 p-3 md:grid-cols-[minmax(9rem,0.9fr)_minmax(12rem,1.1fr)_minmax(12rem,1.1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(12rem,1.1fr)_auto] md:items-end">
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
            className="pl-9 uppercase"
            autoComplete="off"
          />
        </div>
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
          pinnedOptions={[NO_AUTHORITY_FILTER_OPTION]} // TODO(pending-cadastro)
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
        <Label htmlFor="monitored-plates-channel">Canal</Label>
        <MonitoredPlatesFilterCombobox
          id="monitored-plates-channel"
          valueId={notificationChannelId}
          valueLabel={notificationChannelTitle}
          allLabel="Todos"
          searchPlaceholder="Nome do canal"
          options={channelOptions}
          isLoading={isLoadingChannels}
          search={notificationChannelSearch}
          onSearchChange={setNotificationChannelSearch}
          onOpenChange={setIsChannelOpen}
          onSelect={(option) => {
            if (!option) {
              setNotificationChannelId('all')
              setNotificationChannelTitle('')
              setNotificationChannelSearch('')
              return
            }
            setNotificationChannelId(option.id)
            setNotificationChannelTitle(option.label)
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Data de criação de</Label>
        <DatePicker
          value={startTimeCreate}
          onChange={(date) => {
            setStartTimeCreate(date instanceof Date ? date : undefined)
          }}
          className="h-9 w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Até</Label>
        <DatePicker
          value={endTimeCreate}
          onChange={(date) => {
            setEndTimeCreate(date instanceof Date ? date : undefined)
          }}
          className="h-9 w-full"
          fromDate={startTimeCreate}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-active">Status</Label>
        <Select
          value={active}
          onValueChange={(value: ActiveFilter) => setActive(value)}
        >
          <SelectTrigger id="monitored-plates-active">
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
        className="gap-2"
      >
        <X className="h-4 w-4" />
        Limpar
      </Button>
    </div>
  )
}
