export function formatLocation(phrase) {
  // Extract everything before " - SENTIDO"
  const locationMatch = phrase.match(/.*(?= - SENTIDO)/)
  const location = locationMatch ? locationMatch[0] : null

  // Extract the content between " - SENTIDO " and " - "
  const directionMatch = phrase.match(/(?<=- SENTIDO ).*?(?= -)/)
  const direction = directionMatch ? directionMatch[0] : null

  // Extract everything after " - FX "
  const laneMatch = phrase.match(/(?<=- FX ).*/)
  const lane = laneMatch ? laneMatch[0] : null

  return {
    location,
    direction,
    lane,
  }
}