import { ptBR } from 'date-fns/locale'

/**
 * Configurações centralizadas para formatação de datas
 */
export const dateConfig = {
  /**
   * Locale português brasileiro para date-fns
   */
  locale: ptBR,

  /**
   * Horário padrão para date pickers (00:00)
   */
  defaultTime: {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  },

  /**
   * Horário máximo para date pickers (23:59:59.999)
   */
  maxTime: {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999,
  },

  /**
   * Formatos de data comuns
   */
  formats: {
    dateTime: 'dd MMM, y HH:mm',
    date: 'dd/MM/yyyy',
    time: 'HH:mm',
    full: "EEEE, dd 'de' MMMM 'de' yyyy",
  },
} as const
