import { useMap } from '@/hooks/use-contexts/use-map-context'
import { cn } from '@/lib/utils'
import Papa from 'papaparse'
import { ClearTripsButton } from './components/clear-trips-button'
import { MonitoringToggle } from './components/monitoring-toggle'
import DownloadReportButton from './components/report/download-report-button'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { Tooltip } from '@/components/custom/tooltip'
import { useVehicles } from '@/hooks/use-queries/use-vehicles'

export function ActionButtons() {
  const {
    layers: {
      trips: { trips, lastSearchParams, isLoading, possiblePlates },
    },
  } = useMap()

  const { data: vehicles } = useVehicles({ possiblePlates: possiblePlates ?? [] })

  const downloadReportButton = !!lastSearchParams && !isLoading && !!trips && !possiblePlates
  const monitoringToggle = !!lastSearchParams && !isLoading && !!trips && !possiblePlates
  const downloadPlateList = !isLoading && !!vehicles
  const clearTripsButton =
    ((lastSearchParams && trips) || !!possiblePlates) && !isLoading
  const empty = !downloadReportButton && !monitoringToggle && !clearTripsButton
  console.log(vehicles)
  return (
    <div
      className={cn(
        'flex h-11 items-center gap-2 rounded bg-secondary p-1',
        empty ? 'hidden' : '',
      )}
    >
      {downloadPlateList && (
        <Tooltip asChild text="Baixar relatório" disabled={isLoading}>
          <Button variant="outline" disabled={isLoading} size="sm">
            <Download className="h-4 w-4" onClick={() => {
              if (!vehicles) return

              // Gera o CSV usando PapaParse
              const csv = Papa.unparse(vehicles);

              // Cria um blob com o CSV
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);

              // Cria um elemento de link e dispara o download
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'relatorio_veiculos.csv');
              document.body.appendChild(link);
              link.click();

              // Limpa o URL para liberar memória
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}/>
          </Button>
      </Tooltip>
      )}
      {downloadReportButton && <DownloadReportButton />}
      {monitoringToggle && <MonitoringToggle />}
      {clearTripsButton && (
        <div className="flex w-full justify-end">
          <ClearTripsButton />
        </div>
      )}
    </div>
  )
}
