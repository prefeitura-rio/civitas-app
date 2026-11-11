/** Números e textos curtos do painel, no formato pt-BR. */

const NUMBER = new Intl.NumberFormat('pt-BR')

/** "12.345"; ausente vira 0. */
export const formatNumber = (value: number | null | undefined) =>
  NUMBER.format(value ?? 0)

/** "1 placa", "3 placas", "1.204 leituras". */
export const pluralize = (count: number, singular: string, plural: string) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`

/** "1,5 h" (até uma casa decimal). */
export const formatHours = (hours: number) =>
  `${hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Texto seguro para o HTML montado à mão (popups e rótulos do Leaflet e do deck.gl); ausente vira "". */
export const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character],
  )
