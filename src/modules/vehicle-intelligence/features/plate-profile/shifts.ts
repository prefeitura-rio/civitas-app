/** Dias da semana e turnos do dia nas tendências de circulação (as chaves dos turnos vêm da API). */

export const weekdayLong = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

export const shiftOrder = ['madrugada', 'manha', 'tarde', 'noite'] as const

export const shiftMeta = {
  madrugada: { label: 'Madrugada', window: '00h – 06h' },
  manha: { label: 'Manhã', window: '06h – 12h' },
  tarde: { label: 'Tarde', window: '12h – 18h' },
  noite: { label: 'Noite', window: '18h – 24h' },
} as const

export type ShiftKey = keyof typeof shiftMeta
