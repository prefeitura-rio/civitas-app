import type {
  PlateSearchCounts,
  PlateSearchItem,
} from '@/modules/vehicle-intelligence/types/domain'

/** O recorte ativo é lido da URL quando o módulo carrega. */
async function loadWith(recorte: string) {
  window.history.replaceState(null, '', `/?recorte=${recorte}`)
  jest.resetModules()
  return import(
    '@/modules/vehicle-intelligence/components/plate/plate-search-logic'
  )
}

const NONE: PlateSearchCounts = {
  fatos: 0,
  fatos_perfil: 0,
  vitima: 0,
  citada: 0,
  dias: 0,
  leituras: 0,
}

function item(
  recortes: Record<string, Partial<PlateSearchCounts>>,
  extra: Partial<PlateSearchItem> = {},
) {
  return {
    placa: 'ABC1D23',
    sinais: {},
    onibus_municipal: false,
    invalida: null,
    recortes: Object.fromEntries(
      Object.entries(recortes).map(([id, counts]) => [
        id,
        { ...NONE, ...counts },
      ]),
    ),
    ...extra,
  } as PlateSearchItem
}

describe('padrão digitado', () => {
  it('aceita letras, números e traço, em maiúsculas, até 8 caracteres', async () => {
    const { platePatternInput } = await loadWith('transeuntes')
    expect(platePatternInput('abc 1d2.3')).toBe('ABC1D23')
    expect(platePatternInput('abc-12345')).toBe('ABC-1234')
  })

  it('lê a placa exata, o traço da placa antiga e os curingas', async () => {
    const { parsePlatePattern } = await loadWith('transeuntes')
    expect(parsePlatePattern('ABC1D23')).toEqual({
      pattern: 'ABC1D23',
      exact: true,
      ready: true,
      problem: null,
    })
    expect(parsePlatePattern('ABC-1234')).toEqual({
      pattern: 'ABC1234',
      exact: true,
      ready: true,
      problem: null,
    })
    expect(parsePlatePattern('RJQ9F9-')).toEqual({
      pattern: 'RJQ9F9-',
      exact: false,
      ready: true,
      problem: null,
    })
    expect(parsePlatePattern('ABC1')).toEqual({
      pattern: 'ABC1',
      exact: true,
      ready: false,
      problem: null,
    })
  })

  it('recusa padrão com poucos caracteres fixos ou longo demais', async () => {
    const { parsePlatePattern } = await loadWith('transeuntes')
    expect(parsePlatePattern('AB-----').problem).toBe(
      'Fixe pelo menos 4 caracteres (no máximo 3 traços).',
    )
    expect(parsePlatePattern('ABCD1234').problem).toBe(
      'A placa tem 7 caracteres.',
    )
  })
})

describe('recorte em que a placa abre', () => {
  it('abre em correlações com fato e em tendências só com circulação', async () => {
    const { destinationIn } = await loadWith('transeuntes')
    const found = item({
      transeuntes: { citada: 1 },
      veiculos: { dias: 4 },
      carga: {},
    })
    expect(destinationIn(found, 'transeuntes')).toEqual({
      recorte: 'transeuntes',
      analysis: 'correlations',
    })
    expect(destinationIn(found, 'veiculos')).toEqual({
      recorte: 'veiculos',
      analysis: 'trends',
    })
    expect(destinationIn(found, 'carga')).toBeNull()
  })

  it('não abre placa inválida nem ônibus municipal', async () => {
    const { blockedReason, destinationIn } = await loadWith('transeuntes')
    const bus = item({ transeuntes: { fatos: 3 } }, { onibus_municipal: true })
    expect(destinationIn(bus, 'transeuntes')).toBeNull()
    expect(blockedReason(item({}, { invalida: 'erro de leitura' }))).toBe(
      'Placa inválida, fora de todas as telas: erro de leitura',
    )
  })

  it('prefere o recorte ativo e, fora dele, o de mais fatos', async () => {
    const { preferredDestination } = await loadWith('veiculos')
    expect(
      preferredDestination(item({ veiculos: { dias: 1 }, carga: { fatos: 9 } }))
        ?.recorte,
    ).toBe('veiculos')
    const elsewhere = item({
      veiculos: {},
      transeuntes: { fatos: 1 },
      carga: { fatos: 2, vitima: 1 },
    })
    expect(preferredDestination(elsewhere)).toEqual({
      recorte: 'carga',
      analysis: 'correlations',
    })
  })

  it('monta o link do perfil com todos os fatos', async () => {
    const { profileHref } = await loadWith('transeuntes')
    expect(
      profileHref('ABC1D23', { recorte: 'carga', analysis: 'trends' }),
    ).toBe(
      '/inteligencia-veicular/profile/ABC1D23/trends?recorte=carga&fatos=todos',
    )
  })
})
