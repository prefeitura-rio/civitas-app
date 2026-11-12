import {
  citationExplanation,
  citationNote,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/citations'
import type { PlateCitation } from '@/modules/vehicle-intelligence/types/domain'

const citation = (overrides: Partial<PlateCitation>): PlateCitation => ({
  event_id: '906-00171/2026',
  event_time: null,
  event_date: '2026-01-16',
  cisp: null,
  modality: null,
  target_category: null,
  offender_mode: null,
  crime_type: null,
  address: null,
  neighborhood: null,
  latitude: null,
  longitude: null,
  note: '',
  status: 'never_read',
  correlation: null,
  wider_correlation: null,
  total_readings: 0,
  same_day_readings: 0,
  approximate_matches: 0,
  nearest_in_time: null,
  nearest_in_space: null,
  approximate_hour: null,
  approximate_best: null,
  before_period: false,
  ...overrides,
})

describe('plate-profile/citations', () => {
  it('explica a correlação com a janela, o raio e a leitura mais próxima', () => {
    const item = citation({
      status: 'correlated',
      correlation: {
        cooccurrences: 3,
        min_delta_minutes: 4,
        min_distance_meters: 1500,
      },
    })
    expect(citationExplanation(item, 10, 1000)).toBe(
      '3 leituras no raio de 1.000 m e na janela de ±10 min; a mais próxima a 4 min do horário e a 1,5 km do local.',
    )
  })

  it('explica por que a placa citada não entrou na linha do tempo', () => {
    expect(
      citationExplanation(
        citation({ status: 'not_read_that_day', total_readings: 1204 }),
        10,
        1000,
      ),
    ).toBe(
      'A placa tem 1.204 leituras no período do cerco, nenhuma em 16/01/2026.',
    )
    expect(
      citationExplanation(
        citation({
          status: 'read_outside',
          same_day_readings: 1,
          nearest_in_time: {
            detected_at: '2026-01-16T17:05:00Z',
            delta_minutes: -75,
            distance_meters: 420,
            location: 'RUA DO CATETE',
            point_id: '0001852',
          },
        }),
        10,
        1000,
      ),
    ).toBe(
      'Leitura mais próxima do horário às 14:05, 1h15 antes do fato, a 420 m do local (Rua do Catete). 1 leitura no dia.',
    )
  })

  it('abre a nota da lista com a conclusão', () => {
    expect(citationNote(citation({ status: 'never_read' }), 10, 1000)).toMatch(
      /^Placa citada na dinâmica deste RO\. Nunca lida pelo cerco: Nenhuma leitura desta placa/,
    )
  })
})
