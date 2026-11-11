import {
  capitalize,
  factsText,
  hourRange,
  rosText,
  shareOfTotal,
} from '@/modules/vehicle-intelligence/components/groups/trends/trend-text'

describe('tendências: textos', () => {
  it('põe fatos e ROs no plural sem separador de milhar', () => {
    expect(factsText(1)).toBe('1 fato')
    expect(factsText(1234)).toBe('1234 fatos')
    expect(rosText(1)).toBe('1 RO')
    expect(rosText(0)).toBe('0 ROs')
  })

  it('escreve a faixa de uma hora, virando a meia-noite', () => {
    expect(hourRange(7)).toBe('7h–8h')
    expect(hourRange(23)).toBe('23h–0h')
    expect(capitalize('segunda')).toBe('Segunda')
  })

  it('dá a parte do total, com menos de 1% quando arredondaria para zero', () => {
    expect(shareOfTotal(5, 10)).toBe('50% do total')
    expect(shareOfTotal(1, 300)).toBe('menos de 1% do total')
    expect(shareOfTotal(0, 10)).toBe('0% do total')
    expect(shareOfTotal(3, 0)).toBe('300% do total')
  })
})
