import { useEffect, useState } from 'react'

interface TimeValidation {
  isValid: boolean
  message: string
  duration: number
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000

export function useTimeValidation(
  startDate: Date | null,
  endDate: Date | null,
) {
  const [timeValidation, setTimeValidation] = useState<TimeValidation>({
    isValid: true,
    message: '',
    duration: 0,
  })

  useEffect(() => {
    if (!startDate || !endDate) return

    const timeDiff = endDate.getTime() - startDate.getTime()
    const isValid = timeDiff > 0 && timeDiff <= FIVE_HOURS_MS

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    const message = isValid
      ? `${hours}h ${minutes}min`
      : timeDiff <= 0
        ? 'A data/hora de fim deve ser posterior à data/hora de início'
        : `Máximo de 5 horas permitido (atual: ${hours}h ${minutes}min)`

    setTimeValidation({ isValid, message, duration: timeDiff })
  }, [startDate, endDate])

  return timeValidation
}
