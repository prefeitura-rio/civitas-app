import Papa from 'papaparse'

import { downloadFile } from './download-file'

export const exportToCSV = (filename: string, data: unknown[]) => {
  // Gera o CSV usando PapaParse
  const csv = Papa.unparse(data)

  // Cria um blob com o CSV
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })
  downloadFile(blob, filename)
}
