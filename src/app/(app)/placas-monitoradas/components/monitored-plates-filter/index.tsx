'use client'

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

function readStartDateParam(searchParams: URLSearchParams) {
  return (
    searchParams.get('startTimeCreate') || searchParams.get('createdAtFrom')
  )
}

function readEndDateParam(searchParams: URLSearchParams) {
  return searchParams.get('endTimeCreate') || searchParams.get('createdAtTo')
}

function buildFilterParams({
  plateContains,
  institutionAuthorityName,
  notificationChannelTitle,
  active,
  startTimeCreate,
  endTimeCreate,
  size,
}: {
  plateContains: string
  institutionAuthorityName: string
  notificationChannelTitle: string
  active: ActiveFilter
  startTimeCreate?: string
  endTimeCreate?: string
  size?: string | null
}) {
  const params = new URLSearchParams()
  const plate = plateContains.trim().toUpperCase()
  const authority = institutionAuthorityName.trim()
  const channel = notificationChannelTitle.trim()

  if (plate) params.set('plateContains', plate)
  if (authority) params.set('institutionAuthorityName', authority)
  if (channel) params.set('notificationChannelTitle', channel)
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
  const [institutionAuthorityName, setInstitutionAuthorityName] = useState(
    () => searchParams.get('institutionAuthorityName') ?? '',
  )
  const [notificationChannelTitle, setNotificationChannelTitle] = useState(
    () => searchParams.get('notificationChannelTitle') ?? '',
  )
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
  const debouncedInstitutionAuthorityName = useDebounce(
    institutionAuthorityName,
    350,
  )
  const debouncedNotificationChannelTitle = useDebounce(
    notificationChannelTitle,
    350,
  )

  const hasActiveFilters =
    plateContains.trim().length > 0 ||
    institutionAuthorityName.trim().length > 0 ||
    notificationChannelTitle.trim().length > 0 ||
    active !== 'true' ||
    startTimeCreate != null ||
    endTimeCreate != null

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }

    setPlateContains(searchParams.get('plateContains') ?? '')
    setInstitutionAuthorityName(
      searchParams.get('institutionAuthorityName') ?? '',
    )
    setNotificationChannelTitle(
      searchParams.get('notificationChannelTitle') ?? '',
    )
    setActive(readActiveParam(searchParams.get('active')))
    setStartTimeCreate(parseDateOnly(readStartDateParam(searchParams)))
    setEndTimeCreate(parseDateOnly(readEndDateParam(searchParams)))
  }, [searchParams])

  useEffect(() => {
    const nextParams = buildFilterParams({
      plateContains: debouncedPlateContains,
      institutionAuthorityName: debouncedInstitutionAuthorityName,
      notificationChannelTitle: debouncedNotificationChannelTitle,
      active,
      startTimeCreate: formatDateOnly(startTimeCreate),
      endTimeCreate: formatDateOnly(endTimeCreate),
      size: searchParams.get('size'),
    })
    const nextQuery = nextParams.toString()

    const currentComparable = buildFilterParams({
      plateContains: searchParams.get('plateContains') ?? '',
      institutionAuthorityName:
        searchParams.get('institutionAuthorityName') ?? '',
      notificationChannelTitle:
        searchParams.get('notificationChannelTitle') ?? '',
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
    debouncedInstitutionAuthorityName,
    debouncedNotificationChannelTitle,
    debouncedPlateContains,
    endTimeCreate,
    pathName,
    router,
    searchParams,
    startTimeCreate,
  ])

  function clearFilters() {
    setPlateContains('')
    setInstitutionAuthorityName('')
    setNotificationChannelTitle('')
    setActive('true')
    setStartTimeCreate(undefined)
    setEndTimeCreate(undefined)

    const params = buildFilterParams({
      plateContains: '',
      institutionAuthorityName: '',
      notificationChannelTitle: '',
      active: 'true',
      size: searchParams.get('size'),
    })

    skipNextUrlSync.current = true
    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <div className="grid gap-3 rounded-md border bg-background/40 p-3 md:grid-cols-[minmax(9rem,0.9fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(11rem,1.1fr)_minmax(11rem,1.1fr)_minmax(12rem,1fr)_auto] md:items-end">
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
        <Input
          id="monitored-plates-authority"
          value={institutionAuthorityName}
          onChange={(event) => setInstitutionAuthorityName(event.target.value)}
          placeholder="Nome do requisitante"
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monitored-plates-channel">Canal</Label>
        <Input
          id="monitored-plates-channel"
          value={notificationChannelTitle}
          onChange={(event) => setNotificationChannelTitle(event.target.value)}
          placeholder="Nome do canal"
          autoComplete="off"
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
