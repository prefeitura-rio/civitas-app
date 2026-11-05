/** Nullable address fields shared by the BFF people and companies contracts. */
export interface CortexAddress {
  tipoLogradouro: string | null
  logradouro: string | null
  numeroLogradouro: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
}

/** People may also provide approximate coordinates; companies only provide address fields. */
export interface CortexMapAddress extends CortexAddress {
  latitudeAproximadaLocal?: number | null
  longitudeAproximadaLocal?: number | null
}

/** Typed components used by Mapbox structured forward geocoding. */
export interface AddressSearchInput {
  street?: string
  addressNumber?: string
  neighborhood?: string
  place?: string
  region?: string
  postcode?: string
}

/** Decimal degrees in the order required by GeoJSON and Mapbox. */
export type AddressCoordinates = [longitude: number, latitude: number]
