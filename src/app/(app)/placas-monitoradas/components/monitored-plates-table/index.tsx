'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
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
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getInstitutionAuthority } from '@/http/institution-authorities'
import {
  getMonitoredPlates,
  type MonitoredPlateReadModel,
} from '@/http/monitored-plates'
import type { InstitutionAuthority } from '@/models/entities'
import { notAllowed } from '@/utils/template-messages'

export function MonitoredPlatesTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useMonitoredPlatesSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteMonitoredPlateProps,
    deleteAlertDisclosure,
  } = useMonitoredPlates()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const [selectedAuthority, setSelectedAuthority] =
    useState<InstitutionAuthority | null>(null)

  const { data: monitoredPlatesResponse, isLoading: isMonitoredPlatesLoading } =
    useQuery({
      queryKey,
      queryFn: () =>
        getMonitoredPlates({
          active: formattedSearchParams.active,
          plateContains: formattedSearchParams.plateContains,
          institutionAuthorityName:
            formattedSearchParams.institutionAuthorityName,
          notificationChannelTitle:
            formattedSearchParams.notificationChannelTitle,
          startTimeCreate: formattedSearchParams.startTimeCreate,
          endTimeCreate: formattedSearchParams.endTimeCreate,
          page: formattedSearchParams.page,
          size: formattedSearchParams.size,
        }),
    })

  const data = monitoredPlatesResponse?.data
  const canEditMonitoredPlates = Boolean(profile?.is_admin)

  const openEditDialog = (plate: MonitoredPlateReadModel['plate']) => {
    setDialogInitialData({ plate })
    formDialogDisclosure.onOpen()
  }

  const { data: authorityDetail, isLoading: isAuthorityDetailLoading } =
    useQuery({
      queryKey: ['institution-authorities', selectedAuthority?.id],
      queryFn: () => getInstitutionAuthority({ id: selectedAuthority!.id }),
      enabled: Boolean(selectedAuthority?.id),
    })

  const displayedAuthority = authorityDetail ?? selectedAuthority

  const currentPage = formattedSearchParams.page ?? 1
  const pageSize = formattedSearchParams.size ?? 10
  const paginatedItems = data?.items ?? []
  const total = data?.total ?? 0

  const columns: ColumnDef<MonitoredPlateReadModel>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
      cell: ({ row }) => row.original.notes || ' - ',
    },
    {
      id: 'authorities',
      header: 'Requisitantes',
      cell: ({ row }) => {
        const uniqueAuthorities = Array.from(
          new Map(
            row.original.authorities.map((authority) => [
              authority.institutionAuthority.id,
              authority.institutionAuthority,
            ]),
          ).values(),
        )

        if (uniqueAuthorities.length === 0) {
          return <span className="text-sm text-muted-foreground">Nenhum</span>
        }

        const visibleAuthorities = uniqueAuthorities.slice(0, 2)
        const hiddenCount = uniqueAuthorities.length - visibleAuthorities.length

        return (
          <div className="flex flex-wrap gap-1">
            {visibleAuthorities.map((authority) => (
              <Button
                key={authority.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSelectedAuthority(authority)}
              >
                {authority.name}
              </Button>
            ))}
            {hiddenCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 bg-muted px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => openEditDialog(row.original.plate)}
                disabled={!canEditMonitoredPlates}
              >
                +{hiddenCount}
              </Button>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de criação',
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')
          : ' - ',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última atualização',
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
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Tooltip
              disabled={!profile || !profile?.is_admin}
              disabledText={notAllowed}
              text="Editar"
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => openEditDialog(row.original.plate)}
                disabled={!canEditMonitoredPlates}
              >
                <span className="sr-only">Editar linha</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text="Excluir"
              disabled={!profile || !profile?.is_admin}
              disabledText={notAllowed}
              asChild
            >
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
                disabled={!profile || !profile?.is_admin}
              >
                <span className="sr-only">Excluir linha</span>
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
          isLoading={isMonitoredPlatesLoading || isProfileLoading}
        />
        <Pagination
          page={currentPage}
          total={total}
          size={pageSize}
          onPageChange={handlePaginate}
        />
      </div>

      <Dialog
        open={Boolean(selectedAuthority)}
        onOpenChange={(open) => {
          if (!open) setSelectedAuthority(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAuthority?.name ?? 'Requisitante'}
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
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
