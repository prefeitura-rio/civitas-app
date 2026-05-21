'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getTicketDashboardSlaConfig,
  mapSlaConfigOutToFormValues,
  SLA_CONFIG_DEFAULT_VALUES,
  type TicketDashboardSlaConfigOut,
  type TicketDashboardSlaFormValues,
  updateTicketDashboardSlaConfig,
} from '@/http/tickets/ticket-dashboard-sla-config'
import { getApiErrorMessage } from '@/utils/error-handlers'

import tcFormStyles from '../../../criar/ticket-create/ticket-create-form.module.css'
import { SLA_CONFIG_FIELDS, SLA_DAY_OPTIONS } from '../sla-config.constants'
import styles from '../sla-config.module.css'

const SLA_CONFIG_QUERY_KEY = ['ticket-dashboard-sla-config'] as const

const slaConfigSchema = z.object({
  image_search_days: z.coerce.number().int().min(1),
  electronic_fence_days: z.coerce.number().int().min(1),
  radar_search_days: z.coerce.number().int().min(1),
  license_plate_search_days: z.coerce.number().int().min(1),
  related_license_plates_days: z.coerce.number().int().min(1),
  joint_license_plates_days: z.coerce.number().int().min(1),
  image_analysis_days: z.coerce.number().int().min(1),
  others_days: z.coerce.number().int().min(1),
})

const SLA_FIELD_ROWS = [
  [SLA_CONFIG_FIELDS[0], SLA_CONFIG_FIELDS[1]],
  [SLA_CONFIG_FIELDS[2], SLA_CONFIG_FIELDS[3]],
  [SLA_CONFIG_FIELDS[4], SLA_CONFIG_FIELDS[5]],
  [SLA_CONFIG_FIELDS[6], SLA_CONFIG_FIELDS[7]],
] as const

function resolveFormValues(
  config: TicketDashboardSlaConfigOut | undefined,
  notFound: boolean,
): TicketDashboardSlaFormValues {
  if (notFound || !config) return SLA_CONFIG_DEFAULT_VALUES
  return mapSlaConfigOutToFormValues(config)
}

function areFormValuesEqual(
  a: TicketDashboardSlaFormValues,
  b: TicketDashboardSlaFormValues,
) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function SlaConfigForm() {
  const queryClient = useQueryClient()

  const configQuery = useQuery({
    queryKey: SLA_CONFIG_QUERY_KEY,
    queryFn: getTicketDashboardSlaConfig,
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

  const [savedValues, setSavedValues] = useState<TicketDashboardSlaFormValues>(
    SLA_CONFIG_DEFAULT_VALUES,
  )

  const { control, handleSubmit, reset } =
    useForm<TicketDashboardSlaFormValues>({
      resolver: zodResolver(slaConfigSchema),
      defaultValues: SLA_CONFIG_DEFAULT_VALUES,
    })

  const currentValues = useWatch({ control }) ?? SLA_CONFIG_DEFAULT_VALUES

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
    mutationFn: (values: TicketDashboardSlaFormValues) =>
      updateTicketDashboardSlaConfig(values),
    onSuccess: (data) => {
      const values = mapSlaConfigOutToFormValues(data)
      queryClient.setQueryData(SLA_CONFIG_QUERY_KEY, data)
      setSavedValues(values)
      reset(values)
      toast.success('Configuração de SLA salva com sucesso.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const isLoadingConfig = configQuery.isLoading
  const isSaving = saveMutation.isPending

  const canSave = !isLoadingConfig && hasChanges

  function handleClear() {
    reset(SLA_CONFIG_DEFAULT_VALUES)
    toast.message(
      'Valores restaurados para o padrão. Clique em Salvar para gravar.',
    )
  }

  async function onSubmit(values: TicketDashboardSlaFormValues) {
    await saveMutation.mutateAsync(values)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuração de SLA</h1>
        <p className={styles.subtitle}>
          Dashboard de métricas e indicadores de desempenho
        </p>
      </header>

      {isLoadingConfig ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form
          className={styles.formSection}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {SLA_FIELD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.formRow}>
              {row.map((field) => (
                <div key={field.name} className={styles.field}>
                  <Label
                    htmlFor={field.name}
                    className={tcFormStyles.fieldLabel}
                  >
                    {field.label}
                  </Label>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: controllerField }) => {
                      const days = Number(controllerField.value)
                      const selectValue = Number.isFinite(days)
                        ? String(days)
                        : undefined

                      return (
                        <Select
                          key={`${field.name}-${selectValue ?? 'empty'}`}
                          value={selectValue}
                          onValueChange={(value) =>
                            controllerField.onChange(Number(value))
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger
                            id={field.name}
                            className={`h-11 w-full ${tcFormStyles.inputBg}`}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent
                            className={tcFormStyles.selectContentForm}
                          >
                            {SLA_DAY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className={tcFormStyles.selectItemForm}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              className={styles.clearButton}
              onClick={handleClear}
              disabled={isSaving}
            >
              Limpar configuração
            </Button>
            <Button
              type="submit"
              className={`${tcFormStyles.saveButton} ${styles.saveButton}`}
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
