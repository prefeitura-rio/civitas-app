import { format } from 'date-fns'

import type { DemandVolumeTicketItemOut } from '@/http/tickets/get-demand-volume'

type FlatRow = Record<string, string | number | boolean>

function escapeCsvCell(value: string | number | boolean): string {
  const text = String(value)
  const needsQuotes = /[",\n\r]/.test(text)
  const escaped = text.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function csvRow(cells: (string | number | boolean)[]): string {
  return cells.map(escapeCsvCell).join(',')
}

function toCsvScalar(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return ''
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  return String(value)
}

function flattenTicketItem(item: DemandVolumeTicketItemOut): FlatRow {
  const row: FlatRow = {}

  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) {
      row[key] = ''
      continue
    }

    if (typeof value === 'object') {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        const column = `${key}.${nestedKey}`
        row[column] = toCsvScalar(nestedValue)
      }
      continue
    }

    row[key] = value
  }

  return row
}

function resolveColumns(rows: FlatRow[]): string[] {
  const ordered: string[] = []
  const seen = new Set<string>()

  const addKeys = (keys: string[]) => {
    for (const key of keys) {
      if (!seen.has(key)) {
        seen.add(key)
        ordered.push(key)
      }
    }
  }

  if (rows[0]) addKeys(Object.keys(rows[0]))
  for (const row of rows) addKeys(Object.keys(row))

  return ordered
}

export function buildDemandVolumeTicketsCsv(
  items: DemandVolumeTicketItemOut[],
): string {
  if (items.length === 0) return '\uFEFF'

  const rows = items.map(flattenTicketItem)
  const columns = resolveColumns(rows)
  const header = csvRow(columns)
  const body = rows
    .map((row) => csvRow(columns.map((col) => row[col] ?? '')))
    .join('\r\n')

  return `\uFEFF${header}\r\n${body}`
}

export function demandVolumeTicketsExportFilename(
  exportedAt = new Date(),
): string {
  const stamp = format(exportedAt, 'yyyy-MM-dd')
  return `dashboard-tatico-volume-chamados-${stamp}.csv`
}
