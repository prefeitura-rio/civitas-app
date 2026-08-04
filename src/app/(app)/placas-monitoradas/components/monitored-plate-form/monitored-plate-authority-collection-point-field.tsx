'use client'

import { useEffect, useRef } from 'react'

import {
  CollectionPointPickerDialog,
  useCollectionPointPickerState,
} from '@/components/custom/collection-point-picker'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface MonitoredPlateAuthorityCollectionPointFieldProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Exibe o toggle "Monitorar todos os pontos" e controla seu estado. */
  monitorAll?: boolean
  onMonitorAllChange?: (value: boolean) => void
  /** Quando true, seleciona todos os pontos automaticamente na primeira carga. */
  defaultSelectAll?: boolean
}

/**
 * Adapter de domínio: toggle "monitorar todos" + picker compartilhado de radares.
 */
export function MonitoredPlateAuthorityCollectionPointField({
  label = 'Pontos de coleta',
  description,
  value,
  onChange,
  disabled = false,
  monitorAll,
  onMonitorAllChange,
  defaultSelectAll = false,
}: MonitoredPlateAuthorityCollectionPointFieldProps) {
  const hasMonitorAllToggle = onMonitorAllChange !== undefined
  const picker = useCollectionPointPickerState({
    value,
    onChange,
    defaultSelectAll,
  })

  // Abre o picker quando o toggle passa de "todos" para "específicos"
  const prevMonitorAllRef = useRef(monitorAll)
  useEffect(() => {
    if (
      prevMonitorAllRef.current === true &&
      monitorAll === false &&
      !picker.expanded
    ) {
      picker.openPicker()
    }
    prevMonitorAllRef.current = monitorAll
  }, [monitorAll, picker])

  // Reverte o toggle para "monitorar todos" quando o picker é fechado sem
  // nenhum equipamento selecionado. Evita estado inconsistente em que o toggle
  // indica seleção específica mas nenhum radar foi escolhido.
  const prevExpandedRef = useRef(picker.expanded)
  useEffect(() => {
    const wasExpanded = prevExpandedRef.current
    prevExpandedRef.current = picker.expanded

    if (
      wasExpanded &&
      !picker.expanded &&
      monitorAll === false &&
      value.length === 0 &&
      onMonitorAllChange
    ) {
      onMonitorAllChange(true)
    }
  }, [picker.expanded, monitorAll, value.length, onMonitorAllChange])

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

      {hasMonitorAllToggle ? (
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border p-3">
          <span className="text-sm">Monitorar todos os pontos de coleta</span>
          <Switch
            checked={monitorAll ?? true}
            onCheckedChange={onMonitorAllChange}
            disabled={disabled}
            aria-label="Monitorar todos os pontos de coleta"
          />
        </label>
      ) : null}

      {monitorAll ? (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          Todas as câmeras disponíveis serão monitoradas. Desative o toggle
          acima para selecionar pontos específicos.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start text-xs"
          disabled={disabled || picker.isPending}
          onClick={picker.openPicker}
        >
          {value.length > 0
            ? `${value.length} equipamento(s) de LPR selecionado(s) — editar`
            : 'Buscar e selecionar equipamentos de LPR'}
        </Button>
      )}

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
