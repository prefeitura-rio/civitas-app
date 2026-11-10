import { z } from 'zod'

/** Geographic coordinates in [longitude, latitude] order, measured in degrees. */
export const geographicCoordinatesSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
])

/**
 * Checks a longitude/latitude pair without coercion. Both zero values are valid;
 * [0, 0] is valid. Callers decide whether to treat [0, 0] as a valid location or a placeholder for missing data.
 */
export function isValidGeographicCoordinates(
  coordinates: unknown,
): coordinates is [number, number] {
  return geographicCoordinatesSchema.safeParse(coordinates).success
}
