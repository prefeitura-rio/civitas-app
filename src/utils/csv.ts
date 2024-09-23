import Papa from 'papaparse'

export const exportToCSV = (filename: string, data: unknown[]) => {
  // Gera o CSV usando PapaParse
  const csv = Papa.unparse(data)

  // Cria um blob com o CSV
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)

  // Cria um elemento de link e dispara o download
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'relatorio_veiculos.csv')
  document.body.appendChild(link)
  link.click()

  // Limpa o URL para liberar memória
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
