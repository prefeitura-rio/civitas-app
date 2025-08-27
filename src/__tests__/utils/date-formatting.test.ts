import { format, formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'

describe('Date Formatting with pt-BR locale', () => {
  const testDate = new Date(2024, 5, 15, 14, 30, 45) // 15 de junho de 2024, 14:30:45

  describe('format function with ptBR locale', () => {
    it('should format date with Portuguese months', () => {
      const result = format(testDate, 'dd MMM, y HH:mm', { locale: ptBR })
      expect(result).toContain('jun') // junho em português
      expect(result).toContain('15')
      expect(result).toContain('2024')
      expect(result).toContain('14:30')
    })

    it('should format full date with Portuguese', () => {
      const result = format(testDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
      expect(result).toBe('15/06/2024 14:30:45')
    })

    it('should format date with Portuguese weekday', () => {
      const result = format(testDate, 'EEEE, dd MMMM yyyy', { locale: ptBR })
      expect(result).toContain('sábado') // sábado em português
      expect(result).toContain('junho') // junho completo em português
    })

    it('should format time correctly', () => {
      const result = format(testDate, 'HH:mm:ss', { locale: ptBR })
      expect(result).toBe('14:30:45')
    })

    it('should format date with full month name in Portuguese', () => {
      const result = format(testDate, "dd 'de' MMMM 'de' yyyy HH:mm", {
        locale: ptBR,
      })
      expect(result).toContain('15 de junho de 2024')
      expect(result).toContain('14:30')
    })
  })

  describe('formatDate function with ptBR locale', () => {
    it('should format date and time with Portuguese locale', () => {
      const result = formatDate(testDate, 'dd/MM/y HH:mm:ss', { locale: ptBR })
      expect(result).toBe('15/06/2024 14:30:45')
    })

    it('should format date with às pattern', () => {
      const result = formatDate(testDate, "dd/MM/y 'às' HH:mm:ss", {
        locale: ptBR,
      })
      expect(result).toContain('15/06/2024 às 14:30:45')
    })

    it('should format date for reports', () => {
      const result = formatDate(testDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })
      expect(result).toBe('15/06/2024 14:30')
    })
  })

  describe('Edge cases', () => {
    it('should handle start of year', () => {
      const newYearDate = new Date(2024, 0, 1, 0, 0, 0) // 1 de janeiro de 2024
      const result = format(newYearDate, 'dd MMM, y', { locale: ptBR })
      expect(result).toContain('jan') // janeiro em português
      expect(result).toContain('01')
      expect(result).toContain('2024')
    })

    it('should handle end of year', () => {
      const endYearDate = new Date(2024, 11, 31, 23, 59, 59) // 31 de dezembro de 2024
      const result = format(endYearDate, 'dd MMM, y HH:mm', { locale: ptBR })
      expect(result).toContain('dez') // dezembro em português
      expect(result).toContain('31')
      expect(result).toContain('2024')
      expect(result).toContain('23:59')
    })

    it('should handle leap year', () => {
      const leapDate = new Date(2024, 1, 29, 12, 0, 0) // 29 de fevereiro de 2024 (ano bissexto)
      const result = format(leapDate, 'dd MMM, y', { locale: ptBR })
      expect(result).toContain('fev') // fevereiro em português
      expect(result).toContain('29')
      expect(result).toContain('2024')
    })
  })

  describe('Portuguese weekdays and months', () => {
    const weekdays = [
      { date: new Date(2024, 5, 10), expected: 'segunda-feira' }, // Segunda
      { date: new Date(2024, 5, 11), expected: 'terça-feira' }, // Terça
      { date: new Date(2024, 5, 12), expected: 'quarta-feira' }, // Quarta
      { date: new Date(2024, 5, 13), expected: 'quinta-feira' }, // Quinta
      { date: new Date(2024, 5, 14), expected: 'sexta-feira' }, // Sexta
      { date: new Date(2024, 5, 15), expected: 'sábado' }, // Sábado
      { date: new Date(2024, 5, 16), expected: 'domingo' }, // Domingo
    ]

    weekdays.forEach(({ date, expected }) => {
      it(`should format ${expected} correctly`, () => {
        const result = format(date, 'EEEE', { locale: ptBR })
        expect(result).toBe(expected)
      })
    })

    const months = [
      { month: 0, shortName: 'jan', fullName: 'janeiro' },
      { month: 1, shortName: 'fev', fullName: 'fevereiro' },
      { month: 2, shortName: 'mar', fullName: 'março' },
      { month: 3, shortName: 'abr', fullName: 'abril' },
      { month: 4, shortName: 'mai', fullName: 'maio' },
      { month: 5, shortName: 'jun', fullName: 'junho' },
      { month: 6, shortName: 'jul', fullName: 'julho' },
      { month: 7, shortName: 'ago', fullName: 'agosto' },
      { month: 8, shortName: 'set', fullName: 'setembro' },
      { month: 9, shortName: 'out', fullName: 'outubro' },
      { month: 10, shortName: 'nov', fullName: 'novembro' },
      { month: 11, shortName: 'dez', fullName: 'dezembro' },
    ]

    months.forEach(({ month, shortName, fullName }) => {
      it(`should format ${fullName} correctly`, () => {
        const date = new Date(2024, month, 15)
        const shortResult = format(date, 'MMM', { locale: ptBR })
        const fullResult = format(date, 'MMMM', { locale: ptBR })

        expect(shortResult).toBe(shortName)
        expect(fullResult).toBe(fullName)
      })
    })
  })
})
