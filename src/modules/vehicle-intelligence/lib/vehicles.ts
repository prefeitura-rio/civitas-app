/** Tipos do cadastro PRF que correspondem a motos. */
const PRF_MOTORCYCLE_TYPES = ['MOTOCICLETA', 'MOTONETA', 'CICLOMOTOR']

export function isMotorcycleType(type: string | null | undefined): boolean {
  return !!type && (type === 'MOTO' || PRF_MOTORCYCLE_TYPES.includes(type))
}

export function vehicleTypeSourceLabel(
  source: string | null | undefined,
): string | null {
  if (source === 'tipoveiculo') return 'não PRF'
  return source === 'PRF' ? 'Cadastro PRF' : null
}

/** Tipo do cadastro PRF; `share` só existe em snapshots antigos, votados pelo Cerco. */
export function vehicleTypeLabel(
  type: string | null | undefined,
  share?: number | null,
): string | null {
  if (!type) return null
  const label = type === 'AUTOMOVEL' || type === 'AUTOMÓVEL' ? 'CARRO' : type
  return share != null && share < 99.5
    ? `${label} · ${Math.round(share)}%`
    : label
}

/** "PRETA · HONDA/CG 160 FAN · 2021/2022" com o que o cadastro PRF tiver. */
export function vehicleDetailsLabel(vehicle: {
  vehicle_color?: string | null
  vehicle_model?: string | null
  manufacture_year?: number | null
  model_year?: number | null
}): string | null {
  const years = [vehicle.manufacture_year, vehicle.model_year]
    .filter((year) => year)
    .join('/')
  return (
    [vehicle.vehicle_color, vehicle.vehicle_model, years]
      .filter(Boolean)
      .join(' · ') || null
  )
}
