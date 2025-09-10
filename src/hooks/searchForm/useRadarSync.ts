import { useEffect, useState } from 'react'

import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface UseRadarSyncProps {
  selectedObjects: Radar[]
  radars: Radar[] | undefined
  formattedSearchParams: {
    radarIds: string[]
    date?: { from: string; to: string }
    plate?: string
  } | null
  setValue: (name: string, value: string[]) => void
}

export function useRadarSync({
  selectedObjects,
  radars,
  formattedSearchParams,
  setValue,
}: UseRadarSyncProps) {
  const setMultipleSelectedRadars = useMapStore(
    (state) => state.setMultipleSelectedRadars,
  )
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )

  // Flag para evitar resseleção quando usuário está fazendo mudanças manuais
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    console.log('🔄 useRadarSync - setValue effect triggered', {
      selectedObjectsCount: selectedObjects.length,
      selectedObjectsIds: selectedObjects.map((radar) => radar.cetRioCode),
    })
    setValue(
      'radarIds',
      selectedObjects.map((radar) => radar.cetRioCode),
    )
  }, [selectedObjects, setValue])

  // Efeito principal: sincronizar URL com Zustand store apenas no carregamento inicial
  useEffect(() => {
    // Verificar se multipleSelectedRadars é um array válido
    if (!Array.isArray(multipleSelectedRadars)) {
      return // Exit early se não for um array válido
    }

    console.log('🔄 useRadarSync - URL to Zustand sync effect triggered', {
      hasRadars: !!radars,
      radarsCount: radars?.length,
      hasFormattedSearchParams: !!formattedSearchParams,
      currentStoreRadarsCount: multipleSelectedRadars.length,
      currentStoreRadars: multipleSelectedRadars,
      urlRadarIds: formattedSearchParams?.radarIds,
      isInitialLoad,
    })

    // Apenas sincronizar no carregamento inicial para evitar loops
    if (!isInitialLoad) {
      console.log('🚫 useRadarSync - Skipping URL sync - not initial load')
      return
    }

    if (
      radars &&
      formattedSearchParams &&
      formattedSearchParams.radarIds?.length > 0
    ) {
      const urlRadarIds = formattedSearchParams.radarIds

      console.log('🎯 useRadarSync - Syncing URL radars to Zustand store (initial)', {
        urlRadarIds,
        currentStoreRadars: multipleSelectedRadars,
      })

      // Atualizar diretamente o store Zustand
      setMultipleSelectedRadars(urlRadarIds)
      setIsInitialLoad(false)
    } else if (
      formattedSearchParams &&
      formattedSearchParams.radarIds?.length === 0 &&
      Array.isArray(multipleSelectedRadars) &&
      multipleSelectedRadars.length > 0
    ) {
      console.log('🧹 useRadarSync - Clearing store because URL has no radars (initial)')
      setMultipleSelectedRadars([])
      setIsInitialLoad(false)
    } else if (radars && formattedSearchParams) {
      // Mark as loaded even if no radars
      setIsInitialLoad(false)
    }
  }, [
    radars,
    formattedSearchParams,
    multipleSelectedRadars,
    setMultipleSelectedRadars,
    isInitialLoad,
  ])
}
