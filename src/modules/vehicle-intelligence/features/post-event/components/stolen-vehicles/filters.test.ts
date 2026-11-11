import { postEventPath } from '@/modules/vehicle-intelligence/features/post-event/api'
import {
  DEFAULT_FILTERS,
  postEventParams,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/filters'

describe('postEventParams', () => {
  it('sem filtro: as modalidades do recorte e o tamanho das listas, nessa ordem', () => {
    expect(
      postEventPath(postEventParams(DEFAULT_FILTERS, undefined).toString()),
    ).toBe(
      '/api/v1/master-graph/post-event?modalidade=ROUBO&modalidade=FURTO&limite=150&ultima_pagina=1&ultima_por_pagina=25',
    )
  })

  it('período, alvos, CISPs e só carga', () => {
    const params = postEventParams(
      {
        ...DEFAULT_FILTERS,
        modalidades: ['ROUBO'],
        alvos: ['CARRO'],
        cisps: ['014'],
        cargoOnly: true,
        period: { preset: 'custom', start: '2026-01-01', end: '2026-03-31' },
      },
      undefined,
    )
    expect(params.toString()).toBe(
      'inicio=2026-01-01&fim=2026-03-31&modalidade=ROUBO&alvo=CARRO&cisp=014&somente_carga=true&limite=150&ultima_pagina=1&ultima_por_pagina=25',
    )
  })
})
