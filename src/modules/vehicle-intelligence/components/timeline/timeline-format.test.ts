/* eslint-disable camelcase -- campos da API em snake_case */
// Só funções de texto; o mapa (react-leaflet, publicado só como ES module, que o Jest do civitas-app não transforma)
// chega por import indireto e não é usado.
import {
  dayLabel,
  disconnectionText,
  geocodeQualityLabel,
  listDayLabel,
  relativeTimeLabel,
  shortDayLabel,
  territoryLabel,
  vehicleLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type { TimelineCase } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import type { GroupDetectionMark } from '@/modules/vehicle-intelligence/types/domain'

jest.mock('react-leaflet', () => ({}))

const mark = (fields: Partial<GroupDetectionMark>): GroupDetectionMark => ({
  kind: 'disconnection',
  event_id: '1',
  elapsed_hours: null,
  gap_hours: null,
  next_at: null,
  complex: null,
  faction: null,
  distance_meters: null,
  ...fields,
})

describe('horários e dias', () => {
  it('escreve o dia por extenso, no seletor e na lista', () => {
    expect(dayLabel('2026-03-02')).toBe('segunda-feira, 02 de março de 2026')
    expect(shortDayLabel('2026-03-02')).toBe('Seg, 02 mar 2026')
    expect(listDayLabel('2025-01-16')).toBe('Qui 16/01')
  })
})

describe('tempos relativos', () => {
  it('relativeTimeLabel diz antes, depois ou no mesmo instante', () => {
    const fact = '2026-03-02T10:00:00-03:00'
    expect(
      relativeTimeLabel('2026-03-02T10:05:00-03:00', fact, 'do fato'),
    ).toBe('5 min depois do fato')
    expect(
      relativeTimeLabel('2026-03-02T09:59:30-03:00', fact, 'da vítima'),
    ).toBe('30 s antes da vítima')
    expect(relativeTimeLabel(fact, fact, 'do fato')).toBe(
      'no mesmo instante do fato',
    )
  })
})

describe('notas do popup', () => {
  it('disconnectionText junta a pausa sem leitura e a hora depois do fato', () => {
    expect(
      disconnectionText(
        mark({
          gap_hours: 18.5,
          next_at: '2026-02-13T10:46:00-03:00',
          elapsed_hours: 0.7,
        }),
      ),
    ).toBe(
      'Último local antes de 18,5 h sem leitura (próxima leitura em 13/02, 10:46). A placa passou aqui 0,7 h depois do fato.',
    )
    expect(disconnectionText(mark({}))).toBe(
      'Último local antes do fim das passagens: a placa não foi mais lida.',
    )
  })

  it('geocodeQualityLabel traduz a origem do ponto do fato', () => {
    expect(geocodeQualityLabel(null)).toBe(
      'Precisão do georreferenciamento não informada',
    )
    expect(geocodeQualityLabel('bairro')).toBe(
      'Georreferenciamento: só o bairro (ponto central)',
    )
    expect(geocodeQualityLabel('07 Algo Novo')).toBe(
      'Georreferenciamento: algo novo',
    )
  })

  it('vehicleLabel não repete o que não foi informado', () => {
    const item = (target_category: string, vehicle_model?: string) =>
      ({ target_category, vehicle_model }) as TimelineCase
    expect(vehicleLabel(item('MOTO', 'NÃO INFORMADO'))).toBe('MOTO')
    expect(vehicleLabel(item('MOTO', 'HONDA CG'))).toBe('MOTO · HONDA CG')
    expect(vehicleLabel(item(''))).toBe('veículo não informado')
  })

  it('territoryLabel: complexo, facção abreviada e distância', () => {
    expect(
      territoryLabel(
        mark({
          complex: 'Complexo X',
          faction: 'Terceiro Comando Puro',
          distance_meters: 320,
        }),
      ),
    ).toBe('Complexo X · TCP · 320 m')
    expect(territoryLabel(mark({ complex: 'Complexo X' }))).toBe('Complexo X')
    expect(territoryLabel(mark({ faction: 'Comando Vermelho' }))).toBeNull()
  })
})
