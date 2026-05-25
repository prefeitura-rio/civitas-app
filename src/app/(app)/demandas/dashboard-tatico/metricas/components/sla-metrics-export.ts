import { format } from 'date-fns'

export { buildDemandVolumeTicketsCsv as buildSlaMetricsTicketsCsv } from '../../volume/components/demand-volume-export'

export function slaMetricsTicketsExportFilename(
  exportedAt = new Date(),
): string {
  const stamp = format(exportedAt, 'yyyy-MM-dd')
  return `dashboard-tatico-metricas-resposta-chamados-${stamp}.csv`
}
