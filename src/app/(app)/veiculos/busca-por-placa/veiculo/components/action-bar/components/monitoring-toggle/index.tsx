'use client'
import { useQuery } from '@tanstack/react-query'
import { Siren } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MonitoredPlateFormDialog } from '@/app/(app)/placas-monitoradas/components/monitored-plate-form/monitored-plate-form-dialog'
import { Tooltip } from '@/components/custom/tooltip'
import { Toggle } from '@/components/ui/toggle'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { getMonitoredPlate } from '@/http/monitored-plates'
import { isApiError } from '@/lib/api'

export function MonitoringToggle() {
  const monitoredPlateFormDialog = useDisclosure()
  const { setDialogInitialData } = useMonitoredPlates()
  const [monitored, setMonitored] = useState(false)
  const {
    layers: {
      trips: { lastSearchParams, isLoading: isLoadingGetCarPath },
    },
  } = useMap()

  const { data: monitoredPlate, isLoading: isLoadingMonitoredPlate } = useQuery(
    {
      queryKey: ['monitored-plates', lastSearchParams?.plate],
      queryFn: () =>
        getMonitoredPlate({ plate: lastSearchParams?.plate || '' }),
      retry(failureCount, error) {
        if (
          isApiError(error) &&
          error.response?.data.detail === 'Plate not found'
        ) {
          return false
        }
        if (failureCount > 2) {
          return false
        }
        return true
      },
    },
  )

  function handleSetMonitored() {
    if (lastSearchParams) {
      setDialogInitialData({ plate: lastSearchParams.plate })
    }

    monitoredPlateFormDialog.onOpen()
  }

  useEffect(() => {
    if (!isLoadingMonitoredPlate) {
      // Derived from authority links (read-only pressed state)
      setMonitored(monitoredPlate?.active ?? false)
    }
  }, [monitoredPlate, isLoadingMonitoredPlate])

  return (
    <>
      {lastSearchParams && (
        <div>
          <Tooltip
            text="Gerenciar monitoramento"
            disabled={isLoadingGetCarPath || isLoadingMonitoredPlate}
            disabledText=""
            asChild
          >
            <div>
              <Toggle
                pressed={monitored}
                onPressedChange={handleSetMonitored}
                disabled={isLoadingGetCarPath || isLoadingMonitoredPlate}
                size="sm"
              >
                <Siren className="h-4 w-4" />
              </Toggle>
            </div>
          </Tooltip>
          <MonitoredPlateFormDialog
            isOpen={monitoredPlateFormDialog.isOpen}
            onClose={monitoredPlateFormDialog.onClose}
            onOpen={monitoredPlateFormDialog.onOpen}
            shouldFetchData={Boolean(monitoredPlate)}
          />
        </div>
      )}
    </>
  )
}
