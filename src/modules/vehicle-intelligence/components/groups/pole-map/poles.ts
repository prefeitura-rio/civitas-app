/** Os polos do mapa: as leituras do grupo agrupadas por tipo (partida, passagem junta, desconexão) e câmera. */
import {
  brasiliaFormatter,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import type {
  GroupPoint,
  GroupProfileData,
  PointKind,
} from '@/modules/vehicle-intelligence/types/groups'

/** Cor do marcador no mapa claro, cor do símbolo na interface escura e cor do texto. Azul, laranja e magenta: distintos
 * entre si (também para daltonismo) e fora do vermelho, verde e amarelo das facções. */
export const POINT_KINDS: Record<
  PointKind,
  {
    name: string
    plural: string
    mapColor: string
    uiColor: string
    textColor: string
  }
> = {
  departure: {
    name: 'Partida',
    plural: 'Partidas',
    mapColor: '#2a78d6',
    uiColor: '#3987e5',
    textColor: '#7fb2ee',
  },
  passage: {
    name: 'Passagem junta',
    plural: 'Passagens juntas',
    mapColor: '#e0601f',
    uiColor: '#e0702f',
    textColor: '#f4a873',
  },
  disconnection: {
    name: 'Desconexão',
    plural: 'Desconexões',
    mapColor: '#b8327e',
    uiColor: '#d14d96',
    textColor: '#ec9cc8',
  },
}

/** O que o mapa usa; o perfil do território passa só as partidas e desconexões perto do complexo. */
export type PoleMapData = Pick<
  GroupProfileData,
  'points' | 'events' | 'territory'
> & {
  members: Array<{ plate: string }>
}
export const KIND_ORDER: PointKind[] = ['departure', 'passage', 'disconnection']
/** "Perto de" um complexo: a mesma distância das células e do território (`analise.grupos`). */
const NEAR_METERS = 500
const HOUR_FORMAT = brasiliaFormatter({ hour: '2-digit', hourCycle: 'h23' })

/** Um polo: o local de leitura num tipo, com as leituras, as placas (mais leituras primeiro), os ROs e as horas. */
export interface Pole {
  id: string
  kind: PointKind
  location: string
  lat: number
  lng: number
  complex: string | null
  faction: string | null
  distance: number | null
  items: GroupPoint[]
  count: number
  total: number
  plates: Array<[string, number]>
  events: string[]
  hours: number[]
}

/** Agrupa as leituras por tipo × local de leitura, do polo com mais leituras para o com menos. */
export function buildPoles(
  points: GroupPoint[],
  plates: Set<string>,
  kinds: PointKind[],
): Pole[] {
  const total: Partial<Record<PointKind, number>> = {}
  const poles = new Map<string, Pole>()
  for (const point of points) {
    if (!plates.has(point.plate)) continue
    total[point.kind] = (total[point.kind] ?? 0) + 1
    if (!kinds.includes(point.kind)) continue
    const id = `${point.kind}|${point.camera_id ?? `${point.latitude},${point.longitude}`}`
    let pole = poles.get(id)
    if (!pole) {
      const near =
        point.distance_meters != null && point.distance_meters <= NEAR_METERS
      pole = {
        id,
        kind: point.kind,
        location: point.location ?? 'local não informado',
        lat: point.latitude,
        lng: point.longitude,
        complex: near ? point.complex : null,
        faction: near ? point.faction : null,
        distance: near ? point.distance_meters : null,
        items: [],
        count: 0,
        total: 0,
        plates: [],
        events: [],
        hours: [],
      }
      poles.set(id, pole)
    }
    pole.items.push(point)
  }
  return [...poles.values()]
    .map((pole) => {
      const countByPlate = new Map<string, number>()
      pole.items.forEach((item) =>
        countByPlate.set(item.plate, (countByPlate.get(item.plate) ?? 0) + 1),
      )
      return {
        ...pole,
        count: pole.items.length,
        total: total[pole.kind] ?? 0,
        plates: [...countByPlate.entries()].sort((a, b) => b[1] - a[1]),
        events: [...new Set(pole.items.map((item) => item.event_id))],
        hours: pole.items
          .filter((item) => item.at)
          .map((item) => Number(HOUR_FORMAT.format(parseInstant(item.at!)))),
      }
    })
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location))
}

/** "às 07h", "entre 06h e 09h" ou "sem horário". */
export const hourRange = (hours: number[]) => {
  if (!hours.length) return 'sem horário'
  const a = Math.min(...hours)
  const b = Math.max(...hours)
  const h = (value: number) => `${String(value).padStart(2, '0')}h`
  return a === b ? `às ${h(a)}` : `entre ${h(a)} e ${h(b)}`
}
