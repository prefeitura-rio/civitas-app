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

/** Normalizes known camera systems consistently for partitions and cluster counts. */
export function getCameraOrigin(origin: string | null | undefined) {
  const label = origin?.trim()
  const normalized = label?.toUpperCase()
  if (normalized === 'DC3' || normalized === 'TIXI') return normalized
  return label || 'Câmeras'
}
