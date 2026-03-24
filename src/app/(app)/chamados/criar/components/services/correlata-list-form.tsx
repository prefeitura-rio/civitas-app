import { Plus, Trash } from 'lucide-react'
import type { Control, UseFormRegister } from 'react-hook-form'
import { Controller, useFieldArray } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import styles from '../../ticket-create/ticket-create-form.module.css'
import type { TicketCreateForm } from '../../ticket-create/ticket-create-schema'
import { RangeStatField } from '../shared/range-stat-field'

type Props = {
  register: UseFormRegister<TicketCreateForm>
  control: Control<TicketCreateForm>
  index: number
  name: 'placas_correlatas' | 'placas_conjuntas'
  disabled: boolean
}

export function CorrelataListForm({
  register,
  control,
  index,
  name,
  disabled,
}: Props) {
  const itemsFieldArray = useFieldArray({
    control,
    name: `${name}.${index}.items`,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {itemsFieldArray.fields.map((item, itemIndex) => (
          <div
            key={item.id}
            className="rounded-md border border-slate-700/40 bg-[#0f2435]/50 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Item {itemIndex + 1}
              </p>

              {itemsFieldArray.fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={disabled}
                  onClick={() => itemsFieldArray.remove(itemIndex)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Placa</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={disabled}
                  {...register(`${name}.${index}.items.${itemIndex}.plate`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Início</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  type="datetime-local"
                  disabled={disabled}
                  {...register(
                    `${name}.${index}.items.${itemIndex}.period_start`,
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Fim</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  type="datetime-local"
                  disabled={disabled}
                  {...register(
                    `${name}.${index}.items.${itemIndex}.period_end`,
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2"
          disabled={disabled}
          onClick={() =>
            itemsFieldArray.append({
              plate: '',
              period_start: null,
              period_end: null,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Adicionar placa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-3 md:col-span-3">
          <Controller
            control={control}
            name={`${name}.${index}.interest_interval_minutes`}
            render={({ field }) => (
              <RangeStatField
                label="Intervalo de Interesse"
                value={Number(field.value ?? 1)}
                min={1}
                max={5}
                unit=""
                disabled={disabled}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-3 md:col-span-3">
          <Controller
            control={control}
            name={`${name}.${index}.detection_count`}
            render={({ field }) => (
              <RangeStatField
                label="Quantidade de Detecção"
                value={Number(field.value ?? 10)}
                min={5}
                max={50}
                unit=""
                disabled={disabled}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <Label className={styles.fieldLabel}>Detecção</Label>

          <Controller
            control={control}
            name={`${name}.${index}.detection`}
            render={({ field }) => (
              <div className={styles.segmentedDetection}>
                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${field.value === 'ANTES' ? styles.detectionButtonActive : ''}`}
                  onClick={() => field.onChange('ANTES')}
                >
                  Antes
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${field.value === 'DEPOIS' ? styles.detectionButtonActive : ''}`}
                  onClick={() => field.onChange('DEPOIS')}
                >
                  Depois
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${field.value === 'AMBOS' ? styles.detectionButtonActive : ''}`}
                  onClick={() => field.onChange('AMBOS')}
                >
                  Ambos
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
