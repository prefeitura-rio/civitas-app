/**
 * Tipos da timeline: o que a API manda por fato e o que a tela monta em cada dia (as leituras, já com as ligações, e as
 * trilhas).
 */
import type {
  GroupDetectionMark,
  GroupTogetherPassage,
  TimelineCase as TimelineCaseData,
  TimelineDetection as TimelineDetectionData,
} from '@/modules/vehicle-intelligence/types/domain'

export type Detection = TimelineDetectionData
export type TimelineCase = TimelineCaseData
/**
 * Uma ligação da leitura com o fato. Entorno: a correlata foi lida no raio e na
 * janela do fato. Copassagem: passou no mesmo ponto de coleta que a placa vítima,
 * dentro da janela de passagem; a ligação vale para as duas leituras do par.
 */
export type CorrelationMatch = {
  eventId: string
  anchorKey: string
  candidateDetectedAt: string
  victimDetectedAt?: string
  eventTime: string
  distanceMeters: number | null
}
export type TimelineDetection = Detection & {
  key: string
  plate: string
  candidate_plate: string
  correlationMatches: CorrelationMatch[]
  /** Grupo: outras placas do grupo no mesmo equipamento, até 3 min. */
  together?: GroupTogetherPassage[]
  /** Grupo: a leitura é a partida ou a desconexão da placa num RO. */
  marks?: GroupDetectionMark[]
  /** Grupo: a passagem junta (mesmo equipamento, até 3 min, em cadeia) a que a leitura pertence. */
  together_id?: string | null
}
/** A âncora do dia é o fato (entorno) ou a placa vítima (copassagem), que também tem leituras. */
export type TrackRole = 'fact' | 'victim' | 'candidate'
export type TimelineTrack = {
  key: string
  role: TrackRole
  plate: string
  label: string
  color: string
  softColor: string
  detections: TimelineDetection[]
}
/** O que a tela mostra num dia: os fatos, as leituras (já com as ligações) e as trilhas. */
export type TimelineDay = {
  facts: TimelineCase[]
  detections: TimelineDetection[]
  tracks: TimelineTrack[]
}
export type TimelineDayInfo = { count: number; modalities: string[] }
export type CrimeSite = {
  case: TimelineCase
  track: TimelineTrack
  position: [number, number]
}
