'use server'

import { v4 as uuidv4 } from 'uuid'

import { getEnv } from '@/env/server'
import { api } from '@/lib/api'

interface SuggestionsResponse {
  suggestions: {
    name: string
    mapbox_id: string
    feature_type: string
    address: string
    full_address: string
    place_formatted: string
    context: {
      country: {
        id: string
        name: string
        country_code: string
        country_code_alpha_3: string
      }
      region: {
        id: string
        name: string
        region_code: string
        region_code_full: string
      }
      postcode: { id: string; name: string }
      place: { id: 'dXJuOm1ieHBsYzpBZzVvSUE'; name: string }
      neighborhood: { id: string; name: string }
      address: {
        id: string
        name: string
        address_number: '821'
        street_name: string
      }
      street: {
        id: string
        name: string
      }
    }
    language: string
    maki: string
    metadata: object
    distance: 25000
  }[]
  attribution: string
  response_id: string
  url: string
}

interface AddressResponse {
  type: 'FeatureCollection'
  features: [
    {
      type: 'Feature'
      geometry: { coordinates: [number, number]; type: 'Point' }
      properties: {
        name: string
        name_preferred: string
        mapbox_id: string
        feature_type: string
        address: string
        full_address: string
        place_formatted: string
        context: {
          country: {
            id: string
            name: string
            country_code: string
            country_code_alpha_3: string
          }
          region: {
            id: string
            name: string
            region_code: string
            region_code_full: string
          }
          postcode: { id: string; name: string }
          place: { id: string; name: string }
          neighborhood: { id: string; name: string }
          address: {
            id: string
            name: string
            address_number: string
            street_name: string
          }
          street: {
            id: string
            name: string
          }
        }
        coordinates: {
          latitude: number
          longitude: number
          accuracy: string
          routable_points: [
            { name: string; latitude: number; longitude: number },
          ]
        }
        language: 'en'
        maki: 'marker'
        metadata: object
      }
    },
  ]
  attribution: string
  url: string
}
export async function searchAddress(query: string) {
  const sessionToken = uuidv4()
  const env = await getEnv()
  const accessToken = env.MAPBOX_ACCESS_TOKEN

  const suggestions = await api.get<SuggestionsResponse>(
    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${query}&language=pt&country=br&proximity=-43.47,-22.92957&types=address&session_token=${sessionToken}&access_token=${accessToken}`,
  )

  const address = await api.get<AddressResponse>(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestions.data.suggestions.at(0)?.mapbox_id}?&session_token=${sessionToken}&access_token=${accessToken}`,
  )

  return address.data
}
