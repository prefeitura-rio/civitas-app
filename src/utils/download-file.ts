export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)

  // Cria um elemento de link e dispara o download
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  // Limpa o URL para liberar memória
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
