import { format } from 'date-fns'

export function formatDateUTC(date: Date | string) {
  const newDate = typeof date === 'string' ? new Date(date) : date
  const hour = newDate.getHours()
  const dateUTC = newDate.setHours(hour + 3)
  const formattedStringDateUTC = format(dateUTC, "yyyy-MM-dd'T'HH:mm:ss")

  return formattedStringDateUTC
}
