/** Formatos, dias e nomes das tendências de circulação. */

/** Os dias do período, de `start` a `end` (AAAA-MM-DD), um a um no calendário de Brasília. */
export function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  const cursor = new Date(`${start.slice(0, 10)}T12:00:00-03:00`)
  const last = new Date(`${end.slice(0, 10)}T12:00:00-03:00`)
  // eslint-disable-next-line no-unmodified-loop-condition -- `cursor` avança com setDate
  while (cursor <= last) {
    days.push(
      cursor.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
    )
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/** Duração de uma parada ou viagem: "45 s", "2 h 05 min", "1,5 dias"; "—" sem valor. */
export function durationLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)} s`
  const hours = seconds / 3600
  if (hours >= 24) return `${(hours / 24).toFixed(1).replace('.', ',')} dias`
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return wholeHours
    ? `${wholeHours} h ${String(minutes).padStart(2, '0')} min`
    : `${minutes} min`
}

/** Seis casas decimais, mesmo formato do relatório de tendências (~0,1 m). */
export function formatCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): string | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return `${(latitude as number).toFixed(6)}, ${(longitude as number).toFixed(6)}`
}

/** A série por local vem esparsa (só dias com passagem); o gráfico precisa dos zeros. */
export function fillDaily(
  daily: Array<{ day: string; count: number }> | undefined,
  periodDays: string[],
): Array<{ day: string; count: number }> {
  const observed = new Map(
    (daily || []).map((point) => [point.day, point.count]),
  )
  if (!periodDays.length) return (daily || []).map((point) => ({ ...point }))
  return periodDays.map((day) => ({ day, count: observed.get(day) ?? 0 }))
}

/** Nome do bairro para casar o cadastro dos radares com a malha oficial: sem acento, pontuação nem
 * espaço, e os três bairros que têm nome diferente nas duas fontes. */
export function normalizeNeighborhood(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
  return (
    {
      SAOCRISTOVAO: 'IMPERIALDESAOCRISTOVAO',
      OSWALDOCRUZ: 'OSVALDOCRUZ',
      FREGUESIAILHADOGOVERNADOR: 'FREGUESIAILHA',
    }[normalized] || normalized
  )
}
