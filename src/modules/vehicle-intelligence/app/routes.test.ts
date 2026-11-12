import {
  groupPath,
  groupTimelinePath,
  modulePath,
  normalizePath,
  occurrencePath,
  parseRoute,
  platePath,
  plateTimelinePath,
  territoryPath,
} from '@/modules/vehicle-intelligence/app/routes'

describe('parseRoute: módulos', () => {
  it.each([
    ['/', 'overview'],
    ['', 'overview'],
    ['/qualquer', 'overview'],
    ['/correlation', 'correlation'],
    ['/correlation/', 'correlation'],
    ['/post-event', 'post-event'],
    ['/profile', 'profile'],
    ['/profile/ABC1D23/trends', 'profile'],
    ['/groups', 'groups'],
    ['/groups/ABC1D23-XYZ9K87', 'groups'],
    ['/territories', 'territories'],
    ['/territories/Complexo%20da%20Mar%C3%A9', 'territories'],
    ['/occurrence', 'occurrence'],
    ['/occurrence/019-06778%2F2026', 'occurrence'],
  ] as const)('%s → %s', (path, module) => {
    expect(parseRoute(path).module).toBe(module)
  })
})

describe('parseRoute: placa', () => {
  it('a busca não tem placa', () => {
    expect(parseRoute('/profile').plate).toBeNull()
  })

  it.each([
    [
      '/profile/abc1d23',
      {
        plate: 'ABC1D23',
        view: 'profile',
        day: null,
        analysis: 'correlations',
      },
    ],
    [
      '/profile/ABC1D23/correlations',
      {
        plate: 'ABC1D23',
        view: 'profile',
        day: null,
        analysis: 'correlations',
      },
    ],
    [
      '/profile/ABC1D23/trends',
      { plate: 'ABC1D23', view: 'profile', day: null, analysis: 'trends' },
    ],
    [
      '/profile/ABC1D23/trends/timeline',
      { plate: 'ABC1D23', view: 'timeline', day: null, analysis: 'trends' },
    ],
    [
      '/profile/ABC1D23/correlations/dia/2026-03-04',
      {
        plate: 'ABC1D23',
        view: 'timeline',
        day: '2026-03-04',
        analysis: 'correlations',
      },
    ],
    [
      '/profile/ABC1D23/timeline',
      {
        plate: 'ABC1D23',
        view: 'timeline',
        day: null,
        analysis: 'correlations',
      },
    ],
    [
      '/profile/ABC1D23/dia/2026-03-04',
      {
        plate: 'ABC1D23',
        view: 'timeline',
        day: '2026-03-04',
        analysis: 'correlations',
      },
    ],
  ] as const)('%s', (path, plate) => {
    expect(parseRoute(path).plate).toEqual(plate)
  })
})

describe('parseRoute: grupo e território', () => {
  it('lê o grupo, a timeline e o dia', () => {
    expect(parseRoute('/groups/abc1d23-xyz9k87').group).toEqual({
      id: 'ABC1D23-XYZ9K87',
      view: 'profile',
      day: null,
    })
    expect(parseRoute('/groups/ABC1D23-XYZ9K87/timeline').group).toEqual({
      id: 'ABC1D23-XYZ9K87',
      view: 'timeline',
      day: null,
    })
    expect(
      parseRoute('/groups/ABC1D23-XYZ9K87/timeline/dia/2026-03-04').group?.day,
    ).toBe('2026-03-04')
    expect(parseRoute('/groups').group).toBeNull()
  })

  it('decodifica o complexo e ignora um nome mal codificado', () => {
    expect(parseRoute('/territories/Complexo%20da%20Mar%C3%A9').territory).toBe(
      'Complexo da Maré',
    )
    expect(parseRoute('/territories/%E0%A4%A').territory).toBeNull()
    expect(parseRoute('/territories').territory).toBeNull()
  })
})

describe('construtores de caminho', () => {
  it('cada caminho volta para a mesma rota', () => {
    expect(parseRoute(platePath('ABC1D23', 'trends')).plate?.analysis).toBe(
      'trends',
    )
    expect(
      parseRoute(plateTimelinePath('ABC1D23', 'trends', '2026-03-04')).plate
        ?.day,
    ).toBe('2026-03-04')
    expect(
      parseRoute(plateTimelinePath('ABC1D23', 'correlations', null)).plate
        ?.view,
    ).toBe('timeline')
    expect(
      parseRoute(groupTimelinePath('ABC1D23-XYZ9K87', null)).group?.view,
    ).toBe('timeline')
    expect(parseRoute(territoryPath('Complexo da Maré')).territory).toBe(
      'Complexo da Maré',
    )
  })

  it('o grupo tem a mesma rota em qualquer ordem das placas', () => {
    expect(groupPath(['XYZ9K87', 'ABC1D23'])).toBe('/groups/ABC1D23-XYZ9K87')
  })

  it('visão geral é a raiz', () => {
    expect(modulePath('overview')).toBe('/')
    expect(modulePath('groups')).toBe('/groups')
    expect(normalizePath('groups/')).toBe('/groups')
  })
})

describe('parseRoute: perfil do RO', () => {
  it('a busca não tem RO', () => {
    expect(parseRoute('/occurrence').occurrence).toBeNull()
    expect(parseRoute('/occurrence/').occurrence).toBeNull()
  })

  it('o RO volta com a barra e a placa em maiúsculas', () => {
    expect(parseRoute(occurrencePath('019-06778/2026')).occurrence).toBe(
      '019-06778/2026',
    )
    expect(occurrencePath('019-06778/2026')).toBe(
      '/occurrence/019-06778%2F2026',
    )
    expect(parseRoute('/occurrence/bdd3h48').occurrence).toBe('BDD3H48')
    expect(parseRoute('/occurrence/%E0%A4%A').occurrence).toBeNull()
  })

  it('as outras telas não têm RO', () => {
    expect(parseRoute('/territories/X').occurrence).toBeNull()
  })
})
