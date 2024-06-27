'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  getMonitoredPlates,
  type GetMonitoredPlatesResponse,
} from '@/http/cars/get-monitored-plates'
import { genericErrorMessage } from '@/utils/error-handlers'

import { columns } from './components/columns'

const CreateMonitoredPlateDialog = dynamic(
  () =>
    import('./components/create-monitored-plate-dialog').then(
      (mod) => mod.CreateMonitoredPlateDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function MonitoramentoDePlacas() {
  const [data, setData] = useState<GetMonitoredPlatesResponse>()

  useEffect(() => {
    async function getData() {
      try {
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
            <Button>Adicionar</Button>
          </DialogTrigger>
          <CreateMonitoredPlateDialog />
        </Dialog>
      </div>
      {data && <DataTable columns={columns} data={data.items} />}
    </div>
  )
}
