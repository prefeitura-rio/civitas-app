'use client'
import { useQuery } from '@tanstack/react-query'
import { Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { MonitoredPlateFormDialog } from '@/app/(app)/placas-monitoradas/components/dialogs/monitored-plate-form-dialog'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip } from '@/components/ui/tooltip'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'
import { useCarPath } from '@/hooks/useCarPathContext'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { isApiError } from '@/lib/api'

import type { FilterForm } from '../filter-form'
import { DisableMonitoringAlertDialog } from './disable-monitoring-alert-dialog'

export function MonitoringToggle() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const disableMonitoringAlertDisclosure = useDisclosure()
  const { getValues } = useFormContext<FilterForm>()
  const { setDialogInitialData } = useMonitoredPlates()
  const [monitored, setMonitored] = useState(false)
  const { lastSearchParams, isLoading: isLoadingGetCarPath } = useCarPath()

  const { data: response, isLoading: isLoadingMonitoredPlate } = useQuery({
    queryKey: [`cars/monitored/${lastSearchParams?.placa}`],
    queryFn: () =>
      lastSearchParams
        ? getMonitoredPlate({ plate: lastSearchParams?.placa })
        : null,
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

  function handleSetMonitored(shouldMonitor: boolean) {
    const plate = getValues('plateNumer')

    if (shouldMonitor) {
      if (response && response.data) {
        setMonitored(true)
      } else {
        setDialogInitialData({ plate })
        onOpen()
      }
    } else {
      disableMonitoringAlertDisclosure.onOpen()
    }
  }

  useEffect(() => {
    if (response) {
      setMonitored(response.data.active)
    } else {
      setMonitored(false)
    }
  }, [response])

  return (
    <>
      {lastSearchParams && (
        <div>
          <Tooltip text="Monitorar placa" asChild>
            <Toggle
              pressed={monitored}
              onPressedChange={handleSetMonitored}
              disabled={isLoadingGetCarPath || isLoadingMonitoredPlate}
            >
              <Siren className="h-4 w-4" />
            </Toggle>
          </Tooltip>
          <MonitoredPlateFormDialog
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
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
