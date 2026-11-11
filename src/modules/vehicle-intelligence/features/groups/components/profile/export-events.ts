import type {
  GroupEvent,
  GroupProfileData,
} from '@/modules/vehicle-intelligence/types/groups'

/** Os ROs do grupo em CSV: separado por ponto e vírgula, cada valor entre aspas, linhas com CRLF (sem a última). */
export function groupEventsCsv(events: GroupEvent[]): string {
  const header = [
    'ro',
    'data_hora',
    'cisp',
    'modalidade',
    'alvo',
    'endereco',
    'placas',
    'passaram_juntas',
    'desconectaram_juntas',
  ]
  const rows = events.map((e) => [
    e.event_id,
    e.occurred_at,
    e.cisp ?? '',
    e.modality ?? '',
    e.category ?? '',
    e.address ?? '',
    e.plates.join('|'),
    e.pairs
      .filter((p) => p.together)
      .map((p) => `${p.a}+${p.b}`)
      .join('|'),
    e.pairs
      .filter((p) => p.disconnected)
      .map((p) => `${p.a}+${p.b}`)
      .join('|'),
  ])
  return [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'),
    )
    .join('\r\n')
}

/** Baixa os ROs do grupo em CSV (com BOM, para o Excel abrir em UTF-8). */
export function exportEvents(data: GroupProfileData) {
  const csv = groupEventsCsv(data.events)
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}\r\n`], { type: 'text/csv;charset=utf-8' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `grupo-${data.members.map((m) => m.plate).join('-')}.csv`
  document.body.append(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
