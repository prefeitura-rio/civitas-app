import type { CorrelationRankingSortTerm } from '@/modules/vehicle-intelligence/types/domain'

/** As direções padrão dependem da estratégia do recorte, lida da URL quando o módulo carrega. */
async function loadWith(recorte: string) {
  window.history.replaceState(null, '', `/?recorte=${recorte}`)
  jest.resetModules()
  return import(
    '@/modules/vehicle-intelligence/features/correlations/ranking-sort'
  )
}

const BY_CORRELATIONS: CorrelationRankingSortTerm[] = [
  { key: 'correlations', direction: 'desc' },
]

describe('ordenação do ranking', () => {
  it('começa decrescente e, no entorno do fato, crescente para tempo e distância', async () => {
    const { nextSortTerms } = await loadWith('transeuntes')
    expect(nextSortTerms(BY_CORRELATIONS, 'linked_events', false)).toEqual([
      { key: 'linked_events', direction: 'desc' },
    ])
    expect(
      nextSortTerms(BY_CORRELATIONS, 'median_fact_delta_minutes', false),
    ).toEqual([{ key: 'median_fact_delta_minutes', direction: 'asc' }])
  })

  it('na copassagem, o intervalo entre passagens começa crescente', async () => {
    const { nextSortTerms } = await loadWith('carga')
    expect(nextSortTerms([], 'median_passage_delta_minutes', false)).toEqual([
      { key: 'median_passage_delta_minutes', direction: 'asc' },
    ])
    expect(nextSortTerms([], 'median_fact_delta_minutes', false)).toEqual([
      { key: 'median_fact_delta_minutes', direction: 'desc' },
    ])
  })

  it('clicar de novo inverte a direção', async () => {
    const { nextSortTerms } = await loadWith('transeuntes')
    expect(nextSortTerms(BY_CORRELATIONS, 'correlations', false)).toEqual([
      { key: 'correlations', direction: 'asc' },
    ])
  })

  it('com Shift, soma a coluna ou inverte só a dela', async () => {
    const { nextSortTerms } = await loadWith('transeuntes')
    const two = nextSortTerms(BY_CORRELATIONS, 'distinct_days', true)
    expect(two).toEqual([
      { key: 'correlations', direction: 'desc' },
      { key: 'distinct_days', direction: 'desc' },
    ])
    expect(nextSortTerms(two, 'distinct_days', true)).toEqual([
      { key: 'correlations', direction: 'desc' },
      { key: 'distinct_days', direction: 'asc' },
    ])
  })
})
