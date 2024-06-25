import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

import { columns, type MonitoredPlate } from './components/columns'
import { CreateMonitoredPlateDialog } from './components/create-monitored-plate-dialog'
import { DataTable } from './components/data-table'

async function getData(): Promise<MonitoredPlate[]> {
  // Fetch data from your API here.
  return [
    {
      id: '728ed52f',
      plate: 'SQZ8B08',
      additional_info: '',
    },
    {
      id: 's7f60a87',
      plate: 'PWK1E22',
      additional_info: '',
    },
    {
      id: 'nuifwe983',
      plate: 'LSY4C70',
      additional_info: '',
    },
    // ...
  ]
}

export default async function MonitoramentoDePlacas() {
  const data = await getData()
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
      <DataTable columns={columns} data={data} />
    </div>
  )
}
