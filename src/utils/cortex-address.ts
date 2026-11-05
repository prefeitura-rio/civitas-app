import type {
  AddressCoordinates,
  AddressSearchInput,
  CortexAddress,
} from '@/models/address'
import { isValidGeographicCoordinates } from '@/utils/geographic-coordinates'

function cleanAddressPart(value: string | null | undefined) {
  const cleaned = value?.trim()
  return cleaned && cleaned.toUpperCase() !== 'N/A' ? cleaned : undefined
}

/**
 * Maps the BFF address contract to Mapbox's structured input.
 *
 * Street type is prepended only when absent from the street name. Complement
 * and country display fields are excluded: they may contain non-geographic
 * details or placeholders. Missing values remain undefined and are omitted from
 * the geocoding request, never serialized as the text "null".
 */
export function getCortexAddressSearch(
  address: CortexAddress,
): AddressSearchInput {
  const streetType = cleanAddressPart(address.tipoLogradouro)
  const streetName = cleanAddressPart(address.logradouro)
  const hasStreetType =
    streetType &&
    streetName?.toUpperCase().startsWith(`${streetType.toUpperCase()} `)
  const street =
    streetName && streetType && !hasStreetType
      ? `${streetType} ${streetName}`
      : streetName
  const rawNumber = cleanAddressPart(address.numeroLogradouro)
  const addressNumber =
    rawNumber && !/^s\/?n$/i.test(rawNumber) ? rawNumber : undefined
  const postcode = cleanAddressPart(address.cep)?.replace(/\D/g, '')

  return {
    street,
    addressNumber,
    neighborhood: cleanAddressPart(address.bairro),
    place: cleanAddressPart(address.municipio),
    region: cleanAddressPart(address.uf)?.toUpperCase(),
    postcode: postcode?.length === 8 ? postcode : undefined,
  }
}

/** Checks finite longitude/latitude degrees and rejects the unavailable (0, 0) sentinel. */
export function isValidAddressCoordinates(
  coordinates: readonly unknown[],
): coordinates is AddressCoordinates {
  const [longitude, latitude] = coordinates
  return (
    isValidGeographicCoordinates(coordinates) &&
    !(longitude === 0 && latitude === 0)
  )
}
