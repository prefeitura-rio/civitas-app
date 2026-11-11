import { useEffect, useState } from 'react'

import { getDashboard } from '@/modules/vehicle-intelligence/lib/api'
import type {
  DashboardData,
  DashboardFilters,
} from '@/modules/vehicle-intelligence/types/domain'

/** Limites de CISP no mapa: ligados pelo analista ou ao filtrar uma CISP; a geometria vem do dashboard, uma vez. */
export function useCispGeometry(filters: DashboardFilters) {
  const [showCisps, setShowCisps] = useState(false)
  const [cispGeometry, setCispGeometry] = useState<
    DashboardData['mapa'] | null
  >(null)
  const [cispGeometryLoading, setCispGeometryLoading] = useState(false)
  const [cispGeometryError, setCispGeometryError] = useState(false)
  useEffect(() => {
    if (filters.cisps.length > 0) setShowCisps(true)
  }, [filters.cisps])
  useEffect(() => {
    if (!showCisps || cispGeometry) return
    const controller = new AbortController()
    setCispGeometryLoading(true)
    setCispGeometryError(false)
    getDashboard(filters, controller.signal)
      .then((dashboard) => setCispGeometry(dashboard.mapa))
      .catch((reason) => {
        if (reason.name !== 'AbortError') setCispGeometryError(true)
      })
      .finally(() => setCispGeometryLoading(false))
    return () => controller.abort()
  }, [cispGeometry, filters, showCisps])
  return {
    showCisps,
    setShowCisps,
    cispGeometry,
    cispGeometryLoading,
    cispGeometryError,
  }
}
