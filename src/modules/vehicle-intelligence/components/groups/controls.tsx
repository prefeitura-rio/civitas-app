/** Controles das telas de grupos e territórios: o interruptor e o seletor de segmentos com contagem. */
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** Interruptor (trilho ciano quando ligado), como o de "Só com placa do Cerco ou citada". */
export function Toggle({
  checked,
  onChange,
  children,
  small = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: string
  small?: boolean
}) {
  return (
    <label className={`group-switch${small ? ' small' : ''}`}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
      {children}
    </label>
  )
}

/** Uma opção do seletor de segmentos, com a contagem opcional. */
export type SegmentOption<T extends string> = {
  value: T
  label: string
  n?: number
}

/** Seletor de segmentos com a contagem ao lado de cada opção (filtro das motos de base, abas de Começos e fins). */
export function Segments<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<SegmentOption<T>>
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="group-segments count" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'active' : undefined}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.n != null && <span>{formatNumber(option.n)}</span>}
        </button>
      ))}
    </div>
  )
}
