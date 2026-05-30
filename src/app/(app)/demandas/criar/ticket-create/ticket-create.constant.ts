export type OpenServiceKey =
  | 'plate_search'
  | 'radar_search'
  | 'electronic_fence'
  | 'image_search'
  | 'correlated_plates'
  | 'joint_plates'
  | 'image_reservation'
  | 'image_analysis'
  | 'other'
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
  plates: string[]
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
  procedure_number: 12,
  official_letter_number: 10,
  press_alias: 120,
  article_link: 2048,
  correspondence_neighborhood: 120,
  correspondence_street: 255,
  correspondence_number: 20,
  requester_name: 120,
  requester_phone: 30,
  requester_email: 255,
  focal_point_name: 120,
  focal_point_phone: 120,
  focal_point_email: 255,
  initial_comment: 2000,
  atlas_civitas_name: 120,
  atlas_civitas_email: 255,
  atlas_civitas_registration: 50,
} as const

export const SERVICE_CONFIG = {
  plate_search: { label: 'Busca por placa' },
  radar_search: { label: 'Busca por radar' },
  electronic_fence: { label: 'Cerco eletrônico' },
  image_search: { label: 'Busca por imagem' },
  correlated_plates: { label: 'Placas correlatas' },
  joint_plates: { label: 'Placas conjuntas' },
  image_reservation: { label: 'Reserva de imagem' },
  image_analysis: { label: 'Análise de imagem' },
  other: { label: 'Outros' },
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
  return { plates: [], vehicle_observations: '' }
}

export function normalizeCercoForForm(
  initialValue?: {
    plates?: string[]
    vehicle_observations?: string | null
  } | null,
): {
  plates: string[]
  vehicle_observations: string | null
} {
  if (!initialValue) {
    return {
      plates: [],
      vehicle_observations: null,
    }
  }

  const plates =
    initialValue.plates != null && initialValue.plates.length > 0
      ? [...initialValue.plates]
      : []

  const vehicleObservationsRaw = initialValue.vehicle_observations
  const vehicleObservations =
    vehicleObservationsRaw != null &&
    String(vehicleObservationsRaw).trim() !== ''
      ? String(vehicleObservationsRaw)
      : null

  return {
    plates,
    vehicle_observations: vehicleObservations,
  }
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
