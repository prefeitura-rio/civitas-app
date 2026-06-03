import type { TicketOut } from '@/http/tickets/get-ticket-by-id'
import {
  normalizeNumeroOficio,
  padDigitsLeft,
  unmaskPlateBR,
} from '@/utils/string-formatters'

import { TICKET_CREATE_STRING_LIMITS as L } from './ticket-create.constant'
import type { TicketCreateForm } from './ticket-create-schema'

function plateToPayload(value?: string | null) {
  const raw = unmaskPlateBR(value ?? '')
  return raw.length ? raw : null
}

function emptyToNull(value?: string | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function numberOrNull(value: string | number | null | undefined) {
  if (value == null || value === '') return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

function toIsoDateTime(value?: string | null) {
  const normalized = emptyToNull(value)
  if (!normalized) return null

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

export function buildTicketCreatePayload(
  data: TicketCreateForm,
): TicketCreateForm {
  return {
    ...data,
    linked_ticket_id: emptyToNull(data.linked_ticket_id),
    procedure_number: emptyToNull(
      padDigitsLeft(data.procedure_number, L.procedure_number),
    ),
    official_letter_number: emptyToNull(
      normalizeNumeroOficio(data.official_letter_number ?? ''),
    ),
    base_date: emptyToNull(data.base_date),
    nature_id: data.nature_id.trim(),
    press_alias: emptyToNull(data.press_alias),
    article_link: emptyToNull(data.article_link),
    correspondence_neighborhood: emptyToNull(data.correspondence_neighborhood),
    correspondence_street: emptyToNull(data.correspondence_street),
    correspondence_number: emptyToNull(data.correspondence_number),
    initial_comment: emptyToNull(data.initial_comment),

    requester: {
      name: data.requester.name.trim(),
      phone: data.requester.phone,
      email: emptyToNull(data.requester.email),
    },

    focal_points: data.focal_points.map((fp) => ({
      name: fp.name.trim(),
      phone: fp.phone ?? '',
      email: emptyToNull(fp.email),
    })),

    plate_search: data.plate_search.map((item) => ({
      plates: (item.plates ?? [])
        .map((p) => plateToPayload(p))
        .filter((p): p is string => p != null),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
    })),

    radar_search: data.radar_search.map((item) => ({
      plates: (item.plates ?? [])
        .map((p) => plateToPayload(p))
        .filter((p): p is string => p != null),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      radar_address: null,
      orientation: emptyToNull(item.orientation),
    })),

    electronic_fence: data.electronic_fence.map((item) => ({
      plates: (item.plates ?? [])
        .map((p) => plateToPayload(p))
        .filter((p): p is string => p != null),
      vehicle_observations: emptyToNull(item.vehicle_observations),
    })),

    image_search: data.image_search.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      addresses: (item.addresses ?? []).map((a) => a.trim()).filter(Boolean),
      description: emptyToNull(item.description),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    correlated_plates: data.correlated_plates.map((group) => ({
      period_start: toIsoDateTime(group.period_start),
      period_end: toIsoDateTime(group.period_end),
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      plates: (group.plates ?? []).map((item) => ({
        plate: plateToPayload(item.plate),
      })),
    })),

    joint_plates: data.joint_plates.map((group) => ({
      period_start: toIsoDateTime(group.period_start),
      period_end: toIsoDateTime(group.period_end),
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      plates: (group.plates ?? []).map((item) => ({
        plate: plateToPayload(item.plate),
      })),
    })),

    image_reservation: data.image_reservation.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
      addresses: (item.addresses ?? []).map((a) => a.trim()).filter(Boolean),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    image_analysis: data.image_analysis.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
      addresses: (item.addresses ?? []).map((a) => a.trim()).filter(Boolean),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    other: data.other.map((item) => ({
      orientation: emptyToNull(item.orientation),
    })),

    atlas_civitas: data.atlas_civitas.map((item) => ({
      name: item.name.trim(),
      email: item.email.trim(),
      cpf: item.cpf.replace(/\D/g, ''),
      registration: item.registration.trim(),
    })),
  }
}

const PHONE_PLACEHOLDER = '  '

function isoToDatetimeLocal(value?: string | null): string | null {
  if (value == null || !String(value).trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function apiDateToDataBaseString(value?: string | null): string | null {
  if (value == null || !String(value).trim()) return null
  const s = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function mapTicketOutToCreateForm(
  ticket: TicketOut,
  options: { linked_ticket_id: string; ticket_type_id: string },
): TicketCreateForm {
  return {
    linked_ticket_id: options.linked_ticket_id,
    ticket_type_id: options.ticket_type_id,
    operation_id: ticket.operation_id ?? '',
    procedure_number: ticket.procedure_number
      ? padDigitsLeft(ticket.procedure_number, L.procedure_number)
      : null,
    official_letter_number: (() => {
      const raw = ticket.official_letter_number?.trim()
      if (!raw) return null
      const normalized = normalizeNumeroOficio(raw)
      return normalized || null
    })(),
    base_date: apiDateToDataBaseString(ticket.base_date),
    nature_id: ticket.nature_id ?? '',
    has_press_alias: ticket.has_press_alias,
    press_alias: ticket.press_alias ?? null,
    article_link: ticket.article_link ?? null,
    has_correspondence_address: false,
    correspondence_neighborhood: null,
    correspondence_street: null,
    correspondence_number: null,
    requester: {
      name: ticket.requester.name,
      phone: ticket.requester.phone?.trim() || PHONE_PLACEHOLDER,
      email: ticket.requester.email ?? null,
    },
    focal_points: (ticket.focal_points ?? []).map((fp) => ({
      name: fp.name,
      phone: fp.phone?.trim() || PHONE_PLACEHOLDER,
      email: fp.email ?? null,
    })),
    team_id: ticket.team_id ?? '',
    priority: ticket.priority ?? null,
    initial_comment: (() => {
      const raw = ticket.comments?.[0]?.body
      if (raw == null) return null
      const t = raw.trim()
      if (!t) return null
      return t.length > L.initial_comment ? t.slice(0, L.initial_comment) : t
    })(),
    plate_search: (ticket.plate_search ?? []).map((s) => ({
      plates: (s.plates ?? []).map((p) => p.plate).filter((p) => p?.trim()),
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
    })),
    radar_search: (ticket.radar_search ?? []).map((s) => ({
      plates: (s.plates ?? []).map((p) => p.plate).filter((p) => p?.trim()),
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
    })),
    electronic_fence: (ticket.electronic_fence ?? []).map((s) => ({
      plates: (s.plates ?? []).map((p) => p.plate).filter((p) => p?.trim()),
      vehicle_observations: s.vehicle_observations ?? null,
    })),
    image_search: (ticket.image_search ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      addresses: (s.addresses ?? []).map((a) => a.address),
      description: s.description ?? null,
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    correlated_plates: (ticket.correlated_plates ?? []).map((g) => ({
      period_start: isoToDatetimeLocal(g.period_start),
      period_end: isoToDatetimeLocal(g.period_end),
      interest_interval_minutes: g.interest_interval_minutes ?? null,
      detection_count: g.detection_count ?? null,
      detection: g.detection ?? null,
      plates: (g.plates ?? []).map((p) => ({ plate: p.plate ?? null })),
    })),
    joint_plates: (ticket.joint_plates ?? []).map((g) => ({
      period_start: isoToDatetimeLocal(g.period_start),
      period_end: isoToDatetimeLocal(g.period_end),
      interest_interval_minutes: g.interest_interval_minutes ?? null,
      detection_count: g.detection_count ?? null,
      detection: g.detection ?? null,
      plates: (g.plates ?? []).map((p) => ({ plate: p.plate ?? null })),
    })),
    image_reservation: (ticket.image_reservation ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
      addresses: (s.addresses ?? []).map((a) => a.address),
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    image_analysis: (ticket.image_analysis ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
      addresses: (s.addresses ?? []).map((a) => a.address),
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    other: (ticket.other ?? []).map((s) => ({
      orientation: s.orientation ?? null,
    })),
    atlas_civitas: (ticket.atlas_civitas ?? []).map((s) => ({
      name: s.name ?? '',
      email: s.email ?? '',
      cpf: s.cpf ?? '',
      registration: s.registration ?? '',
    })),
  }
}
