'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { CollectionPointPickerDialog } from './collection-point-picker-dialog'
import { useCollectionPointPickerState } from './use-collection-point-picker-state'

export interface CollectionPointPickerFieldProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Quando true, seleciona todos os pontos automaticamente na primeira carga. */
  defaultSelectAll?: boolean
  emptyButtonLabel?: string
  selectedButtonLabel?: (count: number) => string
}

export function CollectionPointPickerField({
  label = 'Pontos de coleta',
  description,
  value,
  onChange,
  disabled = false,
  defaultSelectAll = false,
  emptyButtonLabel = 'Buscar e selecionar radares',
  selectedButtonLabel = (count) => `${count} radar(es) selecionado(s) — editar`,
}: CollectionPointPickerFieldProps) {
  const picker = useCollectionPointPickerState({
    value,
    onChange,
    defaultSelectAll,
  })

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-foreground">{label}</Label>
        {description ? (
          <p className="text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start text-xs"
        disabled={disabled || picker.isPending}
        onClick={picker.openPicker}
      >
        {value.length > 0
          ? selectedButtonLabel(value.length)
          : emptyButtonLabel}
      </Button>

      <CollectionPointPickerDialog
        open={picker.expanded}
        onOpenChange={(open) => {
          if (!open) picker.closePicker()
        }}
        picker={picker}
        disabled={disabled}
      />
    </div>
  )
}
