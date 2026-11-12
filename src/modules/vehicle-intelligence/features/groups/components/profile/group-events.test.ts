import { eventPairs } from '@/modules/vehicle-intelligence/features/groups/components/profile/event-pairs'
import { groupEventsCsv } from '@/modules/vehicle-intelligence/features/groups/components/profile/export-events'
import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

const event = (overrides: Partial<GroupEvent>): GroupEvent => ({
  event_id: '123',
  ro: null,
  occurred_at: '2026-08-01T21:10:00-03:00',
  day: '2026-08-01',
  hour: 21,
  weekday: 6,
  cisp: '14',
  cisp_name: null,
  modality: 'ROUBO',
  category: 'CELULAR',
  crime_type: null,
  offender_mode: null,
  address: 'Rua "A", 10',
  latitude: null,
  longitude: null,
  plates: ['AAA1A11', 'BBB2B22'],
  min_distance_meters: null,
  min_delta_minutes: null,
  pairs: [],
  ...overrides,
})

describe('perfil do grupo: ocorrências', () => {
  it('descreve a evidência de cada par do RO', () => {
    expect(
      eventPairs(
        event({
          pairs: [
            { a: 'AAA1A11', b: 'BBB2B22', together: true, disconnected: true },
            {
              a: 'AAA1A11',
              b: 'CCC3C33',
              together: false,
              disconnected: false,
            },
          ],
        }),
      ),
    ).toEqual([
      {
        pair: 'AAA1A11 + BBB2B22',
        text: 'juntas no fato e desconectaram juntas',
      },
      { pair: 'AAA1A11 + CCC3C33', text: 'dividem o RO' },
    ])
  })

  it('sem evidência, todos os pares das placas só dividem o RO', () => {
    expect(
      eventPairs(event({ plates: ['A', 'B', 'C'] })).map((p) => p.pair),
    ).toEqual(['A + B', 'A + C', 'B + C'])
    expect(eventPairs(event({ plates: ['A'] }))).toEqual([])
  })

  it('monta o CSV com aspas escapadas e os pares por tipo de evidência', () => {
    const csv = groupEventsCsv([
      event({
        pairs: [
          { a: 'AAA1A11', b: 'BBB2B22', together: true, disconnected: false },
        ],
        cisp: null,
      }),
    ])
    const [header, row] = csv.split('\r\n')
    expect(header).toBe(
      '"ro";"data_hora";"cisp";"modalidade";"alvo";"endereco";"placas";"passaram_juntas";"desconectaram_juntas"',
    )
    expect(row).toBe(
      '"123";"2026-08-01T21:10:00-03:00";"";"ROUBO";"CELULAR";"Rua ""A"", 10";"AAA1A11|BBB2B22";"AAA1A11+BBB2B22";""',
    )
  })
})
