/** Um tick por virada de mês: 180 dias não cabem como rótulos legíveis. */
export function monthTicks(series: Array<{ day: string }>): string[] {
  const ticks = series
    .filter((point) => point.day.slice(8, 10) === '01')
    .map((point) => point.day)
  if (ticks.length >= 2) return ticks
  return series.length ? [series[0].day, series[series.length - 1].day] : []
}
