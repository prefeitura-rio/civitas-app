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
      if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
        return { latitude, longitude }
      }
    }
  }

  return null
}

/**
 * Valida se a latitude está em um range válido (-90 a 90)
 */
function isValidLatitude(lat: number): boolean {
  return !isNaN(lat) && lat >= -90 && lat <= 90
}

/**
 * Valida se a longitude está em um range válido (-180 a 180)
 */
function isValidLongitude(lon: number): boolean {
  return !isNaN(lon) && lon >= -180 && lon <= 180
}

/**
 * Formata coordenadas para exibição
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}
