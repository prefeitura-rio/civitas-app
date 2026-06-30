'use client'

import { Info } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { Tooltip } from '@/components/custom/tooltip'

interface DashboardTaticoSectionTitleProps {
  children: ReactNode
  tooltip?: string
  /** Padrão 20px; use 0 dentro de `.chartHeaderRow`. */
  marginBottom?: number
}

const TITLE_STYLE: CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#f9fafa',
  margin: 0,
}

export function DashboardTaticoSectionTitle({
  children,
  tooltip,
  marginBottom = 20,
}: DashboardTaticoSectionTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom,
      }}
    >
      <h2 style={TITLE_STYLE}>{children}</h2>
      {tooltip ? (
        <Tooltip asChild text={tooltip} side="top">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#97a2ab',
              cursor: 'help',
            }}
            aria-label="Mais informações"
          >
            <Info size={16} aria-hidden />
          </span>
        </Tooltip>
      ) : null}
    </div>
  )
}
