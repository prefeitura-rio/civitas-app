// Só funções de texto; o mapa (react-leaflet, publicado só como ES module, que o Jest do civitas-app não transforma)
// chega por import indireto e não é usado.
import {
  modalitiesText,
  shortTerritory,
} from '@/modules/vehicle-intelligence/features/groups/components/list/list-text'

jest.mock('react-leaflet', () => ({}))

describe('lista de grupos: textos curtos', () => {
  it('escreve os ROs por tipo do fato na ordem recebida', () => {
    expect(modalitiesText({ ROUBO: 5, FURTO: 1204 })).toBe(
      'Roubo 5 · Furto 1.204',
    )
    expect(modalitiesText(undefined)).toBe('')
  })

  it('resume o território com a sigla da facção e o múltiplo arredondado', () => {
    expect(
      shortTerritory([
        {
          complex: 'Rocinha',
          faction: 'Comando Vermelho',
          count: 4,
          total: 9,
          lift: 19.4,
        },
        {
          complex: 'Jacarezinho',
          faction: null,
          count: 2,
          total: 9,
          lift: 3.6,
        },
      ]),
    ).toBe('Rocinha (CV) 19×, Jacarezinho 4×')
    expect(shortTerritory([])).toBe('—')
  })
})
