/** Rótulos da análise das correlações: unidade da CISP, faixa da força, temperatura do clone e âncoras. */
import { cispParts } from '@/modules/vehicle-intelligence/lib/labels'

/** "005" + "005A. DP - [MEM DE SÁ]" vira "5ª DP · Mem de Sá". */
export function cispUnitLabel(
  code: string | null | undefined,
  names: Record<string, string>,
): string {
  if (!code) return '—'
  const parts = cispParts(code, names[code])
  return parts.locality ? `${parts.unit} · ${parts.locality}` : parts.unit
}

/** Faixa da força da correlação (0 a 100), como classe CSS. */
export function temperatureTone(value: number): string {
  if (value >= 70) return 'hot'
  if (value >= 40) return 'warm'
  return 'cold'
}

/** Faixa da força da correlação (0 a 100), como texto. */
export function temperatureLabel(value: number): string {
  if (value >= 70) return 'Alta'
  if (value >= 40) return 'Média'
  return 'Baixa'
}

/** Temperatura do clone como vem do Painel de Clonagem, ou pela nota quando ela falta. */
export function cloneTemperatureLabel(
  value: string | null | undefined,
  score: number | null | undefined,
): string {
  if (value === 'quente') return 'alta'
  if (value === 'morna' || value === 'média' || value === 'media')
    return 'média'
  if (value === 'fria') return 'baixa'
  return temperatureLabel(score ?? 0).toLowerCase()
}

/** Âncora do cartão do fato (ou do RO citado) na página, para os links dos indicadores. */
export const correlationEventAnchor = (eventId: string) =>
  `corr-ro-${eventId.replace(/\W/g, '-')}`
