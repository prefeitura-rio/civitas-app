'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'
import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { useMonitoredPlatesSearchParams } from '@/hooks/useParams/useMonitoredPlatesSearchParams'
import { getInstitutionAuthority } from '@/http/institution-authorities'
import {
  type EmbeddedInstitutionAuthority,
  getMonitoredPlates,
  type MonitoredPlateAuthoritySummary,
  type MonitoredPlateReadModel,
  type MonitoredPlatesSortBy,
  type SortDirection,
} from '@/http/monitored-plates'
import type { NotificationChannel } from '@/models/entities'
import type { VehicleType } from '@/models/monitored-plates'

type AuthorityEntry = {
  institutionAuthority: EmbeddedInstitutionAuthority
  notificationChannels: NotificationChannel[]
  referenceNumber: string
  validUntil: string
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  moto: 'Moto',
  carro: 'Carro',
  onibus: 'Ônibus',
  bonde: 'Bonde',
  reboque: 'Reboque',
  caminhao: 'Caminhão',
  trator: 'Trator',
  caminhonete: 'Caminhonete',
  utilitario: 'Utilitário',
  motorhome: 'Motorhome',
}

function formatVehicleSummary(plate: MonitoredPlateReadModel): {
  line1: string | null
  line2: string | null
} {
  const typePart = plate.vehicleType
    ? VEHICLE_TYPE_LABELS[plate.vehicleType]
    : null
  const colorPart = plate.color?.trim() || null
  const brandPart = plate.brand?.trim() || null
  const modelPart = plate.model?.trim() || null
  const modelYearPart = plate.modelYear?.trim() || null
  const manufactureYearPart = plate.manufactureYear?.trim() || null

  const line1Parts = [typePart, colorPart].filter(Boolean)
  const line1 = line1Parts.length > 0 ? line1Parts.join(' · ') : null

  const brandModel = [brandPart, modelPart].filter(Boolean).join(' ')
  const yearsPart =
    modelYearPart && manufactureYearPart
      ? `${modelYearPart} (fab. ${manufactureYearPart})`
      : (modelYearPart ??
        (manufactureYearPart ? `fab. ${manufactureYearPart}` : null))
  const line2Parts = [brandModel || null, yearsPart].filter(Boolean)
  const line2 = line2Parts.length > 0 ? line2Parts.join(' · ') : null

  return { line1, line2 }
}

const sortableColumns = {
  plate: 'plate',
  active: 'active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const satisfies Record<string, MonitoredPlatesSortBy>

function getSortBy(
  sortingState: SortingState,
): MonitoredPlatesSortBy | undefined {
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

function buildAuthorityEntries(
  authorities: MonitoredPlateAuthoritySummary[],
): AuthorityEntry[] {
  const map = new Map<string, AuthorityEntry>()

  for (const authority of authorities) {
    if (!authority.active) continue

    const id = authority.institutionAuthority.id
    if (!map.has(id)) {
      map.set(id, {
        institutionAuthority: authority.institutionAuthority,
        notificationChannels: [...authority.notificationChannels],
        referenceNumber: authority.referenceNumber,
        validUntil: authority.validUntil,
      })
    } else {
      const existing = map.get(id)!
      for (const ch of authority.notificationChannels) {
        if (!existing.notificationChannels.some((ec) => ec.id === ch.id)) {
          existing.notificationChannels.push(ch)
        }
      }
    }
  }

  return Array.from(map.values())
}

function filterAuthoritiesByValidUntil(
  authorities: MonitoredPlateAuthoritySummary[],
  validUntilTo?: string,
) {
  if (!validUntilTo) return authorities

  const endOfDay = new Date(`${validUntilTo}T23:59:59.999`).getTime()
  if (Number.isNaN(endOfDay)) return authorities

  return authorities.filter(
    (authority) => new Date(authority.validUntil).getTime() <= endOfDay,
  )
}

export function MonitoredPlatesTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useMonitoredPlatesSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteMonitoredPlateProps,
    deleteAlertDisclosure,
  } = useMonitoredPlates()
  const [selectedEntry, setSelectedEntry] = useState<AuthorityEntry | null>(
    null,
  )
  const [selectedEntries, setSelectedEntries] = useState<
    AuthorityEntry[] | null
  >(null)
  const [selectedEntriesPlate, setSelectedEntriesPlate] = useState<
    string | null
  >(null)
  const [sortingState, setSortingState] = useState<SortingState>([])

  const sortBy = getSortBy(sortingState)
  const sortDirection = getSortDirection(sortingState)

  const handleSortingChange = (
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) => {
    setSortingState((current) =>
      typeof updater === 'function' ? updater(current) : updater,
    )
    handlePaginate(1)
  }

  const { data: monitoredPlatesResponse, isLoading: isMonitoredPlatesLoading } =
    useQuery({
      queryKey: [...queryKey, sortBy, sortDirection],
      queryFn: () =>
        getMonitoredPlates({
          active: formattedSearchParams.active,
          plateContains: formattedSearchParams.plateContains,
          referenceNumberContains:
            formattedSearchParams.referenceNumberContains,
          requestingInstitutionId:
            formattedSearchParams.requestingInstitutionId,
          institutionAuthorityId: formattedSearchParams.institutionAuthorityId,
          validUntilTo: formattedSearchParams.validUntilTo,
          page: formattedSearchParams.page,
          size: formattedSearchParams.size,
          sortBy,
          sortDirection,
        }),
    })

  const data = monitoredPlatesResponse?.data

  const openEditDialog = (plate: MonitoredPlateReadModel['plate']) => {
    setDialogInitialData({ plate })
    formDialogDisclosure.onOpen()
  }

  const { data: authorityDetail, isLoading: isAuthorityDetailLoading } =
    useQuery({
      queryKey: [
        'institution-authorities',
        selectedEntry?.institutionAuthority.id,
      ],
      queryFn: () =>
        getInstitutionAuthority({ id: selectedEntry!.institutionAuthority.id }),
      enabled: Boolean(selectedEntry?.institutionAuthority.id),
    })

  const displayedAuthority =
    authorityDetail ?? selectedEntry?.institutionAuthority

  const currentPage = formattedSearchParams.page ?? 1
  const pageSize = formattedSearchParams.size ?? 10
  const paginatedItems = data?.items ?? []
  const total = data?.total ?? 0

  const columns: ColumnDef<MonitoredPlateReadModel>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
      enableSorting: true,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => (row.original.active ? 'Ativa' : 'Inativa'),
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
      enableSorting: false,
      cell: ({ row }) => row.original.notes || ' - ',
    },
    // TODO: remove after monitored plate authority is fully implemented
    {
      accessorKey: 'contactInfo',
      header: 'Informações de contato [LEGADO]',
      enableSorting: false,
      cell: ({ row }) => row.original.contactInfo || ' - ',
    },
    {
      id: 'vehicle',
      header: 'Veículo',
      enableSorting: false,
      cell: ({ row }) => {
        const { line1, line2 } = formatVehicleSummary(row.original)
        if (!line1 && !line2) {
          return <span className="text-sm text-muted-foreground"> - </span>
        }
        return (
          <div className="flex flex-col gap-0.5 text-sm">
            {line1 ? <span>{line1}</span> : null}
            {line2 ? (
              <span className="text-muted-foreground">{line2}</span>
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'authorities',
      header: 'Requisitantes',
      enableSorting: false,
      cell: ({ row }) => {
        const entries = buildAuthorityEntries(
          filterAuthoritiesByValidUntil(
            row.original.authorities,
            formattedSearchParams.validUntilTo,
          ),
        )

        if (entries.length === 0) {
          return <span className="text-sm text-muted-foreground">Nenhum</span>
        }

        const visibleEntries = entries.slice(0, 2)
        const hiddenCount = entries.length - visibleEntries.length

        return (
          <div className="flex flex-wrap gap-1">
            {visibleEntries.map((entry) => (
              <Button
                key={entry.institutionAuthority.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto min-h-7 px-2 py-1 text-xs"
                onClick={() => setSelectedEntry(entry)}
              >
                <span className="flex flex-col items-start">
                  <span>{entry.institutionAuthority.name}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    Ref. {entry.referenceNumber} · Até{' '}
                    {formatDate(new Date(entry.validUntil), 'dd/MM/yyyy')}
                  </span>
                </span>
              </Button>
            ))}
            {hiddenCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 bg-muted px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedEntries(entries)
                  setSelectedEntriesPlate(row.original.plate)
                }}
              >
                +{hiddenCount}
              </Button>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última atualização',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.updatedAt
          ? formatDate(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm')
          : ' - ',
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end">
          <p className="w-[4.5rem] text-center">Ações</p>
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Tooltip text="Editar" asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => openEditDialog(row.original.plate)}
              >
                <span className="sr-only">Editar linha</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip text="Desativar vínculos" asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setOnDeleteMonitoredPlateProps({
                    plate: row.original.plate,
                  })
                  deleteAlertDisclosure.onOpen()
                }}
              >
                <span className="sr-only">Desativar vínculos da linha</span>
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-8">
        <DataTable
          columns={columns}
          data={paginatedItems}
          isLoading={isMonitoredPlatesLoading}
          sorting
          sortingState={sortingState}
          onSortingChange={handleSortingChange}
          manualSorting
        />
        <Pagination
          page={currentPage}
          total={total}
          size={pageSize}
          onPageChange={handlePaginate}
        />
      </div>

      <Dialog
        open={Boolean(selectedEntries)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntries(null)
            setSelectedEntriesPlate(null)
          }
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b bg-muted/20 px-6 py-5">
            <DialogTitle>Requisitantes vinculados</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Placa</span>
              <span className="rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                {selectedEntriesPlate ?? ' - '}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {selectedEntries?.length ?? 0} vínculo
                {(selectedEntries?.length ?? 0) === 1 ? '' : 's'} ativo
                {(selectedEntries?.length ?? 0) === 1 ? '' : 's'}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(32rem,65vh)] flex-col gap-2 overflow-y-auto px-6 py-5">
            {selectedEntries?.map((entry) => (
              <Button
                key={entry.institutionAuthority.id}
                type="button"
                variant="ghost"
                className="group h-auto w-full justify-start whitespace-normal rounded-lg border bg-background p-3 text-left hover:bg-muted/40"
                onClick={() => {
                  setSelectedEntries(null)
                  setSelectedEntriesPlate(null)
                  setSelectedEntry(entry)
                }}
              >
                <span className="flex min-w-0 flex-col items-start gap-1">
                  <span className="w-full break-words font-medium text-foreground">
                    {entry.institutionAuthority.name}
                  </span>
                  <span className="w-full break-words text-xs font-normal text-muted-foreground">
                    {entry.institutionAuthority.requestingInstitution.name}
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground">
                    <span>Ref. {entry.referenceNumber}</span>
                    <span>
                      Válido até{' '}
                      {formatDate(new Date(entry.validUntil), 'dd/MM/yyyy')}
                    </span>
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedEntry)}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.institutionAuthority.name ?? 'Requisitante'}
            </DialogTitle>
            <DialogDescription>
              Informações do requisitante vinculado a esta placa monitorada.
            </DialogDescription>
          </DialogHeader>

          {isAuthorityDetailLoading && !authorityDetail ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="size-5" />
            </div>
          ) : displayedAuthority ? (
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="font-medium">Demandante:</span>{' '}
                {displayedAuthority.requestingInstitution?.name ?? ' - '}
              </div>
              <div>
                <span className="font-medium">Telefone principal:</span>{' '}
                {displayedAuthority.primaryContact?.phone?.phone ?? ' - '}
              </div>
              <div>
                <span className="font-medium">E-mail principal:</span>{' '}
                {displayedAuthority.primaryContact?.email?.email ?? ' - '}
              </div>
              <div>
                <span className="font-medium">Telefones adicionais:</span>{' '}
                {displayedAuthority.contacts?.phones
                  ?.map((item) => item.phone)
                  .filter(
                    (value): value is string =>
                      Boolean(value) &&
                      value !== displayedAuthority.primaryContact?.phone?.phone,
                  )
                  .join(', ') || ' - '}
              </div>
              <div>
                <span className="font-medium">E-mails adicionais:</span>{' '}
                {displayedAuthority.contacts?.emails
                  ?.map((item) => item.email)
                  .filter(
                    (value): value is string =>
                      Boolean(value) &&
                      value !== displayedAuthority.primaryContact?.email?.email,
                  )
                  .join(', ') || ' - '}
              </div>
              <div>
                <span className="font-medium">Ponto focal:</span>{' '}
                {displayedAuthority.isFocalPoint ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Canais de notificação:</span>{' '}
                {selectedEntry?.notificationChannels.length
                  ? selectedEntry.notificationChannels
                      .map((ch) => ch.title || ch.id)
                      .join(', ')
                  : ' - '}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
