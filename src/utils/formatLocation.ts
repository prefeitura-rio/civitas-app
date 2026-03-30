export function formatLocation(phrase: string) {
  const trimmed = typeof phrase === 'string' ? phrase.trim() : ''

  if (!trimmed) {
    return { location: '', direction: '', lane: '' }
  }

  // Padrão esperado para RADAR: "LOCAL - SENTIDO X - FX Y"
  if (!trimmed.includes(' - SENTIDO ')) {
    return {
      location: trimmed,
      direction: '',
      lane: '',
    }
  }

  // Extract everything before " - SENTIDO"
  const locationMatch = trimmed.match(/.*(?= - SENTIDO)/)
  const location = locationMatch ? locationMatch[0].trim() : trimmed

  // Extract the content between " - SENTIDO " and " - "
  const directionMatch = trimmed.match(/(?<=- SENTIDO ).*?(?= -)/)
  const direction = directionMatch ? directionMatch[0].trim() : ''

  // Extract everything after " - FX "
  const laneMatch = trimmed.match(/(?<=- FX ).*/)
  const lane = laneMatch ? laneMatch[0].trim() : ''

  return {
    location,
    direction,
    lane,
  }
}
