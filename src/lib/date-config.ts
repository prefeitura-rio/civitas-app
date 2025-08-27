import { ptBR } from 'date-fns/locale'

export const dateConfig = {
  locale: ptBR,
  defaultTime: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
  maxTime: { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 },
  formats: {
    dateTime: 'dd MMM, y HH:mm',
    date: 'dd/MM/yyyy',
    time: 'HH:mm',
    full: "EEEE, dd 'de' MMMM 'de' yyyy",
  },
} as const
