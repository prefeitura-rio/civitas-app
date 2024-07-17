import { format } from 'date-fns'

export function dateToString(date: Date) {
  const formattedStringDateUTC = format(date, "yyyy-MM-dd'T'HH:mm:ss")

  return formattedStringDateUTC
}
