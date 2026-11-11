/** Datas, intervalos e rótulos da análise das correlações. */
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
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

/** Intervalo mediano entre fatos: "25 min", "5 h", "3 dias". */
export function intervalLabel(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return '—'
  const minutes = Math.round(milliseconds / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
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

/** Dias entre o primeiro e o último fato, contando os dois. */
export function calendarDaySpan(
  start: string | null,
  end: string | null,
): number {
  if (!start || !end) return 0
  const from = new Date(start)
  const to = new Date(end)
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()))
    return 0
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86400000) + 1)
}

/** "2026-01-16" é data civil: não pode passar pelo fuso como meia-noite UTC. */
export function civilDay(value: string | null): string {
  if (!value) return 'data não informada'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/** "14:05" no horário de Brasília. */
export function clockTime(value: string): string {
  return new Date(value.replace(' ', 'T')).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/** Distância no tempo até o fato, sem o sinal: "12 min", "1h15", "2 h". */
export function minutesLabel(minutes: number): string {
  const absolute = Math.abs(minutes)
  if (absolute < 60) return `${formatNumber(Math.round(absolute))} min`
  const hours = Math.floor(absolute / 60)
  const rest = Math.round(absolute % 60)
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours} h`
}

/** Âncora do cartão do fato (ou do RO citado) na página, para os links dos indicadores. */
export const correlationEventAnchor = (eventId: string) =>
  `corr-ro-${eventId.replace(/\W/g, '-')}`
