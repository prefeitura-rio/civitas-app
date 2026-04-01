'use client'

import { useMemo } from 'react'

import type { Option } from '@/components/custom/multiselect-with-search'
import MultipleSelector from '@/components/custom/multiselect-with-search'
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

interface DemandantLinkLprMultiSelectProps {
  label?: string
  description?: string
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function DemandantLinkLprMultiSelect({
  label = 'Radares LPR (opcional)',
  description = 'Equipamentos de leitura de placa associados a este vínculo. A lista vem dos radares ativos no mapa.',
  value,
  onChange,
  disabled = false,
}: DemandantLinkLprMultiSelectProps) {
  const { data: radars, isPending } = useRadars()
  const radarOptions = useMemo(() => buildOptionsFromRadars(radars), [radars])
  const selectedOptions = useMemo(
    () => optionsFromLprEquipmentIds(value, radarOptions),
    [value, radarOptions],
  )

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-foreground">{label}</Label>
      {description ? (
        <p className="text-xs leading-snug text-muted-foreground">
          {description}
        </p>
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
    </div>
  )
}
