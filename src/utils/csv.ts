import { formatDate } from 'date-fns'
import Papa from 'papaparse'

import { downloadFile } from './download-file'

type CsvCell = string | number | boolean | null
type CsvRow = readonly CsvCell[]

export const formatCsvDateTime = (value: string | Date) =>
  formatDate(new Date(value), 'dd/MM/yyyy HH:mm:ss')

export const exportToCSV = (
  filename: string,
  {
    topRows = [],
    headers,
    dataRows,
  }: {
    topRows?: readonly CsvRow[]
    headers: readonly string[]
    dataRows: readonly CsvRow[]
  },
) => {
  const rows = [...topRows, headers, ...dataRows]
  const csv = Papa.unparse(rows, {
    quotes: (value) => typeof value === 'string' && value.includes('\n'),
  })

  // Add BOM for UTF-8
  const bom = '\uFEFF'

  // Cria um blob com o CSV
  const blob = new Blob([bom + csv], {
    type: 'text/csv;charset=utf-8;',
  })
  downloadFile(blob, filename)
}
