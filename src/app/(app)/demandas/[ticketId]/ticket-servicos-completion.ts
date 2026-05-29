import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import type { TicketServicosOut } from '@/http/tickets/ticket-servicos'
import { unmaskPlateBR } from '@/utils/string-formatters'
import { validateCPF } from '@/utils/validate-cpf'

type TicketServiceRowKind = Exclude<OpenServiceKey, null>

/** Mesma mensagem usada em `ticket-create-schema` / modais de serviço. */
export const SERVICO_CAMPO_OBRIGATORIO = 'Campo obrigatório'

const MSG_INTERVALO_INTERESSE =
  'Use um valor entre 1 e 5 (intervalo de interesse).'
const MSG_QUANTIDADE_DETECCAO =
  'Use um valor entre 5 e 50 (quantidade de detecção).'
const MSG_PLACA_INCOMPLETA = 'Informe a placa completa (7 caracteres).'

function filledText(s: string | null | undefined): boolean {
  return s != null && String(s).trim().length > 0
}

/** API pode devolver número como string; normaliza para validação. */
function parseCorrelataInt(value: unknown): number | null {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return Math.trunc(value)
  }
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return null
    const n = Number.parseInt(t, 10)
    return Number.isNaN(n) ? null : n
  }
  return null
}

function correlataIntervalMessage(value: unknown): string | null {
  const v = parseCorrelataInt(value)
  if (v == null) return SERVICO_CAMPO_OBRIGATORIO
  if (v < 1 || v > 5) return MSG_INTERVALO_INTERESSE
  return null
}

function correlataDetectionCountMessage(value: unknown): string | null {
  const v = parseCorrelataInt(value)
  if (v == null) return SERVICO_CAMPO_OBRIGATORIO
  if (v < 5 || v > 50) return MSG_QUANTIDADE_DETECCAO
  return null
}

function plateCompletionMessage(s: string | null | undefined): string | null {
  const raw = unmaskPlateBR(s ?? '')
  if (raw.length === 0) return SERVICO_CAMPO_OBRIGATORIO
  if (raw.length < 7) return MSG_PLACA_INCOMPLETA
  return null
}

/**
 * Erros de preenchimento quando o serviço está marcado como concluído.
 * Chaves alinhadas ao que `ServicosExpandedForm` exibe (ex.: `plates.0.plate`).
 */
export function completionErrorsForServiceRow(
  draft: TicketServicosOut,
  kind: TicketServiceRowKind,
  index: number,
): Record<string, string> {
  const out: Record<string, string> = {}

  switch (kind) {
    case 'busca_por_placa': {
      const item = draft.busca_por_placa[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      ;(item.plates ?? []).forEach((p, i) => {
        const msg = plateCompletionMessage(p.plate)
        if (msg) out[`plates.${i}.plate`] = msg
      })
      return out
    }
    case 'busca_por_radar': {
      const item = draft.busca_por_radar[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.orientation)) {
        out.orientation = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.radar_address)) {
        out.radar_address = SERVICO_CAMPO_OBRIGATORIO
      }
      ;(item.plates ?? []).forEach((p, i) => {
        const msg = plateCompletionMessage(p.plate)
        if (msg) out[`plates.${i}.plate`] = msg
      })
      return out
    }
    case 'cerco_eletronico': {
      const item = draft.cerco_eletronico[index]
      if (!item?.concluido) return out
      {
        const msg = plateCompletionMessage(item.plate)
        if (msg) out.plate = msg
      }
      if (!filledText(item.vehicle_observations)) {
        out.vehicle_observations = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    case 'busca_por_imagem': {
      const item = draft.busca_por_imagem[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.description)) {
        out.description = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    case 'placas_correlatas': {
      const item = draft.placas_correlatas[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      {
        const msg = correlataIntervalMessage(item.interest_interval_minutes)
        if (msg) out.interest_interval_minutes = msg
      }
      {
        const msg = correlataDetectionCountMessage(item.detection_count)
        if (msg) out.detection_count = msg
      }
      if (item.detection == null) {
        out.detection = SERVICO_CAMPO_OBRIGATORIO
      }
      ;(item.plates ?? []).forEach((p, i) => {
        const msg = plateCompletionMessage(p.plate)
        if (msg) out[`plates.${i}.plate`] = msg
      })
      return out
    }
    case 'placas_conjuntas': {
      const item = draft.placas_conjuntas[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      {
        const msg = correlataIntervalMessage(item.interest_interval_minutes)
        if (msg) out.interest_interval_minutes = msg
      }
      {
        const msg = correlataDetectionCountMessage(item.detection_count)
        if (msg) out.detection_count = msg
      }
      if (item.detection == null) {
        out.detection = SERVICO_CAMPO_OBRIGATORIO
      }
      ;(item.plates ?? []).forEach((p, i) => {
        const msg = plateCompletionMessage(p.plate)
        if (msg) out[`plates.${i}.plate`] = msg
      })
      return out
    }
    case 'reserva_de_imagem': {
      const item = draft.reserva_de_imagem[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.orientation)) {
        out.orientation = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    case 'analise_de_imagem': {
      const item = draft.analise_de_imagem[index]
      if (!item?.concluido) return out
      if (!filledText(item.period_start)) {
        out.period_start = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.period_end)) {
        out.period_end = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.orientation)) {
        out.orientation = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    case 'outros': {
      const item = draft.outros[index]
      if (!item?.concluido) return out
      if (!filledText(item.orientation)) {
        out.orientation = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    case 'atlas_civitas': {
      const item = draft.atlas_civitas[index]
      if (!item?.concluido) return out
      if (!filledText(item.name)) {
        out.name = SERVICO_CAMPO_OBRIGATORIO
      }
      if (!filledText(item.email)) {
        out.email = SERVICO_CAMPO_OBRIGATORIO
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(item.email).trim())
      ) {
        out.email = 'Email inválido'
      }
      {
        const digits = String(item.cpf ?? '').replace(/\D/g, '')
        if (digits.length === 0) {
          out.cpf = SERVICO_CAMPO_OBRIGATORIO
        } else if (!validateCPF(digits)) {
          out.cpf = 'CPF inválido'
        }
      }
      if (!filledText(item.registration)) {
        out.registration = SERVICO_CAMPO_OBRIGATORIO
      }
      return out
    }
    default:
      return out
  }
}

export function collectAllCompletedServiceErrors(draft: TicketServicosOut): {
  rowId: string
  kind: TicketServiceRowKind
  index: number
  errors: Record<string, string>
}[] {
  const acc: {
    rowId: string
    kind: TicketServiceRowKind
    index: number
    errors: Record<string, string>
  }[] = []

  const kinds = [
    'busca_por_placa',
    'busca_por_radar',
    'cerco_eletronico',
    'busca_por_imagem',
    'placas_correlatas',
    'placas_conjuntas',
    'reserva_de_imagem',
    'analise_de_imagem',
    'outros',
    'atlas_civitas',
  ] as const satisfies readonly TicketServiceRowKind[]

  for (const kind of kinds) {
    const list = (draft[kind] ?? []) as {
      id: string
      concluido?: boolean
    }[]
    list.forEach((row, index) => {
      const errors = completionErrorsForServiceRow(draft, kind, index)
      if (Object.keys(errors).length > 0) {
        acc.push({ rowId: row.id, kind, index, errors })
      }
    })
  }

  return acc
}
