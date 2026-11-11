import { formatElapsedHours } from '@/modules/vehicle-intelligence/features/post-event/components/shared/elapsed-hours'

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
