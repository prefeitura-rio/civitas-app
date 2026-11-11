import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'

/** "04/01/2026, 22:00" em Brasília; sem valor, "Horário não informado"; o texto da API quando não é uma data. */
export const formatEventTime = (value: string | null | undefined) =>
  formatDateTime(value, value || 'Horário não informado')
