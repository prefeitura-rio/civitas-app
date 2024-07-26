'use client'
import { useContext } from 'react'

import { MonitoredPlatesContext } from '@/contexts/monitored-plates-context'

export function useMonitoredPlates() {
  const monitoredPlatesContext = useContext(MonitoredPlatesContext)
  return monitoredPlatesContext
}
