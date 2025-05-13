export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)

  // Cria um elemento de link e dispara o download
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Limpa o URL para liberar memória
  URL.revokeObjectURL(url)
}
