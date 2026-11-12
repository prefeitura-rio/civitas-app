import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function FilterField({
  id,
  label,
  help,
  pending,
  children,
}: {
  id: string
  label: string
  help?: string
  pending: boolean
  children: ReactNode
}) {
  return (
    <div className="graph-filter-field">
      <div className="graph-filter-label">
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
        {pending && (
          <span
            className="graph-filter-pending"
            title="Alterado, ainda não aplicado"
            aria-label="Alterado, ainda não aplicado"
          />
        )}
        {help && (
          <span className="graph-filter-help">
            <button
              type="button"
              aria-label={`Ajuda: ${label}`}
              aria-describedby={`${id}-help`}
            >
              <Info size={13} />
            </button>
            <span id={`${id}-help`} role="tooltip">
              {help}
            </span>
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
