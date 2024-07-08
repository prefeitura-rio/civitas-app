'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { MonitoredPlateFormDialog } from '@/app/(app)/placas-monitoradas/components/dialogs/monitored-plate-form-dialog'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip } from '@/components/ui/tooltip'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'
import { useRole } from '@/hooks/use-role'
import { useCarPath } from '@/hooks/useCarPathContext'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { isApiError } from '@/lib/api'
import { queryClient } from '@/lib/react-query'
import { notAllowed } from '@/utils/template-messages'

import type { FilterForm } from '../filter-form'
import { DisableMonitoringAlertDialog } from './disable-monitoring-alert-dialog'

export function MonitoringToggle() {
  const monitoredPlateFormDialog = useDisclosure()
  const disableMonitoringAlertDisclosure = useDisclosure()
  const { getValues } = useFormContext<FilterForm>()
  const { setDialogInitialData } = useMonitoredPlates()
  const [monitored, setMonitored] = useState(false)
  const { lastSearchParams, isLoading: isLoadingGetCarPath } = useCarPath()
  const { isAdmin } = useRole()

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

  const { mutateAsync: updateMonitoredPlateMutation } = useMutation({
    mutationFn: updateMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          `cars/monitored/${getValues('plateNumer')}`,
          'cars/monitored',
        ],
      })
    },
  })

  function handleSetMonitored(shouldMonitor: boolean) {
    const plate = getValues('plateNumer')

    if (shouldMonitor) {
      if (response && response.data) {
        setMonitored(true)
        updateMonitoredPlateMutation({ plate, active: true })
      } else {
        setDialogInitialData({ plate })
        monitoredPlateFormDialog.onOpen()
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
          <Tooltip
            text={
              monitored ? 'Desativar monitoramento' : 'Ativar monitoramento'
            }
            disabled={
              isLoadingGetCarPath || isLoadingMonitoredPlate || !isAdmin
            }
            disabledText={
              isLoadingGetCarPath || isLoadingMonitoredPlate ? '' : notAllowed
            }
          >
            <Toggle
              pressed={monitored}
              onPressedChange={handleSetMonitored}
              disabled={
                isLoadingGetCarPath || isLoadingMonitoredPlate || !isAdmin
              }
              className="cursor-default"
            >
              <Siren className="h-4 w-4" />
            </Toggle>
          </Tooltip>
          <MonitoredPlateFormDialog
            isOpen={monitoredPlateFormDialog.isOpen}
            onClose={monitoredPlateFormDialog.onClose}
            onOpen={monitoredPlateFormDialog.onOpen}
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
