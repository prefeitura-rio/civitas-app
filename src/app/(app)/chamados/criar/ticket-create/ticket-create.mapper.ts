import type { TicketCreateForm } from './ticket-create-schema'

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
    numero_procedimento: emptyToNull(data.numero_procedimento),
    numero_oficio: emptyToNull(data.numero_oficio),
    data_base: emptyToNull(data.data_base),
    natureza_id: emptyToNull(data.natureza_id),
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
      plate: emptyToNull(item.plate),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
    })),

    busca_por_radar: data.busca_por_radar.map((item) => ({
      plate: emptyToNull(item.plate),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      radar_address: emptyToNull(item.radar_address),
    })),

    cerco_eletronico: data.cerco_eletronico.map((item) => ({
      plate: emptyToNull(item.plate),
      vehicle_observations: emptyToNull(item.vehicle_observations),
    })),

    busca_por_imagem: data.busca_por_imagem.map((item) => ({
      plate: emptyToNull(item.plate),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      address: emptyToNull(item.address),
      description: emptyToNull(item.description),
    })),

    placas_correlatas: data.placas_correlatas.map((group) => ({
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      items: (group.items ?? []).map((item) => ({
        plate: emptyToNull(item.plate),
        period_start: toIsoDateTime(item.period_start),
        period_end: toIsoDateTime(item.period_end),
      })),
    })),

    placas_conjuntas: data.placas_conjuntas.map((group) => ({
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      items: (group.items ?? []).map((item) => ({
        plate: emptyToNull(item.plate),
        period_start: toIsoDateTime(item.period_start),
        period_end: toIsoDateTime(item.period_end),
      })),
    })),

    reserva_de_imagem: data.reserva_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
    })),

    analise_de_imagem: data.analise_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
    })),

    outros: data.outros.map((item) => ({
      orientation: emptyToNull(item.orientation),
    })),
  }
}
