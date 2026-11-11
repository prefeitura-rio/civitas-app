import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { TypicalHour } from '@/modules/vehicle-intelligence/types/domain'

const shiftShort: Record<string, string> = {
  madrugada: 'madrugada',
  manha: 'manhã',
  tarde: 'tarde',
  noite: 'noite',
}

/** Hora típica com a ressalva de dispersão embutida.
 *
 * Quando a concentração é baixa os horários estão espalhados pelo dia, e
 * mostrar "~14h" ali seria inventar uma rotina que os dados não sustentam.
 */
export function TypicalHourLabel({
  value,
  verb,
}: {
  value?: TypicalHour
  verb: string
}) {
  if (!value?.label)
    return (
      <span className="profile-hour-chip muted">
        {verb} em horário não estimável
      </span>
    )
  if (!value.reliable) {
    return (
      <span
        className="profile-hour-chip muted"
        title={`Concentração ${formatNumber(value.concentration)} — horários dispersos ao longo do dia`}
      >
        {verb} em horário disperso
      </span>
    )
  }
  return (
    <span
      className={`profile-hour-chip ${value.shift}`}
      title={`Concentração ${formatNumber(value.concentration)} (1 = sempre no mesmo horário)`}
    >
      {verb} ~{value.label}
      {value.shift && <em>{shiftShort[value.shift]}</em>}
    </span>
  )
}

export function typicalHourBadge(value?: TypicalHour): string {
  return value?.reliable && value.label ? `~${value.label}` : 'sem padrão'
}
