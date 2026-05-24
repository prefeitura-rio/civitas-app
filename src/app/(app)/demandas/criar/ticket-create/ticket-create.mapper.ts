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
    associar_chamado_id: emptyToNull(data.associar_chamado_id),
    numero_procedimento: emptyToNull(
      padDigitsLeft(data.numero_procedimento, L.numero_procedimento),
    ),
    numero_oficio: emptyToNull(normalizeNumeroOficio(data.numero_oficio ?? '')),
    data_base: emptyToNull(data.data_base),
    natureza_id: data.natureza_id.trim(),
    apelido_imprensa: emptyToNull(data.apelido_imprensa),
    link_materia: emptyToNull(data.link_materia),
    bairro_correspondencia: emptyToNull(data.bairro_correspondencia),
    rua_correspondencia: emptyToNull(data.rua_correspondencia),
    numero_correspondencia: emptyToNull(data.numero_correspondencia),
    comentario_inicial: emptyToNull(data.comentario_inicial),

    requisitante: {
      requisitante_nome: data.requisitante.requisitante_nome.trim(),
      requisitante_telefone: data.requisitante.requisitante_telefone,
      requisitante_email: emptyToNull(data.requisitante.requisitante_email),
    },

    pontos_focais: data.pontos_focais.map((fp) => ({
      nome: fp.nome.trim(),
      telefone: fp.telefone ?? '',
      email: emptyToNull(fp.email),
    })),

    busca_por_placa: data.busca_por_placa.map((item) => ({
      plates: (item.plates ?? [])
        .map((p) => plateToPayload(p))
        .filter((p): p is string => p != null),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
    })),

    busca_por_radar: data.busca_por_radar.map((item) => ({
      plates: (item.plates ?? [])
        .map((p) => plateToPayload(p))
        .filter((p): p is string => p != null),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      radar_address: null,
      orientation: emptyToNull(item.orientation),
    })),

    cerco_eletronico: data.cerco_eletronico.map((item) => ({
      plate: plateToPayload(item.plate),
      vehicle_observations: emptyToNull(item.vehicle_observations),
    })),

    busca_por_imagem: data.busca_por_imagem.map((item) => ({
      plate: plateToPayload(item.plate),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      address: emptyToNull(item.address),
      description: emptyToNull(item.description),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    placas_correlatas: data.placas_correlatas.map((group) => ({
      period_start: toIsoDateTime(group.period_start),
      period_end: toIsoDateTime(group.period_end),
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      plates: (group.plates ?? []).map((item) => ({
        plate: plateToPayload(item.plate),
      })),
    })),

    placas_conjuntas: data.placas_conjuntas.map((group) => ({
      period_start: toIsoDateTime(group.period_start),
      period_end: toIsoDateTime(group.period_end),
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      plates: (group.plates ?? []).map((item) => ({
        plate: plateToPayload(item.plate),
      })),
    })),

    reserva_de_imagem: data.reserva_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    analise_de_imagem: data.analise_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
      cameras: (item.cameras ?? []).map((c) => c.trim()).filter(Boolean),
    })),

    outros: data.outros.map((item) => ({
      orientation: emptyToNull(item.orientation),
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
  options: { associar_chamado_id: string; tipo_chamado_id: string },
): TicketCreateForm {
  return {
    associar_chamado_id: options.associar_chamado_id,
    tipo_chamado_id: options.tipo_chamado_id,
    operation_id: ticket.operation_id ?? '',
    numero_procedimento: ticket.numero_procedimento
      ? padDigitsLeft(ticket.numero_procedimento, L.numero_procedimento)
      : null,
    numero_oficio: (() => {
      const raw = ticket.numero_oficio?.trim()
      if (!raw) return null
      const normalized = normalizeNumeroOficio(raw)
      return normalized || null
    })(),
    data_base: apiDateToDataBaseString(ticket.data_base),
    natureza_id: ticket.natureza_id ?? '',
    possui_apelido_imprensa: ticket.possui_apelido_imprensa,
    apelido_imprensa: ticket.apelido_imprensa ?? null,
    link_materia: ticket.link_materia ?? null,
    possui_endereco_correspondencia: false,
    bairro_correspondencia: null,
    rua_correspondencia: null,
    numero_correspondencia: null,
    requisitante: {
      requisitante_nome: ticket.requisitante.requisitante_nome,
      requisitante_telefone:
        ticket.requisitante.requisitante_telefone?.trim() || PHONE_PLACEHOLDER,
      requisitante_email: ticket.requisitante.requisitante_email ?? null,
    },
    pontos_focais: (ticket.pontos_focais ?? []).map((fp) => ({
      nome: fp.nome,
      telefone: fp.telefone?.trim() || PHONE_PLACEHOLDER,
      email: fp.email ?? null,
    })),
    equipe_id: ticket.equipe_id ?? '',
    prioridade: ticket.prioridade ?? null,
    comentario_inicial: (() => {
      const raw = ticket.comentarios?.[0]?.body
      if (raw == null) return null
      const t = raw.trim()
      if (!t) return null
      return t.length > L.comentario_inicial
        ? t.slice(0, L.comentario_inicial)
        : t
    })(),
    busca_por_placa: (ticket.busca_por_placa ?? []).map((s) => ({
      plates: (s.plates ?? []).map((p) => p.plate).filter((p) => p?.trim()),
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
    })),
    busca_por_radar: (ticket.busca_por_radar ?? []).map((s) => ({
      plates: (s.plates ?? []).map((p) => p.plate).filter((p) => p?.trim()),
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
    })),
    cerco_eletronico: (ticket.cerco_eletronico ?? []).map((s) => ({
      plate: s.plate ?? null,
      vehicle_observations: s.vehicle_observations ?? null,
    })),
    busca_por_imagem: (ticket.busca_por_imagem ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      plate: s.plate ?? null,
      address: s.address ?? null,
      description: s.description ?? null,
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    placas_correlatas: (ticket.placas_correlatas ?? []).map((g) => ({
      period_start: isoToDatetimeLocal(g.period_start),
      period_end: isoToDatetimeLocal(g.period_end),
      interest_interval_minutes: g.interest_interval_minutes ?? null,
      detection_count: g.detection_count ?? null,
      detection: g.detection ?? null,
      plates: (g.plates ?? []).map((p) => ({ plate: p.plate ?? null })),
    })),
    placas_conjuntas: (ticket.placas_conjuntas ?? []).map((g) => ({
      period_start: isoToDatetimeLocal(g.period_start),
      period_end: isoToDatetimeLocal(g.period_end),
      interest_interval_minutes: g.interest_interval_minutes ?? null,
      detection_count: g.detection_count ?? null,
      detection: g.detection ?? null,
      plates: (g.plates ?? []).map((p) => ({ plate: p.plate ?? null })),
    })),
    reserva_de_imagem: (ticket.reserva_de_imagem ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    analise_de_imagem: (ticket.analise_de_imagem ?? []).map((s) => ({
      period_start: isoToDatetimeLocal(s.period_start),
      period_end: isoToDatetimeLocal(s.period_end),
      orientation: s.orientation ?? null,
      cameras: (s.cameras ?? []).map((c) => c.camera_code),
    })),
    outros: (ticket.outros ?? []).map((s) => ({
      orientation: s.orientation ?? null,
    })),
  }
}
