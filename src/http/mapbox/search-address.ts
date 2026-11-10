import axios from 'axios'

import { config } from '@/config'
import type { AddressCoordinates, AddressSearchInput } from '@/models/address'
import { isValidAddressCoordinates } from '@/utils/cortex-address'

type AddressMatchStatus =
  | 'matched'
  | 'unmatched'
  | 'not_applicable'
  | 'inferred'
  | 'plausible'

export interface AddressFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: AddressCoordinates }
  properties: {
    feature_type: string
    name?: string
    coordinates?: { accuracy?: string }
    context?: {
      country?: { country_code?: string }
      place?: { name?: string }
      region?: { name?: string; region_code?: string }
      postcode?: { name?: string }
    }
    match_code?: {
      confidence: 'exact' | 'high' | 'medium' | 'low'
      street?: AddressMatchStatus
      address_number?: AddressMatchStatus
      place?: AddressMatchStatus
      region?: AddressMatchStatus
      postcode?: AddressMatchStatus
    }
  }
}

// Street features may expose only the five-digit postal area, not the full CEP.
const BRAZILIAN_POSTAL_AREA_LENGTH = 5

function normalizeAddressName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

interface AddressResponse {
  type: 'FeatureCollection'
  features: AddressFeature[]
  attribution?: string
}

/**
 * Compares returned geographic context before relying on a match flag. Mapbox
 * can mark equivalent city names/CEPs as unmatched because of accents or
 * punctuation. This normalization does not perform fuzzy name matching.
 */
function matchesContext(
  requested: string | undefined,
  returned: string | undefined,
  match: AddressMatchStatus | undefined,
) {
  if (!requested) return true
  if (!returned) return match === 'matched'
  return normalizeAddressName(requested) === normalizeAddressName(returned)
}

/**
 * Confirms a street-level approximation using its actual name, city, state,
 * and postal area. A five-digit CEP prefix is allowed only for a street result;
 * it never confirms a house number or relaxes the full-address match.
 */
function matchesStreet(feature: AddressFeature, address: AddressSearchInput) {
  const { context, name } = feature.properties
  const returnedPostcode = context?.postcode?.name?.replace(/\D/g, '')
  const requestedPostcode = address.postcode?.replace(/\D/g, '')
  const postalAreaMatches =
    !requestedPostcode ||
    Boolean(
      returnedPostcode &&
        (returnedPostcode === requestedPostcode ||
          (returnedPostcode.length === BRAZILIAN_POSTAL_AREA_LENGTH &&
            requestedPostcode.startsWith(returnedPostcode))),
    )
  return (
    feature.properties.feature_type === 'street' &&
    isValidAddressCoordinates(feature.geometry.coordinates) &&
    context?.country?.country_code?.toLowerCase() === 'br' &&
    Boolean(
      name &&
        address.street &&
        normalizeAddressName(name) === normalizeAddressName(address.street),
    ) &&
    Boolean(
      address.place &&
        address.region &&
        context?.place?.name &&
        context?.region?.region_code,
    ) &&
    matchesContext(address.place, context?.place?.name, undefined) &&
    matchesContext(address.region, context?.region?.region_code, undefined) &&
    postalAreaMatches
  )
}

/**
 * Requires a matching street/number and supplied geographic context. Medium
 * confidence is sufficient only when the context is independently confirmed;
 * low-confidence candidates and different addresses are always rejected.
 */
function matchesAddress(feature: AddressFeature, address: AddressSearchInput) {
  const { match_code: match, context } = feature.properties
  if (
    match?.confidence === 'medium' &&
    ((address.place && !context?.place?.name) ||
      (address.region && !context?.region?.region_code) ||
      (address.postcode && !context?.postcode?.name))
  )
    return false
  return (
    feature.properties.feature_type === 'address' &&
    feature.geometry.type === 'Point' &&
    isValidAddressCoordinates(feature.geometry.coordinates) &&
    context?.country?.country_code?.toLowerCase() === 'br' &&
    (match?.confidence === 'exact' ||
      match?.confidence === 'high' ||
      match?.confidence === 'medium') &&
    match.street === 'matched' &&
    (match.address_number === 'matched' ||
      match.address_number === 'plausible') &&
    matchesContext(address.place, context?.place?.name, match.place) &&
    matchesContext(
      address.region,
      context?.region?.region_code,
      match.region,
    ) &&
    matchesContext(address.postcode, context?.postcode?.name, match.postcode)
  )
}

/**
 * Geocodes a complete Brazilian address using Mapbox v6 structured input.
 *
 * @returns Candidates with matching street/number and geographic context;
 * confidence may be medium when context agrees despite formatting flags.
 * If the house cannot be confirmed, a matching street may be returned as an
 * approximation. Its feature type must be preserved for the UI to disclose it.
 * An empty collection means neither location could be confirmed.
 * @remarks Street approximation requires city/state, plus a compatible CEP
 * area when supplied. Results are temporary and not persisted. The external
 * HTTP client never attaches the app's auth token.
 */
export async function searchAddress(
  address: AddressSearchInput,
): Promise<AddressResponse> {
  if (
    !address.street ||
    !(address.postcode || (address.place && address.region))
  ) {
    return { type: 'FeatureCollection', features: [] }
  }

  const params = {
    street: address.street,
    neighborhood: address.neighborhood,
    place: address.place,
    region: address.region,
    postcode: address.postcode,
    country: 'br',
    language: 'pt',
    types: 'address',
    autocomplete: false,
    access_token: config.mapboxAccessToken,
  }
  const endpoint = 'https://api.mapbox.com/search/geocode/v6/forward'
  if (address.addressNumber) {
    const { data } = await axios.get<AddressResponse>(endpoint, {
      params: { ...params, address_number: address.addressNumber },
    })
    const features = data.features.filter((feature) =>
      matchesAddress(feature, address),
    )
    if (features.length) return { ...data, features }
  }

  if (!address.place || !address.region)
    return { type: 'FeatureCollection', features: [] }
  const { data } = await axios.get<AddressResponse>(endpoint, {
    params: { ...params, types: 'street' },
  })

  return {
    ...data,
    features: data.features.filter((feature) =>
      matchesStreet(feature, address),
    ),
  }
}
