import {
  escapeHtml,
  formatDistance,
  formatDuration,
  formatElapsedHours,
  formatHours,
  formatInterval,
  formatMinutesApart,
  formatNumber,
  formatPercent,
  formatStopDuration,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import {
  cispLabel,
  shortAddress,
  titleCase,
  titleCaseText,
} from '@/modules/vehicle-intelligence/lib/labels'

describe('lib/format', () => {
  it('formata números em pt-BR, com ausente como 0', () => {
    expect(formatNumber(12345)).toBe('12.345')
    expect(formatNumber(1.5)).toBe('1,5')
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
  })

  it('põe a palavra no plural pela contagem', () => {
    expect(pluralize(1, 'placa', 'placas')).toBe('1 placa')
    expect(pluralize(0, 'placa', 'placas')).toBe('0 placas')
    expect(pluralize(1204, 'leitura', 'leituras')).toBe('1.204 leituras')
  })

  it('escreve horas com até uma casa', () => {
    expect(formatHours(1.25)).toBe('1,3 h')
    expect(formatHours(8)).toBe('8 h')
  })

  it('escapa o HTML montado à mão', () => {
    expect(escapeHtml(`<b class="x">Rua d'Ajuda & Cia</b>`)).toBe(
      '&lt;b class=&quot;x&quot;&gt;Rua d&#39;Ajuda &amp; Cia&lt;/b&gt;',
    )
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(42)).toBe('42')
  })
})

describe('lib/labels', () => {
  it('titleCase junta as palavras com um espaço', () => {
    expect(titleCase('  VILAR  DOS TELES ')).toBe('Vilar dos Teles')
  })

  it('titleCaseText também capitaliza depois de ( / - e mantém os espaços', () => {
    expect(titleCaseText('RUA DA AJUDA (CENTRO)/RJ')).toBe(
      'Rua da Ajuda (Centro)/Rj',
    )
    expect(titleCaseText('DE SÃO JOÃO')).toBe('De São João')
  })

  it('encurta o endereço do RO', () => {
    expect(
      shortAddress('RUA VISCONDE DE PIRAJA, 526, IPANEMA, Rio de Janeiro / RJ'),
    ).toBe('Rua Visconde de Piraja, 526')
    expect(shortAddress(null)).toBe('endereço não informado')
  })

  it('monta o rótulo da CISP', () => {
    expect(cispLabel('014', '014A. DP - [LEBLON]')).toBe('CISP 14 · Leblon')
    expect(cispLabel('014', null)).toBe('CISP 14')
    expect(cispLabel(null, null)).toBe('CISP não informada')
  })
})

describe('durações e distâncias', () => {
  it('formatDuration: segundos, minutos ou horas e minutos', () => {
    expect(formatDuration(30)).toBe('30 s')
    expect(formatDuration(-5)).toBe('0 s')
    expect(formatDuration(90)).toBe('1 min')
    expect(formatDuration(3725)).toBe('1 h 02 min')
  })

  it('formatDistance com fixedKm: metros abaixo de 1 km, km com uma casa', () => {
    expect(formatDistance(320.4, { fixedKm: true })).toBe('320 m')
    expect(formatDistance(12340, { fixedKm: true })).toBe('12,3 km')
  })
})

describe('tempos das tendências e das correlações', () => {
  it('formatStopDuration: segundos, minutos, horas ou dias', () => {
    expect(formatStopDuration(45)).toBe('45 s')
    expect(formatStopDuration(90)).toBe('2 min')
    expect(formatStopDuration(2 * 3600 + 5 * 60)).toBe('2 h 05 min')
    expect(formatStopDuration(36 * 3600)).toBe('1,5 dias')
    expect(formatStopDuration(0)).toBe('—')
    expect(formatStopDuration(Number.NaN)).toBe('—')
  })

  it('formatInterval: minutos, horas ou dias', () => {
    expect(formatInterval(25 * 60_000)).toBe('25 min')
    expect(formatInterval(5 * 3_600_000)).toBe('5 h')
    expect(formatInterval(24 * 3_600_000)).toBe('1 dia')
    expect(formatInterval(72 * 3_600_000)).toBe('3 dias')
    expect(formatInterval(0)).toBe('—')
  })

  it('formatMinutesApart: a distância no tempo até o fato, sem o sentido', () => {
    expect(formatMinutesApart(-12.4)).toBe('12 min')
    expect(formatMinutesApart(75)).toBe('1h15')
    expect(formatMinutesApart(120)).toBe('2 h')
  })
})

describe('formatElapsedHours', () => {
  it('sem valor, avisa que o tempo não foi calculado', () => {
    expect(formatElapsedHours(null)).toBe('tempo não calculado')
    expect(formatElapsedHours(undefined, 1)).toBe('tempo não calculado')
  })

  it('até um dia, em horas: até 3 casas na copassagem (o padrão do toLocaleString), 1 no entorno', () => {
    expect(formatElapsedHours(1.23456)).toBe(
      `${(1.23456).toLocaleString('pt-BR')} h`,
    )
    expect(formatElapsedHours(1.23456)).toBe('1,235 h')
    expect(formatElapsedHours(1.23456, 1)).toBe('1,2 h')
    expect(formatElapsedHours(0)).toBe('0 h')
    expect(formatElapsedHours(23.9, 1)).toBe('23,9 h')
  })

  it('de um dia em diante, em dias com uma casa', () => {
    expect(formatElapsedHours(24)).toBe('1 dias')
    expect(formatElapsedHours(36, 1)).toBe('1,5 dias')
    expect(formatElapsedHours(100)).toBe('4,2 dias')
  })
})

describe('porcentagens', () => {
  it('escreve a porcentagem com até uma casa', () => {
    expect(formatPercent(12.345)).toBe('12,3%')
    expect(formatPercent(50)).toBe('50%')
  })
})
