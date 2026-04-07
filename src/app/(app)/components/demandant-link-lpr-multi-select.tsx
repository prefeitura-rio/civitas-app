'use client'

import { useMemo } from 'react'

import type { Option } from '@/components/custom/multiselect-with-search'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRadars } from '@/hooks/useQueries/useRadars'

function buildOptionsFromRadars(
  radars: { cetRioCode: string; location: string | null }[] | undefined,
): Option[] {
  if (!radars?.length) return []
  return radars.map((r) => ({
    value: r.cetRioCode,
    label:
      [r.cetRioCode, r.location].filter(Boolean).join(' — ') || r.cetRioCode,
  }))
}

export function optionsFromLprEquipmentIds(
  ids: string[] | undefined,
  radarOptions: Option[],
): Option[] {
  if (!ids?.length) return []
  const byVal = new Map(radarOptions.map((o) => [o.value, o]))
  return ids.map(
    (id) => byVal.get(id) ?? { value: id, label: `Equipamento ${id}` },
  )
}

/** Indica se `ids` corresponde exatamente ao conjunto de radares disponíveis em `options`. */
export function isFullRadarSelection(
  ids: string[],
  options: Option[],
): boolean {
  if (!options.length || !ids.length) return false
  if (ids.length !== options.length) return false
  const set = new Set(ids)
  return options.every((o) => set.has(o.value))
}

interface DemandantLinkLprMultiSelectProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Ex.: botão para marcar todos os radares da lista carregada. */
  showSelectAllRadars?: boolean
}

export function DemandantLinkLprMultiSelect({
  label = 'Radares LPR (opcional)',
  description = 'Equipamentos de leitura de placa associados a este vínculo. A lista vem dos radares ativos no mapa.',
  value,
  onChange,
  disabled = false,
  showSelectAllRadars = false,
}: DemandantLinkLprMultiSelectProps) {
  const { data: radars, isPending } = useRadars()
  const radarOptions = useMemo(() => buildOptionsFromRadars(radars), [radars])
  const selectedOptions = useMemo(
    () => optionsFromLprEquipmentIds(value, radarOptions),
    [value, radarOptions],
  )

  const allRadarsSelected = useMemo(
    () => isFullRadarSelection(value, radarOptions),
    [value, radarOptions],
  )

  const showCompactAllSummary =
    showSelectAllRadars && allRadarsSelected && radarOptions.length > 0

  function selectAllRadarIds() {
    onChange(radarOptions.map((option) => option.value))
  }

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-foreground">{label}</Label>
      {description ? (
        <p className="text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      ) : null}
      {showCompactAllSummary ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          <p className="text-sm text-foreground">
            Todos os radares selecionados.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={disabled || isPending}
              onClick={() => {
                onChange([])
              }}
            >
              Limpar seleção
            </Button>
          </div>
        </div>
      ) : (
        <>
          {showSelectAllRadars ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-fit text-xs"
              disabled={
                disabled ||
                isPending ||
                radarOptions.length === 0 ||
                allRadarsSelected
              }
              onClick={selectAllRadarIds}
            >
              Selecionar todos os radares
            </Button>
          ) : null}
          <MultipleSelector
            value={selectedOptions}
            onChange={(opts) => onChange(opts.map((o) => o.value))}
            defaultOptions={radarOptions}
            options={radarOptions}
            disabled={disabled || isPending}
            placeholder={
              isPending ? 'Carregando radares…' : 'Busque e selecione radares'
            }
            emptyIndicator={<p>Nenhum radar encontrado.</p>}
            hideClearAllButton={false}
          />
        </>
      )}
    </div>
  )
}
