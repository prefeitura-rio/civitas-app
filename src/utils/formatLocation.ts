export function formatLocation(phrase: string) {
  // Extract everything before " - SENTIDO"
  const locationMatch = phrase.match(/.*(?= - SENTIDO)/)
  const location = locationMatch ? locationMatch[0] : ''

  // Extract the content between " - SENTIDO " and " - "
  const directionMatch = phrase.match(/(?<=- SENTIDO ).*?(?= -)/)
  const direction = directionMatch ? directionMatch[0] : ''

  // Extract everything after " - FX "
  const laneMatch = phrase.match(/(?<=- FX ).*/)
  const lane = laneMatch ? laneMatch[0] : ''

  return {
    location,
    direction,
    lane,
  }
}
