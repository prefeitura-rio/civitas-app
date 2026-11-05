import { isValidGeographicCoordinates } from '@/utils/geographic-coordinates'

/**
 * Detecta se o input contém coordenadas (latitude, longitude)
 * Aceita formatos como:
 * - "lat, lon" (ex: "-22.808889, -43.413889")
 * - "lat lon" (ex: "-22.808889 -43.413889")
 * - "lat,lon" (ex: "-22.808889,-43.413889")
 * - "lat; lon" (ex: "-22.808889; -43.413889")
 */
export function parseCoordinates(
  input: string,
): { latitude: number; longitude: number } | null {
  const cleanInput = input.trim().toLowerCase()

  // Padrões para detectar coordenadas
  const patterns = [
    // Padrão: lat, lon (com vírgula e espaço)
    /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
    // Padrão: lat lon (apenas espaço)
    /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,
    // Padrão: lat; lon (com ponto e vírgula)
    /^(-?\d+\.?\d*)\s*;\s*(-?\d+\.?\d*)$/,
  ]

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern)
    if (match) {
      const latitude = parseFloat(match[1])
      const longitude = parseFloat(match[2])

      // Valida se as coordenadas estão em ranges válidos
      if (isValidGeographicCoordinates([longitude, latitude])) {
        return { latitude, longitude }
      }
    }
  }

  return null
}

/**
 * Formata coordenadas para exibição
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}
