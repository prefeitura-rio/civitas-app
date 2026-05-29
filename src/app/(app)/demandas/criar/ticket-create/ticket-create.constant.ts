export type OpenServiceKey =
  | 'busca_por_placa'
  | 'busca_por_radar'
  | 'cerco_eletronico'
  | 'busca_por_imagem'
  | 'placas_correlatas'
  | 'placas_conjuntas'
  | 'reserva_de_imagem'
  | 'analise_de_imagem'
  | 'outros'
  | 'atlas_civitas'
  | null

export type SectionKey =
  | 'info'
  | 'requester'
  | 'services'
  | 'internal'
  | 'comment'
  | 'attachments'

export type DetectionType = 'ANTES' | 'DEPOIS' | 'AMBOS' | null

export type BuscaPorPlacaDraft = {
  period_start: string
  period_end: string
  plates: string[]
}

export type BuscaPorRadarDraft = {
  period_start: string
  period_end: string
  plates: string[]
  orientation: string
}

export type CercoEletronicoDraft = {
  plate: string
  vehicle_observations: string
}

export type BuscaPorImagemDraft = {
  period_start: string
  period_end: string
  addresses: string[]
  description: string
  cameras: string[]
}

export type CorrelataDraftItem = {
  plate: string
}

export type CorrelataDraft = {
  period_start: string
  period_end: string
  plates: CorrelataDraftItem[]
  interest_interval_minutes: number
  detection_count: number
  detection: DetectionType
}

export type ReservaImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
  addresses: string[]
  cameras: string[]
}

export type AnaliseImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
  addresses: string[]
  cameras: string[]
}

export type OutrosDraft = {
  orientation: string
}

export type AtlasCivitasDraft = {
  name: string
  email: string
  cpf: string
  registration: string
}

export const TICKET_CREATE_STRING_LIMITS = {
  numero_procedimento: 12,
  numero_oficio: 10,
  apelido_imprensa: 120,
  link_materia: 2048,
  bairro_correspondencia: 120,
  rua_correspondencia: 255,
  numero_correspondencia: 20,
  requisitante_nome: 120,
  requisitante_telefone: 30,
  requisitante_email: 255,
  ponto_focal_nome: 120,
  ponto_focal_telefone: 120,
  ponto_focal_email: 255,
  comentario_inicial: 2000,
  atlas_civitas_name: 120,
  atlas_civitas_email: 255,
  atlas_civitas_registration: 50,
} as const

export const SERVICE_CONFIG = {
  busca_por_placa: { label: 'Busca por placa' },
  busca_por_radar: { label: 'Busca por radar' },
  cerco_eletronico: { label: 'Cerco eletrônico' },
  busca_por_imagem: { label: 'Busca por imagem' },
  placas_correlatas: { label: 'Placas correlatas' },
  placas_conjuntas: { label: 'Placas conjuntas' },
  reserva_de_imagem: { label: 'Reserva de imagem' },
  analise_de_imagem: { label: 'Análise de imagem' },
  outros: { label: 'Outros' },
  atlas_civitas: { label: 'Atlas Civitas' },
} satisfies Record<Exclude<OpenServiceKey, null>, { label: string }>

export function emptyBuscaPorPlacaDraft(): BuscaPorPlacaDraft {
  return { period_start: '', period_end: '', plates: [''] }
}

export function normalizeBuscaPorPlacaForForm(
  initialValue?: {
    period_start?: string | null
    period_end?: string | null
    plates?: string[]
  } | null,
): {
  period_start: string | null
  period_end: string | null
  plates: string[]
} {
  if (!initialValue) {
    return {
      period_start: null,
      period_end: null,
      plates: [''],
    }
  }

  const plates =
    initialValue.plates != null && initialValue.plates.length > 0
      ? [...initialValue.plates]
      : ['']

  return {
    period_start: initialValue.period_start ?? null,
    period_end: initialValue.period_end ?? null,
    plates,
  }
}

export function emptyBuscaPorRadarDraft(): BuscaPorRadarDraft {
  return {
    period_start: '',
    period_end: '',
    plates: [''],
    orientation: '',
  }
}

export function normalizeBuscaPorRadarForForm(
  initialValue?: {
    period_start?: string | null
    period_end?: string | null
    plates?: string[]
    orientation?: string | null
  } | null,
): {
  period_start: string | null
  period_end: string | null
  plates: string[]
  orientation: string | null
} {
  if (!initialValue) {
    return {
      period_start: null,
      period_end: null,
      plates: [''],
      orientation: null,
    }
  }

  const plates =
    initialValue.plates != null && initialValue.plates.length > 0
      ? [...initialValue.plates]
      : ['']

  const orientationRaw = initialValue.orientation
  const orientation =
    orientationRaw != null && String(orientationRaw).trim() !== ''
      ? String(orientationRaw)
      : null

  return {
    period_start: initialValue.period_start ?? null,
    period_end: initialValue.period_end ?? null,
    plates,
    orientation,
  }
}

export function emptyCercoDraft(): CercoEletronicoDraft {
  return { plate: '', vehicle_observations: '' }
}

export function emptyBuscaPorImagemDraft(): BuscaPorImagemDraft {
  return {
    period_start: '',
    period_end: '',
    addresses: [],
    description: '',
    cameras: [],
  }
}

export function emptyCorrelataItem(): CorrelataDraftItem {
  return { plate: '' }
}

export function emptyCorrelataDraft(): CorrelataDraft {
  return {
    period_start: '',
    period_end: '',
    plates: [emptyCorrelataItem()],
    interest_interval_minutes: 1,
    detection_count: 10,
    detection: null,
  }
}

export function emptyReservaImagemDraft(): ReservaImagemDraft {
  return {
    period_start: '',
    period_end: '',
    orientation: '',
    addresses: [],
    cameras: [],
  }
}

export function emptyAnaliseImagemDraft(): AnaliseImagemDraft {
  return {
    period_start: '',
    period_end: '',
    orientation: '',
    addresses: [],
    cameras: [],
  }
}

export function emptyOutrosDraft(): OutrosDraft {
  return { orientation: '' }
}

export function emptyAtlasCivitasDraft(): AtlasCivitasDraft {
  return { name: '', email: '', cpf: '', registration: '' }
}
