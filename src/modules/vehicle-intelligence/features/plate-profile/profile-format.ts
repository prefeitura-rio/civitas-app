/** Formatos do perfil da placa que se repetiam entre as análises (correlações e tendências). */

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export function formatTimestamp(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/** Um tick por virada de mês: 180 dias não cabem como rótulos legíveis. */
export function monthTicks(series: Array<{ day: string }>): string[] {
  const ticks = series
    .filter((point) => point.day.slice(8, 10) === '01')
    .map((point) => point.day)
  if (ticks.length >= 2) return ticks
  return series.length ? [series[0].day, series[series.length - 1].day] : []
}
