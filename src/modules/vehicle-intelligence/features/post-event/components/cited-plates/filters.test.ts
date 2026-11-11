import { postEventPath } from '@/modules/vehicle-intelligence/features/post-event/api'
import {
  formatEventTime,
  parseTime,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/event-time'
import {
  citedParams,
  DEFAULT_CITED_FILTERS,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/filters'

describe('citedParams', () => {
  it('sem filtro, o caminho vai sem query', () => {
    expect(postEventPath(citedParams(DEFAULT_CITED_FILTERS, undefined))).toBe(
      '/api/v1/master-graph/post-event',
    )
  })

  it('filtros de fato e período, nessa ordem; só polos com placa citada não vai para a API', () => {
    const query = citedParams(
      {
        modalidades: ['FURTO'],
        alvos: ['CELULAR'],
        deslocamentos: ['MOTO'],
        cisps: ['014', '015'],
        period: { preset: 'custom', start: '2026-01-01' },
        onlyTracked: true,
      },
      undefined,
    )
    expect(query).toBe(
      'modalidade=FURTO&alvo=CELULAR&deslocamento=MOTO&cisp=014&cisp=015&inicio=2026-01-01',
    )
  })
})

describe('horário do fato', () => {
  it('lê o formato do DuckDB e mostra em Brasília', () => {
    expect(parseTime('2026-01-04 22:00:00-03')?.toISOString()).toBe(
      '2026-01-05T01:00:00.000Z',
    )
    expect(formatEventTime('2026-01-04 22:00:00-03')).toBe('04/01/2026, 22:00')
  })

  it('vazio avisa; o que não é data volta como veio', () => {
    expect(parseTime(null)).toBeNull()
    expect(parseTime('sem data')).toBeNull()
    expect(formatEventTime(undefined)).toBe('Horário não informado')
    expect(formatEventTime('sem data')).toBe('sem data')
  })
})
