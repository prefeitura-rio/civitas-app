import { Plus, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maskPlateBR } from '@/utils/string-formatters'

import type {
  CorrelataDraft,
  CorrelataDraftItem,
} from '../../ticket-create/ticket-create.constant'
import { emptyCorrelataItem } from '../../ticket-create/ticket-create.constant'
import styles from '../../ticket-create/ticket-create-form.module.css'
import {
  PeriodFields,
  PeriodFieldsCalendarStyle,
} from '../shared/period-fields'
import { RangeStatField } from '../shared/range-stat-field'

type Props = {
  draft: CorrelataDraft
  setDraft: React.Dispatch<React.SetStateAction<CorrelataDraft>>
  onAdd: () => void
  hideAddButton?: boolean
  useCalendarStyle?: boolean
  errors?: Record<string, string> | null
  /** Validação de placas só deve rodar no blur/edição do campo, não ao mudar período etc. */
  onPlateBlur?: () => void
  onPlateChange?: () => void
}

export function CorrelataPanel({
  draft,
  setDraft,
  onAdd,
  hideAddButton,
  useCalendarStyle,
  errors,
  onPlateBlur,
  onPlateChange,
}: Props) {
  const PeriodComponent = useCalendarStyle
    ? PeriodFieldsCalendarStyle
    : PeriodFields

  const addPlate = () => {
    setDraft((prev) => ({
      ...prev,
      plates: [...prev.plates, emptyCorrelataItem()],
    }))
  }

  const updatePlate = (index: number, updates: Partial<CorrelataDraftItem>) => {
    setDraft((prev) => ({
      ...prev,
      plates: prev.plates.map((item, i) =>
        i === index ? { ...item, ...updates } : item,
      ),
    }))
  }

  const removePlate = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      plates: prev.plates.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="w-full min-w-0 space-y-3">
        <PeriodComponent
          startValue={draft.period_start}
          endValue={draft.period_end}
          onChangeStart={(value) =>
            setDraft((prev) => ({ ...prev, period_start: value }))
          }
          onChangeEnd={(value) =>
            setDraft((prev) => ({ ...prev, period_end: value }))
          }
        />

        {(errors?.period_start || errors?.period_end) && (
          <p className="text-xs text-destructive">
            {errors.period_start || errors.period_end}
          </p>
        )}
      </div>

      {draft.plates.map((item, index) => (
        <div key={index} className="w-full min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-sm font-medium text-muted-foreground">
              Placa {draft.plates.length > 1 ? index + 1 : ''}
            </p>

            {draft.plates.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 shrink-0 p-0"
                onClick={() => removePlate(index)}
                title="Remover"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input
              className={`h-11 min-w-0 ${styles.inputBg}`}
              value={item.plate}
              onChange={(e) => {
                updatePlate(index, { plate: maskPlateBR(e.target.value) })
                onPlateChange?.()
              }}
              onBlur={() => onPlateBlur?.()}
            />
            {errors?.[`plates.${index}.plate`] && (
              <p className="text-xs text-destructive">
                {errors[`plates.${index}.plate`]}
              </p>
            )}
          </div>
        </div>
      ))}

      {errors?.plates && (
        <p className="text-xs text-destructive">{errors.plates}</p>
      )}

      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={addPlate}
          className={styles.addPointFocalButton}
        >
          <Plus className="h-5 w-5 shrink-0" aria-hidden />
          Adicionar placa
        </button>
      </div>

      <div className="min-w-0">
        <RangeStatField
          label="Intervalo de interesse"
          value={draft.interest_interval_minutes}
          min={1}
          max={5}
          unit=""
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              interest_interval_minutes: value,
            }))
          }
        />
      </div>

      <div className="min-w-0">
        <RangeStatField
          label="Quantidade de Detecção"
          value={draft.detection_count}
          min={5}
          max={50}
          unit=""
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              detection_count: value,
            }))
          }
        />
      </div>

      <div className="min-w-0 space-y-1.5">
        <Label className={styles.fieldLabel}>Detecção</Label>
        <div className={styles.segmentedDetection}>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'ANTES' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'ANTES' }))
            }
          >
            Antes
          </button>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'DEPOIS' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'DEPOIS' }))
            }
          >
            Depois
          </button>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'AMBOS' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'AMBOS' }))
            }
          >
            Ambos
          </button>
        </div>
      </div>

      {errors?.detection && (
        <p className="text-xs text-destructive">{errors.detection}</p>
      )}

      {!hideAddButton && (
        <button
          type="button"
          className={styles.inlineAddButton}
          onClick={onAdd}
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
