import {
  foldSearchText,
  matchRanges,
} from '@/modules/vehicle-intelligence/components/occurrence/highlighted-text'

describe('busca no relato', () => {
  it('compara sem acento e sem caixa', () => {
    expect(foldSearchText('Moto PRETA na Praça São Salvador')).toBe(
      'moto preta na praca sao salvador',
    )
  })

  it('acha os termos nos índices do texto original, juntando os que se sobrepõem', () => {
    const text = 'Autores em moto; a MOTÔ fugiu'
    expect(matchRanges(text, ['moto'])).toEqual([
      [11, 15],
      [19, 23],
    ])
    expect(matchRanges(text, ['moto', 'oto;'])).toEqual([
      [11, 16],
      [19, 23],
    ])
  })

  it('sem termos, não marca nada', () => {
    expect(matchRanges('qualquer texto', [])).toEqual([])
    expect(matchRanges('qualquer texto', [''])).toEqual([])
  })
})
