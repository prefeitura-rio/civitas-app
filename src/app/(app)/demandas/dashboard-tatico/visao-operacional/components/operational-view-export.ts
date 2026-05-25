import { format } from 'date-fns'

export { buildDemandVolumeTicketsCsv as buildOperationalViewTicketsCsv } from '../../volume/components/demand-volume-export'

export function operationalViewTicketsExportFilename(
  exportedAt = new Date(),
): string {
  const stamp = format(exportedAt, 'yyyy-MM-dd')
  return `dashboard-tatico-visao-operacional-chamados-${stamp}.csv`
}
