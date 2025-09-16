'use client'

import { useCallback } from 'react'

import type { CameraCOR, Radar } from '@/models/entities'

interface SearchSubmitProps {
  address: string
}

interface UseMapSearchProps {
  radars: Radar[] | undefined
  cameras: CameraCOR[] | undefined
  setViewport: (viewport: {
    latitude: number
    longitude: number
    zoom: number
  }) => void
}

export function useMapSearch({
  radars,
  cameras,
  setViewport,
}: UseMapSearchProps) {
  const handleSearchSubmit = useCallback(
    (props: SearchSubmitProps) => {
      const { address } = props
      const trimmedAddress = address.replace(/^0+/, '')

      const radar = radars?.find((r) => {
        const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
        return trimmedCetRioCode === trimmedAddress
      })

      if (radar) {
        setViewport({
          latitude: radar.latitude,
          longitude: radar.longitude,
          zoom: 20,
        })
        return
      }

      const camera = cameras?.find((c) => {
        const trimmedCode = c.code.replace(/^0+/, '')
        return trimmedCode === trimmedAddress
      })

      if (camera) {
        setViewport({
          latitude: camera.latitude,
          longitude: camera.longitude,
          zoom: 20,
        })
      }
    },
    [radars, cameras, setViewport],
  )

  return {
    handleSearchSubmit,
  }
}
