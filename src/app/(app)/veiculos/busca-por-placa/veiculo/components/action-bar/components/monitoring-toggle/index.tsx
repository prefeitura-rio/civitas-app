'use client'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Siren } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MonitoredPlateFormDialog } from '@/app/(app)/components/monitored-plate-form-dialog'
import { Tooltip } from '@/components/custom/tooltip'
import { Toggle } from '@/components/ui/toggle'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { notAllowed } from '@/utils/template-messages'

import { DisableMonitoringAlertDialog } from './components/disable-monitoring-alert-dialog'

export function MonitoringToggle() {
  const monitoredPlateFormDialog = useDisclosure()
  const disableMonitoringAlertDisclosure = useDisclosure()
  const { setDialogInitialData } = useMonitoredPlates()
  const [monitored, setMonitored] = useState(false)
  const {
    layers: {
      trips: { lastSearchParams, isLoading: isLoadingGetCarPath },
    },
  } = useMap()
  const { data: profile } = useProfile()

  const { data: monitoredPlate, isLoading: isLoadingMonitoredPlate } = useQuery(
    {
      queryKey: ['cars', 'monitored', lastSearchParams?.plate],
      queryFn: () =>
        getMonitoredPlate({ plate: lastSearchParams?.plate || '' }),
      retry(failureCount, error) {
        if (
          isAxiosError(error) &&
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
      setDialogInitialData({ plate: lastSearchParams?.plate })
    }

    monitoredPlateFormDialog.onOpen()
  }

  useEffect(() => {
    if (!isLoadingMonitoredPlate) {
      if (monitoredPlate) {
        setMonitored(monitoredPlate.active)
      } else {
        setMonitored(false)
      }
    }
  }, [monitoredPlate, isLoadingMonitoredPlate])

  return (
    <>
      {lastSearchParams && (
        <div>
          <Tooltip
            text="Gerenciar monitoramento"
            disabled={
              isLoadingGetCarPath ||
              isLoadingMonitoredPlate ||
              !profile ||
              !profile.is_admin
            }
            disabledText={
              isLoadingGetCarPath || isLoadingMonitoredPlate ? '' : notAllowed
            }
            asChild
          >
            <div>
              <Toggle
                pressed={monitored}
                onPressedChange={handleSetMonitored}
                disabled={
                  isLoadingGetCarPath ||
                  isLoadingMonitoredPlate ||
                  !profile ||
                  !profile.is_admin
                }
                className=""
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
            shouldFetchData={!!monitoredPlate}
          />
          <DisableMonitoringAlertDialog
            isOpen={disableMonitoringAlertDisclosure.isOpen}
            onOpenChange={disableMonitoringAlertDisclosure.onOpenChange}
            plate={lastSearchParams?.plate}
          />
        </div>
      )}
    </>
  )
}
