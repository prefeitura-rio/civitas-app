/** Coordenadas, séries diárias e nomes de bairro das tendências de circulação. */

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
