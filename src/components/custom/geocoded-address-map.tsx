'use client'

import { useRef } from 'react'

import { useGeocodedMap } from '@/hooks/maps/use-geocoded-map'
import type { CortexMapAddress } from '@/models/address'

const errorMessages = {
  'address-not-found': 'Endereço não encontrado no mapa.',
  'search-failed': 'Não foi possível consultar a localização. Tente novamente.',
  'map-failed': 'Não foi possível carregar o mapa. Tente novamente.',
}

/** Renders the shared CPF/CNPJ address map and discloses its location precision. */
export function GeocodedAddressMap({ address }: { address: CortexMapAddress }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { error, isLoading, approximation } = useGeocodedMap(
    containerRef,
    address,
  )

  return (
    <div className="mt-6">
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-lg"
      />
      {isLoading && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Localizando endereço...
        </p>
      )}
      {!isLoading && approximation && !error && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {approximation === 'street'
            ? 'Localização aproximada da rua. O número do imóvel não foi confirmado.'
            : 'Localização aproximada.'}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-muted-foreground">
          {errorMessages[error]}
        </p>
      )}
    </div>
  )
}
