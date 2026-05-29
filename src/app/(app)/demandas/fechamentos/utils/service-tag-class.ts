import listStyles from '@/app/(app)/demandas/list/tickets-general-list.module.css'

export function getShiftClosingServiceTagClass(label: string) {
  const normalized = label.trim().toLowerCase()

  if (normalized.includes('cerco')) return listStyles.serviceTagPink
  if (
    normalized.includes('busca por placa') ||
    normalized.includes('busca de placa')
  )
    return listStyles.serviceTagGreen
  if (normalized.includes('reserva de imagem'))
    return listStyles.serviceTagYellow
  if (
    normalized.includes('busca por imagem') ||
    normalized.includes('busca de imagem')
  )
    return listStyles.serviceTagCyan
  if (
    normalized.includes('busca por radar') ||
    normalized.includes('busca de radar')
  )
    return listStyles.serviceTagBlue
  if (normalized.includes('placas correlatas'))
    return listStyles.serviceTagOrange
  if (normalized.includes('placas conjuntas'))
    return listStyles.serviceTagPurple
  if (normalized.includes('outros')) return listStyles.serviceTagRed
  if (normalized.includes('atlas')) return listStyles.serviceTagDefault

  return listStyles.serviceTagDefault
}

export { listStyles as shiftClosingServiceTagStyles }
