/** O que as tendências derivam do perfil e das correlações: os dias do período, os fatos do recorte e os pontos do mapa. */
import { useMemo } from 'react'

import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import { eachDay } from '@/modules/vehicle-intelligence/lib/dates'
import type {
  PlateCorrelationsData,
  PlateProfileData,
} from '@/modules/vehicle-intelligence/types/domain'

export function useTrendsData(
  data: PlateProfileData | null,
  correlationData: PlateCorrelationsData | null,
) {
  const periodDays = useMemo(
    () =>
      data?.period.start && data.period.end
        ? eachDay(data.period.start, data.period.end)
        : [],
    [data?.period.start, data?.period.end],
  )
  // As tendências seguem o recorte global, como a análise das correlações: os
  // fatos sobrepostos vêm da resposta filtrada, e não das ocorrências do perfil,
  // que usam sempre a maior janela e o maior raio do build (60 min, 2 km).
  const scopedOccurrences = useMemo(
    () => (correlationData?.ready ? correlationData.occurrences : []),
    [correlationData],
  )
  const scopedOccurrenceDays = useMemo(
    () => [...new Set(scopedOccurrences.map((item) => item.day))].sort(),
    [scopedOccurrences],
  )
  const occurrenceIndices = useMemo(() => {
    const index = new Map(periodDays.map((day, position) => [day, position]))
    return scopedOccurrenceDays
      .map((day) => index.get(day))
      .filter((value): value is number => value !== undefined)
  }, [scopedOccurrenceDays, periodDays])
  // O mapa recebe todos os pontos de coleta e todos devem trazer série diária
  // e heatmap. O detalhe do top 15 fica apenas como fallback para respostas
  // antigas ainda presentes no cache curto da API.
  const circulationPoints: CirclePoint[] = useMemo(() => {
    if (!data) return []
    const detailed = new Map(
      data.top_locations.map((loc) => [loc.point_id, loc]),
    )
    const source = data.map_points?.length
      ? data.map_points
      : data.top_locations
    return source.map((loc) => {
      const detail = detailed.get(loc.point_id)
      return {
        id: loc.point_id,
        label: loc.location || 'Local não informado',
        sublabel: loc.neighborhood || undefined,
        detections: loc.detections,
        latitude: loc.latitude,
        longitude: loc.longitude,
        daily: loc.daily ?? detail?.daily,
        weekday_hour_heatmap:
          loc.weekday_hour_heatmap ?? detail?.weekday_hour_heatmap,
      }
    })
  }, [data])
  return {
    periodDays,
    scopedOccurrences,
    scopedOccurrenceDays,
    occurrenceIndices,
    circulationPoints,
  }
}

export type TrendsData = ReturnType<typeof useTrendsData>
