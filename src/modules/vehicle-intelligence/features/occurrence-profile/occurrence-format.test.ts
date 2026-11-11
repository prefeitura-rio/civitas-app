import {
  aroundLabel,
  distanceLabel,
  factDeltaLabel,
  keyKind,
  looseRanges,
  mergePoints,
  minutesLabel,
  plateSignals,
  readingLabel,
  snippetAround,
  sortRows,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateRow,
  OccurrencePoint,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'

const RO = '010-10545/2026'
const row = (plate: string, fields: Partial<OccurrencePlateRow>) =>
  ({
    plate,
    author_citations: [],
    signals: [],
    ...fields,
  }) as OccurrencePlateRow

describe('keyKind', () => {
  it('placa no formato antigo ou Mercosul abre a lista dos ROs; o resto é RO', () => {
    expect(keyKind('bdd3h48')).toBe('plate')
    expect(keyKind('KPN8836')).toBe('plate')
    expect(keyKind('019-06778/2026')).toBe('ro')
    expect(keyKind('01906778')).toBe('ro')
  })
})

describe('sortRows', () => {
  const rows = [
    row('AAA0001', {
      correlation_strength: 20,
      min_fact_delta_minutes: 3,
      min_fact_distance_meters: null,
    }),
    row('BBB0002', {
      correlation_strength: null,
      min_fact_delta_minutes: 1,
      min_fact_distance_meters: 400,
    }),
    row('CCC0003', {
      correlation_strength: 90,
      min_fact_delta_minutes: null,
      min_fact_distance_meters: 100,
    }),
  ]

  it('sem sinal, a ordem padrão é a da API (a da força)', () => {
    expect(sortRows(rows, 'signal', RO).map((item) => item.plate)).toEqual([
      'AAA0001',
      'BBB0002',
      'CCC0003',
    ])
  })

  it('com sinal primeiro, na ordem do sinal: deste RO, outro RO, Cerco, Disque Denúncia, compatível, clone, quente, fria', () => {
    const flagged = [
      row('FRIA001', {
        signals: ['clone'],
        is_clone_suspect: true,
        clone_temperature: 'fria',
      }),
      row('SEM0001', {}),
      row('CERCO01', { signals: ['cerco'], in_cerco: true }),
      row('QUENTE1', {
        signals: ['clone'],
        is_clone_suspect: true,
        clone_temperature: 'quente',
      }),
      row('OUTRO01', {
        signals: ['citada'],
        author_citations: [
          { ro: '001-00001/2026', confidence: null, source: null },
        ],
      }),
      row('CONFIR1', {
        signals: ['clone'],
        is_clone_suspect: true,
        is_clone_confirmed: true,
      }),
      row('COMPAT1', {
        signals: ['compativel'],
        compatible_with: ['final: AT1'],
      }),
      row('DENUNC1', {
        signals: ['denuncia'],
        dd_reports: 2,
        dd_last_report: '2025-05-01T10:00:00-03:00',
      }),
      row('AQUI001', {
        signals: ['citada'],
        cited_here: true,
        author_citations: [{ ro: RO, confidence: null, source: null }],
      }),
    ]
    expect(sortRows(flagged, 'signal', RO).map((item) => item.plate)).toEqual([
      'AQUI001',
      'OUTRO01',
      'CERCO01',
      'DENUNC1',
      'COMPAT1',
      'CONFIR1',
      'QUENTE1',
      'FRIA001',
      'SEM0001',
    ])
  })

  it('a citada neste RO não conta como citada em outro RO', () => {
    const signals = plateSignals(
      row('AQUI001', {
        signals: ['citada', 'cerco'],
        cited_here: true,
        in_cerco: true,
        author_citations: [{ ro: RO, confidence: null, source: null }],
      }),
      RO,
    )
    expect(signals.map((item) => item.short)).toEqual([
      'citada neste RO',
      'Cerco',
    ])
  })

  it('força e passagens do maior para o menor; tempo e distância do menor; ausente no fim', () => {
    expect(sortRows(rows, 'strength', RO).map((item) => item.plate)).toEqual([
      'CCC0003',
      'AAA0001',
      'BBB0002',
    ])
    expect(sortRows(rows, 'fact_time', RO).map((item) => item.plate)).toEqual([
      'BBB0002',
      'AAA0001',
      'CCC0003',
    ])
    expect(sortRows(rows, 'distance', RO).map((item) => item.plate)).toEqual([
      'CCC0003',
      'BBB0002',
      'AAA0001',
    ])
  })

  it('passagens junto ou, na lista de perto, leituras', () => {
    const mixed = [
      row('AAA0001', { readings: 2 }),
      row('BBB0002', { cooccurrences: 5 }),
    ]
    expect(sortRows(mixed, 'together', RO).map((item) => item.plate)).toEqual([
      'BBB0002',
      'AAA0001',
    ])
  })
})

describe('rótulos', () => {
  it('minutos antes e depois do fato', () => {
    expect(minutesLabel(-6.7)).toBe('7 min antes')
    expect(minutesLabel(41)).toBe('41 min depois')
    expect(minutesLabel(0.2)).toBe('no minuto do fato')
    expect(minutesLabel(-982)).toBe('16,4 h antes')
    expect(minutesLabel(null)).toBe('—')
  })

  it('o menor tempo ao fato com o sentido quando as leituras são todas de um lado', () => {
    const fact = '2026-05-28T11:00:00-03:00'
    const span = (first: string, last: string) => ({
      first_seen: `2026-05-28T${first}-03:00`,
      last_seen: `2026-05-28T${last}-03:00`,
    })
    expect(factDeltaLabel(3.3, span('11:03:18', '11:08:00'), fact)).toBe(
      '3,3 min depois',
    )
    expect(factDeltaLabel(2.4, span('10:57:36', '10:57:36'), fact)).toBe(
      '2,4 min antes',
    )
    expect(factDeltaLabel(0.7, span('10:40:00', '11:20:00'), fact)).toBe(
      '0,7 min',
    )
    expect(factDeltaLabel(0.2, span('11:00:12', '11:00:12'), fact)).toBe(
      'no minuto do fato',
    )
    expect(factDeltaLabel(4, span('10:56:00', '10:56:00'), null)).toBe('4 min')
    expect(aroundLabel(4, 7, 'do fato')).toBe('4 antes e 7 depois do fato')
    expect(aroundLabel(0, 5, 'da vítima')).toBe('5 depois da vítima')
  })

  it('distância em metros ou quilômetros', () => {
    expect(distanceLabel(510)).toBe('510 m')
    expect(distanceLabel(2366)).toBe('2,4 km')
    expect(readingLabel({ distance_meters: 187, minutes_from_fact: 0 })).toBe(
      'a 187 m · no minuto do fato',
    )
    expect(readingLabel({ distance_meters: null, minutes_from_fact: -5 })).toBe(
      '5 min antes',
    )
  })
})

describe('mergePoints', () => {
  const point = (
    id: string,
    latitude: number,
    fields: Partial<OccurrencePoint>,
  ): OccurrencePoint => ({
    point: id,
    latitude,
    longitude: -43.2,
    place: 'RUA',
    neighborhood: null,
    distance_meters: 100,
    together: [],
    nearby: [],
    marked: [],
    victim: false,
    cited: [],
    ...fields,
  })

  it('câmeras no mesmo lugar viram um marcador, sem contar a mesma placa duas vezes', () => {
    const merged = mergePoints([
      point('1', -22.9, {
        nearby: ['AAA0001', 'BBB0002'],
        marked: ['AAA0001'],
      }),
      point('2', -22.9, { nearby: ['AAA0001'], victim: true }),
      point('3', -22.8, { together: ['CCC0003'] }),
    ])
    expect(merged).toHaveLength(2)
    expect(merged[0]).toMatchObject({
      points: ['1', '2'],
      nearby: ['AAA0001', 'BBB0002'],
      victim: true,
    })
    expect(merged[0].marked).toEqual(['AAA0001'])
  })
})

describe('a placa no relato', () => {
  const text =
    'O Final Da Placa Da Motocicleta Era 5j37. Viu a moto KYD-9D61 depois.'

  it('acha a placa escrita com espaço, traço ou caixa diferente', () => {
    const [[start, end]] = looseRanges(text, 'ERA5J37')
    expect(text.slice(start, end)).toBe('Era 5j37')
    const [[from, to]] = looseRanges(text, 'KYD9D61')
    expect(text.slice(from, to)).toBe('KYD-9D61')
  })

  it('um trecho só casa numa fronteira de palavra', () => {
    expect(looseRanges('A escola fica perto', 'COL', true)).toEqual([])
    const [[start, end]] = looseRanges(text, '5J37', true)
    expect(text.slice(start, end)).toBe('5j37')
  })

  it('o trecho em volta do achado, em palavras inteiras', () => {
    const range = looseRanges(text, 'ERA5J37')[0]
    const snippet = snippetAround(text, range, 12)
    expect(snippet.match).toBe('Era 5j37')
    expect(snippet.before.startsWith('…')).toBe(true)
    expect(snippet.after.endsWith('…')).toBe(true)
  })
})
