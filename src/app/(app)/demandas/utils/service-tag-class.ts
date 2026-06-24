import listStyles from '@/app/(app)/demandas/list/tickets-general-list.module.css'

export type ServiceTagStyles = {
  serviceTagPink: string
  serviceTagGreen: string
  serviceTagYellow: string
  serviceTagCyan: string
  serviceTagBlue: string
  serviceTagOrange: string
  serviceTagPurple: string
  serviceTagRed: string
  serviceTagIndigo: string
  serviceTagDefault: string
}

export function getServiceTagClass(
  label: string,
  styles: ServiceTagStyles = listStyles as ServiceTagStyles,
): string {
  const normalized = label.trim().toLowerCase()

  if (normalized.includes('cerco')) return styles.serviceTagPink
  if (
    normalized.includes('busca por placa') ||
    normalized.includes('busca de placa')
  )
    return styles.serviceTagGreen
  if (normalized.includes('reserva de imagem')) return styles.serviceTagYellow
  if (
    normalized.includes('análise de imagem') ||
    normalized.includes('analise de imagem')
  )
    return styles.serviceTagIndigo
  if (
    normalized.includes('busca por imagem') ||
    normalized.includes('busca de imagem')
  )
    return styles.serviceTagCyan
  if (
    normalized.includes('busca por radar') ||
    normalized.includes('busca de radar')
  )
    return styles.serviceTagBlue
  if (normalized.includes('placas correlatas')) return styles.serviceTagOrange
  if (
    normalized.includes('placas conjuntas') ||
    normalized.includes('placa conjuntas')
  )
    return styles.serviceTagPurple
  if (normalized.includes('other') || normalized.includes('outros'))
    return styles.serviceTagRed
  if (normalized.includes('atlas')) return styles.serviceTagDefault

  return styles.serviceTagDefault
}

export { listStyles as serviceTagStyles }
