import mapboxgl from 'mapbox-gl'
import { useEffect, useState } from 'react'

import { config } from '@/config'
import { searchAddress } from '@/http/mapbox/search-address'
import type { AddressCoordinates, CortexMapAddress } from '@/models/address'
import {
  getCortexAddressSearch,
  isValidAddressCoordinates,
} from '@/utils/cortex-address'

interface UseGeocodedMapContainerRef {
  current: HTMLDivElement | null
}

interface GeocodedMapState {
  error: 'address-not-found' | 'search-failed' | 'map-failed' | null
  approximation: 'point' | 'street' | null
  isLoading: boolean
}

/**
 * Displays the location returned for a BFF person/company address.
 *
 * Valid person coordinates take precedence in [longitude, latitude] order and
 * are explicitly approximate. Geocoding may confirm the house or only its
 * street; the latter must be disclosed as an approximation by the UI.
 *
 * @returns Separate address/search/renderer failures and the approximation
 * level. Loading finishes when the Mapbox style loads, not merely when a
 * coordinate is found. A later successful load clears an initial style error.
 * @remarks Changes to address values dispose the native map. Async geocoding
 * and map callbacks are ignored after cleanup, including superseded lookups.
 */
export function useGeocodedMap(
  containerRef: UseGeocodedMapContainerRef,
  address: CortexMapAddress | undefined,
) {
  const [state, setState] = useState<GeocodedMapState>({
    error: null,
    approximation: null,
    isLoading: Boolean(address),
  })
  const hasAddress = address !== undefined
  const {
    tipoLogradouro = null,
    logradouro = null,
    numeroLogradouro = null,
    bairro = null,
    municipio = null,
    uf = null,
    cep = null,
    latitudeAproximadaLocal = null,
    longitudeAproximadaLocal = null,
  } = address ?? {}

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasAddress) return

    let isActive = true
    let map: mapboxgl.Map | null = null
    let hasLoaded = false
    setState({ error: null, approximation: null, isLoading: true })
    mapboxgl.accessToken = config.mapboxAccessToken

    async function initializeMap(target: HTMLDivElement) {
      let phase: 'search-failed' | 'map-failed' = 'search-failed'
      try {
        const suppliedCoordinates = [
          longitudeAproximadaLocal,
          latitudeAproximadaLocal,
        ]
        let coordinates: AddressCoordinates
        let approximation: GeocodedMapState['approximation'] = 'point'
        if (isValidAddressCoordinates(suppliedCoordinates)) {
          coordinates = suppliedCoordinates
        } else {
          const result = await searchAddress(
            getCortexAddressSearch({
              tipoLogradouro,
              logradouro,
              numeroLogradouro,
              bairro,
              municipio,
              uf,
              cep,
            }),
          )
          if (!isActive) return
          const feature = result.features.at(0)
          if (
            !feature ||
            !isValidAddressCoordinates(feature.geometry.coordinates)
          ) {
            setState({
              error: 'address-not-found',
              approximation: null,
              isLoading: false,
            })
            return
          }
          coordinates = feature.geometry.coordinates
          const accuracy = feature.properties?.coordinates?.accuracy
          approximation =
            feature.properties.feature_type === 'street'
              ? 'street'
              : accuracy === 'interpolated' ||
                  accuracy === 'approximate' ||
                  feature.properties.match_code?.address_number === 'plausible'
                ? 'point'
                : null
        }

        phase = 'map-failed'
        map = new mapboxgl.Map({
          container: target,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: coordinates,
          zoom: 12,
        })
        map.on('load', () => {
          if (!isActive) return
          hasLoaded = true
          setState({ error: null, approximation, isLoading: false })
        })
        map.on('error', () => {
          if (isActive && !hasLoaded) {
            setState({
              error: 'map-failed',
              approximation: null,
              isLoading: false,
            })
          }
        })
        map.addControl(new mapboxgl.NavigationControl())
        new mapboxgl.Marker().setLngLat(coordinates).addTo(map)
        setState({ error: null, approximation, isLoading: true })
      } catch {
        map?.remove()
        map = null
        if (isActive)
          setState({ error: phase, approximation: null, isLoading: false })
      }
    }

    initializeMap(container)
    return () => {
      isActive = false
      map?.remove()
    }
  }, [
    containerRef,
    hasAddress,
    tipoLogradouro,
    logradouro,
    numeroLogradouro,
    bairro,
    municipio,
    uf,
    cep,
    latitudeAproximadaLocal,
    longitudeAproximadaLocal,
  ])

  return {
    ...state,
    hasMapError: state.error !== null,
    isApproximateLocation: state.approximation !== null,
  }
}
