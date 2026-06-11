'use client'

import type { CSSProperties } from 'react'

const BASE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#97a2ab',
  fontSize: '14px',
}

interface DashboardTaticoDataStateProps {
  isLoading: boolean
  isEmpty: boolean
  height?: number
}

export function DashboardTaticoDataState({
  isLoading,
  isEmpty,
  height = 280,
}: DashboardTaticoDataStateProps) {
  if (!isEmpty) return null

  return (
    <div style={{ ...BASE_STYLE, height: `${height}px` }}>
      {isLoading ? 'Carregando…' : 'Nenhum Registro Localizado'}
    </div>
  )
}
