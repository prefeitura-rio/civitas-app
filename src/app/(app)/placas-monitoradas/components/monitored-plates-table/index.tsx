'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { useMonitoredPlatesSearchParams } from '@/hooks/useParams/useMonitoredPlatesSearchParams'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getMonitoredPlates } from '@/http/cars/monitored/get-monitored-plates'
import type { DemandantLink, MonitoredPlate } from '@/models/entities'
import { notAllowed } from '@/utils/template-messages'

function formatDemandantContactLine(demandant: DemandantLink['demandant']) {
  const parts = [
    demandant.email,
    demandant.phone_1,
    demandant.phone_2,
    demandant.phone_3,
  ].filter((value): value is string => Boolean(value && value.trim()))

  return parts.length ? parts.join(', ') : '—'
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
  // const [plate, setPlate] = useState<string>()
  const { data: profile, isLoading: isProfileLoading } = useProfile()

  const { data: MonitoredPlatesResponse, isLoading: isMonitoredPlatesLoading } =
    useQuery({
      queryKey,
      queryFn: () =>
        getMonitoredPlates({
          ...formattedSearchParams,
        }),
    })

  // const {
  //   mutateAsync: updateMonitoredPlateMutation,
  //   isPending: IsUpdatingLoading,
  // } = useMutation({
  //   mutationFn: updateMonitoredPlate,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
  //   },
  // })

  const data = MonitoredPlatesResponse?.data

  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      id: 'contacts',
      header: 'Contatos',
      cell: ({ row }) => {
        const links = row.original.demandantLinks ?? []
        const legacy = row.original.contactInfo?.trim()

        const count = links.length > 0 ? links.length : legacy ? 1 : 0

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Contatos ({count})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[26rem]">
              {links.length > 0 ? (
                <div className="max-h-[28rem] overflow-auto">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex flex-col gap-1 border-b px-2 py-3 last:border-b-0"
                    >
                      <div className="font-medium leading-tight">
                        {link.demandant.name}
                      </div>
                      <div className="whitespace-normal break-words text-xs leading-relaxed text-muted-foreground">
                        {formatDemandantContactLine(link.demandant)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : legacy ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  <div className="mb-1 text-xs font-medium text-foreground">
                    Contato cadastrado
                  </div>
                  <div className="whitespace-normal break-words">{legacy}</div>
                </div>
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum contato cadastrado
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
    },
    {
      id: 'demandantLinks',
      header: 'Demandantes (links)',
      cell: ({ row }) => {
        const demandantLinks = row.original.demandantLinks ?? []

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Demandantes ({demandantLinks.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[26rem]">
              {demandantLinks.length === 0 ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum demandant_link encontrado
                </div>
              ) : (
                <div className="max-h-[28rem] overflow-auto">
                  {demandantLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex flex-col gap-1 border-b px-2 py-2 last:border-b-0"
                    >
                      <div className="font-medium">{link.demandant.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Referência: {link.reference_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Validade:{' '}
                        {link.valid_until
                          ? formatDate(
                              new Date(link.valid_until),
                              'dd/MM/yyyy HH:mm',
                            )
                          : '—'}
                      </div>
                      <div
                        className={`text-xs ${
                          link.active
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {link.active ? 'Ativo' : 'Inativo'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Radars: {link.radars.length}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: 'notificationChannels',
      header: 'Canais de notificação',
      cell: ({ row }) => {
        if (row.original.notificationChannels) {
          const concatenated = row.original.notificationChannels.reduce(
            (acc, cur) => (acc ? `${acc}, ${cur.title}` : cur.title),
            '',
          )
          return <span>{concatenated}</span>
        } else {
          return <div />
        }
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de criação',
      cell: ({ row }) => formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm'),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última atualização',
      cell: ({ row }) => formatDate(row.original.updatedAt, 'dd/MM/yyyy HH:mm'),
    },
    // {
    //   accessorKey: 'active',
    //   header: 'Status',
    //   cell: ({ row }) => {
    //     return (
    //       <Tooltip
    //         text={row.original.active ? 'Ativo' : 'Inativo'}
    //         disabled={
    //           (IsUpdatingLoading && plate === row.original.plate) ||
    //           !profile ||
    //           !profile?.is_admin
    //         }
    //         disabledText={notAllowed}
    //         asChild
    //       >
    //         <div>
    //           <Switch
    //             id="active"
    //             size="sm"
    //             checked={row.original.active}
    //             disabled={
    //               (IsUpdatingLoading && plate === row.original.plate) ||
    //               !profile ||
    //               !profile?.is_admin
    //             }
    //             className="disabled:cursor-default"
    //             onCheckedChange={() => {
    //               setPlate(row.original.plate)
    //               updateMonitoredPlateMutation({
    //                 plate: row.original.plate,
    //                 active: !row.original.active,
    //               })
    //             }}
    //           />
    //         </div>
    //       </Tooltip>
    //     )
    //   },
    // },
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
                onClick={() => {
                  setDialogInitialData({ plate: row.original.plate })
                  formDialogDisclosure.onOpen()
                }}
                disabled={!profile || !profile?.is_admin}
              >
                <span className="sr-only">Editar linha</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text={'Excluir'}
              disabled={
                // (IsUpdatingLoading && plate === row.original.plate) ||
                !profile || !profile?.is_admin
              }
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
                disabled={
                  // (IsUpdatingLoading && plate === row.original.plate) ||
                  !profile || !profile?.is_admin
                }
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
    <div className="flex flex-col gap-8">
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isMonitoredPlatesLoading || isProfileLoading}
      />
      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={handlePaginate}
        />
      )}
    </div>
  )
}
