/**
 * As consultas do perfil da placa. As correlações e as citações seguem a placa e o recorte (useApi). O perfil de
 * circulação e os limites dos bairros só são lidos na aba Tendências e ficam guardados enquanto o perfil está aberto
 * (o perfil, uma vez por placa).
 */
import { useEffect, useState } from 'react'

import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import {
  cachedResponse,
  getPlateProfile,
  getRioNeighborhoodGeometry,
  plateCitationsPath,
  plateCorrelationsPath,
  plateDenunciasPath,
  plateProfilePath,
} from '@/modules/vehicle-intelligence/lib/api'
import type {
  PlateCitationsData,
  PlateCorrelationsData,
  PlateDenunciasData,
  PlateProfileData,
  RioNeighborhoodGeometry,
} from '@/modules/vehicle-intelligence/types/domain'
import type { PlateProfileAnalysis } from '@/modules/vehicle-intelligence/types/navigation'

export function usePlateProfileData(
  plate: string,
  analysis: PlateProfileAnalysis,
  scopeQuery: string | null,
) {
  const [data, setData] = useState<PlateProfileData | null>(() =>
    cachedResponse(plateProfilePath(plate)),
  )
  const [error, setError] = useState<string | null>(null)
  // A resposta de outra placa (ou de outro recorte) não fica na tela enquanto a nova carrega.
  const correlationsPath = plateCorrelationsPath(plate, scopeQuery)
  const correlations = useApi<PlateCorrelationsData>(correlationsPath)
  const correlationData =
    correlations.dataPath === correlationsPath ? correlations.data : null
  const correlationError = correlations.error
  // Sem citações legíveis (erro na consulta), o perfil segue sem o destaque.
  const citationsPath = recorte.hasCitations
    ? plateCitationsPath(plate, scopeQuery)
    : null
  const citations = useApi<PlateCitationsData>(citationsPath)
  const citationData =
    citations.dataPath === citationsPath ? citations.data : null
  // Disque Denúncia: as denúncias que citam a placa (as mesmas em qualquer recorte); sem resposta, o perfil segue sem.
  const denunciasPath = plateDenunciasPath(plate)
  const denuncias = useApi<PlateDenunciasData>(denunciasPath)
  const denunciaData =
    denuncias.dataPath === denunciasPath ? denuncias.data : null
  const [neighborhoodGeometry, setNeighborhoodGeometry] =
    useState<RioNeighborhoodGeometry | null>(null)
  const [neighborhoodGeometryError, setNeighborhoodGeometryError] = useState<
    string | null
  >(null)

  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    setData(cachedResponse(plateProfilePath(plate)))
    setError(null)
  }, [plate])

  useEffect(() => {
    if (analysis !== 'trends' || data?.plate === plate) return
    const controller = new AbortController()
    setData(cachedResponse(plateProfilePath(plate)))
    setError(null)
    getPlateProfile(plate, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((reason) => {
        if (reason.name === 'AbortError') return
        setError(
          reason instanceof Error ? reason.message : 'Falha ao montar o perfil',
        )
      })
    return () => controller.abort()
    // `data?.plate` só evita buscar de novo o perfil que já está na tela; não deve disparar a busca.
    // Dependências incompletas de propósito.
  }, [analysis, plate, retryToken])

  useEffect(() => {
    if (analysis !== 'trends' || neighborhoodGeometry) return
    const controller = new AbortController()
    setNeighborhoodGeometryError(null)
    getRioNeighborhoodGeometry(controller.signal)
      .then(setNeighborhoodGeometry)
      .catch((reason) => {
        if (reason.name === 'AbortError') return
        setNeighborhoodGeometry(null)
        setNeighborhoodGeometryError(
          'Não foi possível carregar os limites oficiais dos bairros.',
        )
      })
    return () => controller.abort()
  }, [analysis, neighborhoodGeometry])

  /** Pede o perfil de novo (o botão "Tentar novamente"). */
  const retry = () => setRetryToken((value) => value + 1)

  return {
    data,
    error,
    retry,
    correlationData,
    correlationError,
    citationData,
    denunciaData,
    neighborhoodGeometry,
    neighborhoodGeometryError,
  }
}
