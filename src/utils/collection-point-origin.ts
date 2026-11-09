/**
 * Canonicalizes known LPR companies for both icons and cluster counts.
 * Unknown labels retain their trimmed spelling; missing labels are explicit.
 */
export function getCollectionPointOrigin(company: string | null | undefined) {
  const label = company?.trim()
  const normalized = label?.toUpperCase()
  if (normalized === 'CETRIO' || normalized === 'CET-RIO') return 'CETRIO'
  if (normalized === 'CIVITAS' || normalized === 'GABRIEL') return normalized
  return label || 'Origem não informada'
}

/**
 * Reconstructs the collection point identifier used in Sentry when the origin is CIVITAS.
 *
 * @param point - Collection point metadata containing company, external point code, and direction.
 * @returns The reconstructed Sentry point label (e.g. `"0000003 - SENTIDO DUQUE DE CAXIAS"`),
 * or `null` for non-CIVITAS origins.
 */
export function formatCollectionPointOriginName(point: {
  company?: string | null
  codigoPontoColeta?: string | null
  direction?: string | null
}): string | null {
  const origin = getCollectionPointOrigin(point.company)
  if (origin !== 'CIVITAS') return null

  const code = point.codigoPontoColeta?.trim()
  if (!code) return null

  const direction = point.direction?.trim()
  return direction ? `${code} - SENTIDO ${direction}` : code
}

/** Normalizes known camera systems consistently for partitions and cluster counts. */
export function getCameraOrigin(origin: string | null | undefined) {
  const label = origin?.trim()
  const normalized = label?.toUpperCase()
  if (normalized === 'DC3' || normalized === 'TIXI') return normalized
  return label || 'Origem não informada'
}
