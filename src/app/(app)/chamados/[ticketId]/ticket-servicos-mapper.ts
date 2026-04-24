import type { OpenServiceKey } from '@/app/(app)/chamados/criar/ticket-create/ticket-create.constant'
import type { TicketAttachmentOut } from '@/http/tickets/ticket-attachments'
import {
  normalizeTicketServicosOut,
  type TicketServicosOut,
} from '@/http/tickets/ticket-servicos'
import type { TicketServicosReplaceIn } from '@/http/tickets/ticket-servicos-types'

const SERVICO_ROW_KEYS = [
  'busca_por_placa',
  'busca_por_radar',
  'cerco_eletronico',
  'busca_por_imagem',
  'placas_correlatas',
  'placas_conjuntas',
  'reserva_de_imagem',
  'analise_de_imagem',
  'outros',
] as const satisfies readonly Exclude<OpenServiceKey, null>[]

/** Mantém rascunho do utilizador e atualiza só `anexos_gerais` e `anexos` por serviço após refetch. */
export function mergeServicosAnexosFromServer(
  draft: TicketServicosOut,
  server: TicketServicosOut,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  next.anexos_gerais = [...server.anexos_gerais]

  for (const kind of SERVICO_ROW_KEYS) {
    const draftRows = next[kind] as {
      id: string
      anexos?: TicketAttachmentOut[]
    }[]
    const serverRows = server[kind] as {
      id: string
      anexos?: TicketAttachmentOut[]
    }[]
    for (let i = 0; i < draftRows.length; i++) {
      const row = draftRows[i]
      if (!row) continue
      const match = serverRows.find((s) => s.id === row.id)
      if (match) {
        draftRows[i] = {
          ...row,
          anexos: match.anexos !== undefined ? [...match.anexos] : row.anexos,
        }
      }
    }
  }
  return next
}

/** Id de serviço novo (ainda não persistido): não enviar `id` no PUT — a API cria. */
export function newLocalServiceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `local-${crypto.randomUUID()}`
  }
  return `local-tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function isLocalDraftServiceId(id: string | undefined): boolean {
  return id == null || id === '' || id.startsWith('local-')
}

export function newNestedEntityId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function nowIso() {
  return new Date().toISOString()
}

function ensureAtLeastOnePlateRow<
  T extends {
    plates?: { id?: string; created_at?: string; plate?: string | null }[]
  },
>(rows: T[]): T[] {
  return rows.map((row) => {
    const plates = row.plates ?? []
    if (plates.length > 0) return row
    return {
      ...row,
      plates: [{ id: newNestedEntityId(), created_at: nowIso(), plate: '' }],
    }
  })
}

function normalizeServicosForDraft(s: TicketServicosOut): TicketServicosOut {
  return {
    ...s,
    busca_por_placa: ensureAtLeastOnePlateRow(s.busca_por_placa),
    busca_por_radar: ensureAtLeastOnePlateRow(s.busca_por_radar),
    placas_correlatas: ensureAtLeastOnePlateRow(s.placas_correlatas),
    placas_conjuntas: ensureAtLeastOnePlateRow(s.placas_conjuntas),
  }
}

export function cloneTicketServicos(s: TicketServicosOut): TicketServicosOut {
  try {
    return normalizeServicosForDraft(structuredClone(s))
  } catch {
    return normalizeServicosForDraft(
      JSON.parse(JSON.stringify(s)) as TicketServicosOut,
    )
  }
}

export function ticketServicosToReplacePayload(
  s: TicketServicosOut,
): TicketServicosReplaceIn {
  const n = normalizeTicketServicosOut(s)
  const strOrNull = (v: string | null | undefined) => {
    if (v == null) return null
    const t = String(v).trim()
    return t.length ? t : null
  }

  const persistedId = (id: string | undefined) =>
    isLocalDraftServiceId(id) ? {} : { id: id as string }

  return {
    busca_por_placa: n.busca_por_placa.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      plates: (x.plates ?? [])
        .map((p) => (p.plate ?? '').trim())
        .filter(Boolean),
    })),
    busca_por_radar: n.busca_por_radar.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      plates: (x.plates ?? [])
        .map((p) => (p.plate ?? '').trim())
        .filter(Boolean),
      radar_address: strOrNull(x.radar_address),
      orientation: strOrNull(x.orientation),
    })),
    cerco_eletronico: n.cerco_eletronico.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      plate: strOrNull(x.plate),
      vehicle_observations: strOrNull(x.vehicle_observations),
    })),
    busca_por_imagem: n.busca_por_imagem.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      plate: strOrNull(x.plate),
      address: strOrNull(x.address),
      description: strOrNull(x.description),
    })),
    placas_correlatas: n.placas_correlatas.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      interest_interval_minutes: x.interest_interval_minutes ?? null,
      detection_count: x.detection_count ?? null,
      detection: x.detection ?? null,
      plates: (x.plates ?? []).map((p) => ({
        plate: strOrNull(p.plate),
      })),
    })),
    placas_conjuntas: n.placas_conjuntas.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      interest_interval_minutes: x.interest_interval_minutes ?? null,
      detection_count: x.detection_count ?? null,
      detection: x.detection ?? null,
      plates: (x.plates ?? []).map((p) => ({
        plate: strOrNull(p.plate),
      })),
    })),
    reserva_de_imagem: n.reserva_de_imagem.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      orientation: strOrNull(x.orientation),
    })),
    analise_de_imagem: n.analise_de_imagem.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      orientation: strOrNull(x.orientation),
    })),
    outros: n.outros.map((x) => ({
      ...persistedId(x.id),
      concluido: Boolean(x.concluido),
      orientation: strOrNull(x.orientation),
    })),
  }
}

export function payloadsEqual(
  a: TicketServicosReplaceIn,
  b: TicketServicosReplaceIn,
) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function setServiceConcluido(
  draft: TicketServicosOut,
  kind: OpenServiceKey,
  index: number,
  concluido: boolean,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  switch (kind) {
    case 'busca_por_placa': {
      const row = next.busca_por_placa[index]
      if (row) next.busca_por_placa[index] = { ...row, concluido }
      break
    }
    case 'busca_por_radar': {
      const row = next.busca_por_radar[index]
      if (row) next.busca_por_radar[index] = { ...row, concluido }
      break
    }
    case 'cerco_eletronico': {
      const row = next.cerco_eletronico[index]
      if (row) next.cerco_eletronico[index] = { ...row, concluido }
      break
    }
    case 'busca_por_imagem': {
      const row = next.busca_por_imagem[index]
      if (row) next.busca_por_imagem[index] = { ...row, concluido }
      break
    }
    case 'placas_correlatas': {
      const row = next.placas_correlatas[index]
      if (row) next.placas_correlatas[index] = { ...row, concluido }
      break
    }
    case 'placas_conjuntas': {
      const row = next.placas_conjuntas[index]
      if (row) next.placas_conjuntas[index] = { ...row, concluido }
      break
    }
    case 'reserva_de_imagem': {
      const row = next.reserva_de_imagem[index]
      if (row) next.reserva_de_imagem[index] = { ...row, concluido }
      break
    }
    case 'analise_de_imagem': {
      const row = next.analise_de_imagem[index]
      if (row) next.analise_de_imagem[index] = { ...row, concluido }
      break
    }
    case 'outros': {
      const row = next.outros[index]
      if (row) next.outros[index] = { ...row, concluido }
      break
    }
    default:
      break
  }
  return next
}

export function appendEmptyService(
  draft: TicketServicosOut,
  kind: OpenServiceKey,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  const id = newLocalServiceId()
  const created = nowIso()

  switch (kind) {
    case 'busca_por_placa':
      next.busca_por_placa = [
        ...next.busca_por_placa,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'busca_por_radar':
      next.busca_por_radar = [
        ...next.busca_por_radar,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
          radar_address: null,
          orientation: null,
        },
      ]
      break
    case 'cerco_eletronico':
      next.cerco_eletronico = [
        ...next.cerco_eletronico,
        {
          id,
          created_at: created,
          concluido: false,
          plate: null,
          vehicle_observations: null,
        },
      ]
      break
    case 'busca_por_imagem':
      next.busca_por_imagem = [
        ...next.busca_por_imagem,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          plate: null,
          address: null,
          description: null,
        },
      ]
      break
    case 'placas_correlatas':
      next.placas_correlatas = [
        ...next.placas_correlatas,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          interest_interval_minutes: 1,
          detection_count: 10,
          detection: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'placas_conjuntas':
      next.placas_conjuntas = [
        ...next.placas_conjuntas,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          interest_interval_minutes: 1,
          detection_count: 10,
          detection: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'reserva_de_imagem':
      next.reserva_de_imagem = [
        ...next.reserva_de_imagem,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          orientation: null,
        },
      ]
      break
    case 'analise_de_imagem':
      next.analise_de_imagem = [
        ...next.analise_de_imagem,
        {
          id,
          created_at: created,
          concluido: false,
          period_start: null,
          period_end: null,
          orientation: null,
        },
      ]
      break
    case 'outros':
      next.outros = [
        ...next.outros,
        {
          id,
          created_at: created,
          concluido: false,
          orientation: null,
        },
      ]
      break
    default:
      break
  }

  return next
}

export function removeServiceAt(
  draft: TicketServicosOut,
  kind: OpenServiceKey,
  index: number,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  switch (kind) {
    case 'busca_por_placa':
      next.busca_por_placa = next.busca_por_placa.filter((_, i) => i !== index)
      break
    case 'busca_por_radar':
      next.busca_por_radar = next.busca_por_radar.filter((_, i) => i !== index)
      break
    case 'cerco_eletronico':
      next.cerco_eletronico = next.cerco_eletronico.filter(
        (_, i) => i !== index,
      )
      break
    case 'busca_por_imagem':
      next.busca_por_imagem = next.busca_por_imagem.filter(
        (_, i) => i !== index,
      )
      break
    case 'placas_correlatas':
      next.placas_correlatas = next.placas_correlatas.filter(
        (_, i) => i !== index,
      )
      break
    case 'placas_conjuntas':
      next.placas_conjuntas = next.placas_conjuntas.filter(
        (_, i) => i !== index,
      )
      break
    case 'reserva_de_imagem':
      next.reserva_de_imagem = next.reserva_de_imagem.filter(
        (_, i) => i !== index,
      )
      break
    case 'analise_de_imagem':
      next.analise_de_imagem = next.analise_de_imagem.filter(
        (_, i) => i !== index,
      )
      break
    case 'outros':
      next.outros = next.outros.filter((_, i) => i !== index)
      break
    default:
      break
  }
  return next
}

/** Converte periodo ISO em YYYY-MM-DD para FilterDateRangeField */
export function isoToDateInput(iso: string | null | undefined): string {
  if (iso == null || iso === '') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Define início do dia local como ISO a partir de YYYY-MM-DD */
export function dateInputToIsoStart(dateYmd: string): string | null {
  if (!dateYmd?.trim()) return null
  const d = new Date(`${dateYmd.trim()}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** ISO → valor de `<input type="datetime-local">` (hora local). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (iso == null || iso === '') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Valor de `datetime-local` → ISO UTC (ou `null` se vazio / inválido). */
export function datetimeLocalToIso(local: string): string | null {
  if (!local?.trim()) return null
  const d = new Date(local.trim())
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}
