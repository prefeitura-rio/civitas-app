'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  getTicketDashboardWidgetsConfig,
  mapWidgetsConfigOutToFormValues,
  type TicketDashboardWidgetsConfigOut,
  type TicketDashboardWidgetsFormValues,
  updateTicketDashboardWidgetsConfig,
  WIDGETS_CONFIG_DEFAULT_VALUES,
} from '@/http/tickets/ticket-dashboard-widgets-config'
import { getApiErrorMessage } from '@/utils/error-handlers'

import tcFormStyles from '../../../criar/ticket-create/ticket-create-form.module.css'
import pageStyles from '../../sla/sla-config.module.css'
import { WIDGET_CONFIG_SECTIONS } from '../widgets-config.constants'
import styles from '../widgets-config.module.css'
import { WidgetConfigSection } from './widget-config-section'

const WIDGETS_CONFIG_QUERY_KEY = ['ticket-dashboard-widgets-config'] as const

const widgetsConfigSchema = z.object({
  total_call_volume: z.boolean(),
  closed_calls_by_urgency: z.boolean(),
  closed_calls_by_nature: z.boolean(),
  closed_calls_by_service: z.boolean(),
  media_relevant_calls_volume: z.boolean(),
  average_resolution_time_general: z.boolean(),
  average_resolution_time_by_profile: z.boolean(),
  average_resolution_time_by_urgency: z.boolean(),
  delivery_time_performance_by_urgency: z.boolean(),
  delivery_time_performance_by_service: z.boolean(),
  delivery_time_for_media_relevant: z.boolean(),
  open_calls_by_team: z.boolean(),
  closed_calls_by_team: z.boolean(),
  delivery_time_by_team: z.boolean(),
  sla_attainment_by_team: z.boolean(),
  closed_calls_by_requester_sphere: z.boolean(),
  closed_calls_by_requester: z.boolean(),
  closed_calls_by_requester_agency: z.boolean(),
  closed_calls_by_requester_type: z.boolean(),
  closed_calls_by_requester_institution: z.boolean(),
})

function resolveFormValues(
  config: TicketDashboardWidgetsConfigOut | undefined,
  notFound: boolean,
): TicketDashboardWidgetsFormValues {
  if (notFound || !config) return WIDGETS_CONFIG_DEFAULT_VALUES
  return mapWidgetsConfigOutToFormValues(config)
}

function areFormValuesEqual(
  a: TicketDashboardWidgetsFormValues,
  b: TicketDashboardWidgetsFormValues,
) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function WidgetsConfigForm() {
  const queryClient = useQueryClient()

  const configQuery = useQuery({
    queryKey: WIDGETS_CONFIG_QUERY_KEY,
    queryFn: getTicketDashboardWidgetsConfig,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })

  const isNotFound =
    configQuery.isError &&
    isAxiosError(configQuery.error) &&
    configQuery.error.response?.status === 404

  const [savedValues, setSavedValues] =
    useState<TicketDashboardWidgetsFormValues>(WIDGETS_CONFIG_DEFAULT_VALUES)

  const { control, handleSubmit, reset } =
    useForm<TicketDashboardWidgetsFormValues>({
      resolver: zodResolver(widgetsConfigSchema),
      defaultValues: WIDGETS_CONFIG_DEFAULT_VALUES,
    })

  const watchedValues = useWatch({
    control,
    defaultValue: WIDGETS_CONFIG_DEFAULT_VALUES,
  })
  const currentValues: TicketDashboardWidgetsFormValues = {
    ...WIDGETS_CONFIG_DEFAULT_VALUES,
    ...watchedValues,
  }

  const hasChanges = useMemo(
    () => !areFormValuesEqual(currentValues, savedValues),
    [currentValues, savedValues],
  )

  useEffect(() => {
    if (configQuery.isLoading) return
    const values = resolveFormValues(configQuery.data, isNotFound)
    setSavedValues(values)
    reset(values)
  }, [configQuery.data, configQuery.isLoading, isNotFound, reset])

  useEffect(() => {
    if (!configQuery.isError || !isAxiosError(configQuery.error)) return
    if (configQuery.error.response?.status === 404) return
    toast.error(getApiErrorMessage(configQuery.error))
  }, [configQuery.error, configQuery.isError])

  const saveMutation = useMutation({
    mutationFn: (values: TicketDashboardWidgetsFormValues) =>
      updateTicketDashboardWidgetsConfig(values),
    onSuccess: (data) => {
      const values = mapWidgetsConfigOutToFormValues(data)
      queryClient.setQueryData(WIDGETS_CONFIG_QUERY_KEY, data)
      setSavedValues(values)
      reset(values)
      toast.success('Configuração de visualização salva com sucesso.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const isLoadingConfig = configQuery.isLoading
  const isSaving = saveMutation.isPending
  const canSave = !isLoadingConfig && hasChanges

  function handleClear() {
    reset(WIDGETS_CONFIG_DEFAULT_VALUES)
    toast.message(
      'Valores restaurados para o padrão. Clique em Salvar para gravar.',
    )
  }

  async function onSubmit(values: TicketDashboardWidgetsFormValues) {
    await saveMutation.mutateAsync(values)
  }

  return (
    <div className={pageStyles.page}>
      <header className={pageStyles.header}>
        <h1 className={pageStyles.title}>Configuração de Dashboard</h1>
        <p className={pageStyles.subtitle}>
          Dashboard de métricas e indicadores de desempenho
        </p>
      </header>

      {isLoadingConfig ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form
          className={pageStyles.formSection}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className={styles.sections}>
            {WIDGET_CONFIG_SECTIONS.map((section) => (
              <WidgetConfigSection
                key={section.id}
                section={section}
                control={control}
                disabled={isSaving}
              />
            ))}
          </div>

          <div className={pageStyles.actions}>
            <Button
              type="button"
              variant="secondary"
              className={pageStyles.clearButton}
              onClick={handleClear}
              disabled={isSaving}
            >
              Limpar configuração
            </Button>
            <Button
              type="submit"
              className={`${tcFormStyles.saveButton} ${pageStyles.saveButton}`}
              disabled={!canSave || isSaving}
            >
              {isSaving ? <Spinner /> : 'Salvar'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
