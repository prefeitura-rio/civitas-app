'use client'
import type { ColumnDef } from '@tanstack/react-table'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  getMonitoredPlates,
  type GetMonitoredPlatesResponse,
  type MonitoredPlate,
} from '@/http/cars/get-monitored-plates'
import { getProfile } from '@/http/user/get-profile'
import { genericErrorMessage } from '@/utils/error-handlers'

import { getColumns } from './columns'

const CreateMonitoredPlateDialog = dynamic(
  () =>
    import('./create-monitored-plate-dialog').then(
      (mod) => mod.CreateMonitoredPlateDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

// interface DataTableProps {
//   columns: ColumnDef<MonitoredPlate>[]
// }

export default function MonitoredPlates() {
  const [data, setData] = useState<GetMonitoredPlatesResponse>()
  const [columns, setColumns] = useState<ColumnDef<MonitoredPlate>[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function getData() {
      try {
        const { data } = await getProfile()
        setIsAdmin(data.is_admin)
        const _columns = getColumns({ isAdmin: data.is_admin })
        setColumns(_columns)

        const response = await getMonitoredPlates({})
        setData(response.data)
      } catch (error) {
        toast.error(genericErrorMessage)
        console.error({ error })
        return null
      }
    }

    getData()
  }, [])

  return (
    <div className="page-content flex flex-col gap-8 pt-8">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Placas monitoradas
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            {isAdmin ? (
              <Button>Adicionar</Button>
            ) : (
              // <Tooltip text="Você não tem permissão para executar essa ação.">
              <Button disabled={true}>Adicionar</Button>
              // </Tooltip>
            )}
          </DialogTrigger>
          <CreateMonitoredPlateDialog />
        </Dialog>
      </div>
      {data && <DataTable columns={columns} data={data.items} />}
    </div>
  )
}
