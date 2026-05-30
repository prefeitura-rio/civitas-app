import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import type { TicketAttachmentOut } from '@/http/tickets/ticket-attachments'
import {
  normalizeTicketServicosOut,
  type TicketServicosOut,
} from '@/http/tickets/ticket-servicos'
import type { TicketServicosReplaceIn } from '@/http/tickets/ticket-servicos-types'

const SERVICO_ROW_KEYS = [
  'plate_search',
  'radar_search',
  'electronic_fence',
  'image_search',
  'correlated_plates',
  'joint_plates',
  'image_reservation',
  'image_analysis',
  'other',
  'atlas_civitas',
] as const satisfies readonly Exclude<OpenServiceKey, null>[]

/** Mantém rascunho do utilizador e atualiza só `general_attachments` e `attachments` por serviço após refetch. */
export function mergeServicosAnexosFromServer(
  draft: TicketServicosOut,
  server: TicketServicosOut,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  next.general_attachments = [...server.general_attachments]

  for (const kind of SERVICO_ROW_KEYS) {
    const draftRows = next[kind] as {
      id: string
      attachments?: TicketAttachmentOut[]
    }[]
    const serverRows = server[kind] as {
      id: string
      attachments?: TicketAttachmentOut[]
    }[]
    for (let i = 0; i < draftRows.length; i++) {
      const row = draftRows[i]
      if (!row) continue
      const match = serverRows.find((s) => s.id === row.id)
      if (match) {
        draftRows[i] = {
          ...row,
          attachments:
            match.attachments !== undefined
              ? [...match.attachments]
              : row.attachments,
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
    plate_search: ensureAtLeastOnePlateRow(s.plate_search),
    radar_search: ensureAtLeastOnePlateRow(s.radar_search),
    correlated_plates: ensureAtLeastOnePlateRow(s.correlated_plates),
    joint_plates: ensureAtLeastOnePlateRow(s.joint_plates),
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
    plate_search: n.plate_search.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      plates: (x.plates ?? [])
        .map((p) => (p.plate ?? '').trim())
        .filter(Boolean),
    })),
    radar_search: n.radar_search.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      plates: (x.plates ?? [])
        .map((p) => (p.plate ?? '').trim())
        .filter(Boolean),
      radar_address: strOrNull(x.radar_address),
      orientation: strOrNull(x.orientation),
    })),
    electronic_fence: n.electronic_fence.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      plates: (x.plates ?? [])
        .map((p) => (p.plate ?? '').trim())
        .filter(Boolean),
      vehicle_observations: strOrNull(x.vehicle_observations),
    })),
    image_search: n.image_search.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      addresses: (x.addresses ?? [])
        .map((a) => a.address.trim())
        .filter(Boolean),
      description: strOrNull(x.description),
      cameras: (x.cameras ?? [])
        .map((c) => c.camera_code.trim())
        .filter(Boolean),
    })),
    correlated_plates: n.correlated_plates.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      interest_interval_minutes: x.interest_interval_minutes ?? null,
      detection_count: x.detection_count ?? null,
      detection: x.detection ?? null,
      plates: (x.plates ?? []).map((p) => ({
        plate: strOrNull(p.plate),
      })),
    })),
    joint_plates: n.joint_plates.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      interest_interval_minutes: x.interest_interval_minutes ?? null,
      detection_count: x.detection_count ?? null,
      detection: x.detection ?? null,
      plates: (x.plates ?? []).map((p) => ({
        plate: strOrNull(p.plate),
      })),
    })),
    image_reservation: n.image_reservation.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      orientation: strOrNull(x.orientation),
      addresses: (x.addresses ?? [])
        .map((a) => a.address.trim())
        .filter(Boolean),
      cameras: (x.cameras ?? [])
        .map((c) => c.camera_code.trim())
        .filter(Boolean),
    })),
    image_analysis: n.image_analysis.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      period_start: strOrNull(x.period_start as string | null | undefined),
      period_end: strOrNull(x.period_end as string | null | undefined),
      orientation: strOrNull(x.orientation),
      addresses: (x.addresses ?? [])
        .map((a) => a.address.trim())
        .filter(Boolean),
      cameras: (x.cameras ?? [])
        .map((c) => c.camera_code.trim())
        .filter(Boolean),
    })),
    other: n.other.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      orientation: strOrNull(x.orientation),
    })),
    atlas_civitas: n.atlas_civitas.map((x) => ({
      ...persistedId(x.id),
      completed: Boolean(x.completed),
      name: strOrNull(x.name),
      email: strOrNull(x.email),
      cpf: (() => {
        if (x.cpf == null) return null
        const d = String(x.cpf).replace(/\D/g, '')
        return d.length ? d : null
      })(),
      registration: strOrNull(x.registration),
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
  completed: boolean,
): TicketServicosOut {
  const next = cloneTicketServicos(draft)
  switch (kind) {
    case 'plate_search': {
      const row = next.plate_search[index]
      if (row) next.plate_search[index] = { ...row, completed }
      break
    }
    case 'radar_search': {
      const row = next.radar_search[index]
      if (row) next.radar_search[index] = { ...row, completed }
      break
    }
    case 'electronic_fence': {
      const row = next.electronic_fence[index]
      if (row) next.electronic_fence[index] = { ...row, completed }
      break
    }
    case 'image_search': {
      const row = next.image_search[index]
      if (row) next.image_search[index] = { ...row, completed }
      break
    }
    case 'correlated_plates': {
      const row = next.correlated_plates[index]
      if (row) next.correlated_plates[index] = { ...row, completed }
      break
    }
    case 'joint_plates': {
      const row = next.joint_plates[index]
      if (row) next.joint_plates[index] = { ...row, completed }
      break
    }
    case 'image_reservation': {
      const row = next.image_reservation[index]
      if (row) next.image_reservation[index] = { ...row, completed }
      break
    }
    case 'image_analysis': {
      const row = next.image_analysis[index]
      if (row) next.image_analysis[index] = { ...row, completed }
      break
    }
    case 'other': {
      const row = next.other[index]
      if (row) next.other[index] = { ...row, completed }
      break
    }
    case 'atlas_civitas': {
      const row = next.atlas_civitas[index]
      if (row) next.atlas_civitas[index] = { ...row, completed }
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
    case 'plate_search':
      next.plate_search = [
        ...next.plate_search,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'radar_search':
      next.radar_search = [
        ...next.radar_search,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
          radar_address: null,
          orientation: null,
        },
      ]
      break
    case 'electronic_fence':
      next.electronic_fence = [
        ...next.electronic_fence,
        {
          id,
          created_at: created,
          completed: false,
          plates: [],
          vehicle_observations: null,
        },
      ]
      break
    case 'image_search':
      next.image_search = [
        ...next.image_search,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          addresses: [],
          description: null,
          cameras: [],
        },
      ]
      break
    case 'correlated_plates':
      next.correlated_plates = [
        ...next.correlated_plates,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          interest_interval_minutes: 1,
          detection_count: 10,
          detection: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'joint_plates':
      next.joint_plates = [
        ...next.joint_plates,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          interest_interval_minutes: 1,
          detection_count: 10,
          detection: null,
          plates: [{ id: newNestedEntityId(), created_at: created, plate: '' }],
        },
      ]
      break
    case 'image_reservation':
      next.image_reservation = [
        ...next.image_reservation,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          orientation: null,
          addresses: [],
          cameras: [],
        },
      ]
      break
    case 'image_analysis':
      next.image_analysis = [
        ...next.image_analysis,
        {
          id,
          created_at: created,
          completed: false,
          period_start: null,
          period_end: null,
          orientation: null,
          addresses: [],
          cameras: [],
        },
      ]
      break
    case 'other':
      next.other = [
        ...next.other,
        {
          id,
          created_at: created,
          completed: false,
          orientation: null,
        },
      ]
      break
    case 'atlas_civitas':
      next.atlas_civitas = [
        ...next.atlas_civitas,
        {
          id,
          created_at: created,
          completed: false,
          name: null,
          email: null,
          cpf: null,
          registration: null,
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
    case 'plate_search':
      next.plate_search = next.plate_search.filter((_, i) => i !== index)
      break
    case 'radar_search':
      next.radar_search = next.radar_search.filter((_, i) => i !== index)
      break
    case 'electronic_fence':
      next.electronic_fence = next.electronic_fence.filter(
        (_, i) => i !== index,
      )
      break
    case 'image_search':
      next.image_search = next.image_search.filter((_, i) => i !== index)
      break
    case 'correlated_plates':
      next.correlated_plates = next.correlated_plates.filter(
        (_, i) => i !== index,
      )
      break
    case 'joint_plates':
      next.joint_plates = next.joint_plates.filter((_, i) => i !== index)
      break
    case 'image_reservation':
      next.image_reservation = next.image_reservation.filter(
        (_, i) => i !== index,
      )
      break
    case 'image_analysis':
      next.image_analysis = next.image_analysis.filter((_, i) => i !== index)
      break
    case 'other':
      next.other = next.other.filter((_, i) => i !== index)
      break
    case 'atlas_civitas':
      next.atlas_civitas = next.atlas_civitas.filter((_, i) => i !== index)
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
