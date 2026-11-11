import type { ReactNode } from 'react'

import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

export interface FieldContext {
  id: string
  query: GraphQuery
  set: (patch: Partial<GraphQuery>) => void
  options: MasterGraphOptions | null
  activityHelp: string
}

/** Um filtro do trilho: o campo da consulta que ele altera e como é editado. */
export interface FilterFieldDef {
  key: keyof GraphQuery
  id: string
  label: string
  help?: string | ((ctx: FieldContext) => string)
  hidden?: (ctx: FieldContext) => boolean
  render: (ctx: FieldContext) => ReactNode
}
