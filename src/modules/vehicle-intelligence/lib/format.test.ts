import {
  escapeHtml,
  formatHours,
  formatNumber,
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
