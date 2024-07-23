'use client'
import { useQuery } from '@tanstack/react-query'
import { Siren } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MonitoredPlateFormDialog } from '@/app/(app)/placas-monitoradas/components/dialogs/monitored-plate-form-dialog'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip } from '@/components/ui/tooltip'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { isApiError } from '@/lib/api'
import { notAllowed } from '@/utils/template-messages'

import { DisableMonitoringAlertDialog } from './disable-monitoring-alert-dialog'

export function MonitoringToggle() {
  const monitoredPlateFormDialog = useDisclosure()
  const disableMonitoringAlertDisclosure = useDisclosure()
  const { setDialogInitialData } = useMonitoredPlates()
  const [monitored, setMonitored] = useState(false)
  const { lastSearchParams, isLoading: isLoadingGetCarPath } = useCarPath()
  const { isAdmin } = useProfile()

  const { data: response, isLoading: isLoadingMonitoredPlate } = useQuery({
    queryKey: ['cars', 'monitored', lastSearchParams?.placa],
    queryFn: () => getMonitoredPlate({ plate: lastSearchParams?.placa || '' }),
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
  })

  function handleSetMonitored() {
    if (lastSearchParams) {
      setDialogInitialData({ plate: lastSearchParams?.placa })
    }

    monitoredPlateFormDialog.onOpen()
  }

  useEffect(() => {
    if (!isLoadingMonitoredPlate) {
      if (response) {
        setMonitored(response.data.active)
      } else {
        setMonitored(false)
      }
    }
  }, [response, isLoadingMonitoredPlate])

  return (
    <>
      {lastSearchParams && (
        <div>
          <Tooltip
            text="Gerenciar monitoramento"
            disabled={
              isLoadingGetCarPath || isLoadingMonitoredPlate || !isAdmin
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
                  isLoadingGetCarPath || isLoadingMonitoredPlate || !isAdmin
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
            shouldFetchData={!!response?.data}
          />
          <DisableMonitoringAlertDialog
            isOpen={disableMonitoringAlertDisclosure.isOpen}
            onOpenChange={disableMonitoringAlertDisclosure.onOpenChange}
            plate={lastSearchParams?.placa}
          />
        </div>
      )}
    </>
  )
}
