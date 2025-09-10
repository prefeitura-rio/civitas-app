import { radarSearchSchema } from '@/app/(app)/veiculos/components/validationSchemas'

describe('radarSearchSchema', () => {
  const baseValidData = {
    startDate: new Date('2024-01-15T10:00:00Z'),
    endDate: new Date('2024-01-15T12:00:00Z'), // 2 horas depois
    plate: 'ABC1234',
    radarIds: ['RADAR001'],
  }

  describe('date validation', () => {
    it('should accept valid 2 hour interval', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T12:00:00Z'),
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept valid interval of exactly 5 hours', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T15:00:00Z'), // 5 horas depois
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject when end date is before start date', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T12:00:00Z'),
        endDate: new Date('2024-01-15T10:00:00Z'), // 2 horas antes
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'A data/hora de fim deve ser posterior à data/hora de início',
        )
      }
    })

    it('should reject when end date equals start date', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T10:00:00Z'),
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'A data/hora de fim deve ser posterior à data/hora de início',
        )
      }
    })

    it('should reject interval greater than 5 hours', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T16:00:00Z'), // 6 horas depois
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O intervalo máximo permitido é de 5 horas',
        )
      }
    })

    it('should accept interval that overflows to next day (within limit)', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T23:00:00Z'),
        endDate: new Date('2024-01-16T02:00:00Z'), // 3 horas depois (passa meia-noite)
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject interval that overflows to next day (above limit)', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T23:00:00Z'),
        endDate: new Date('2024-01-16T05:00:00Z'), // 6 horas depois (passa meia-noite)
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O intervalo máximo permitido é de 5 horas',
        )
      }
    })
  })

  describe('plate validation', () => {
    it('should accept valid plate', () => {
      const data = {
        ...baseValidData,
        plate: 'ABC1234',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept plate with wildcard', () => {
      const data = {
        ...baseValidData,
        plate: 'ABC*234',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept empty plate (optional)', () => {
      const data = {
        ...baseValidData,
        plate: '',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept undefined plate (optional)', () => {
      const data = {
        ...baseValidData,
        plate: undefined,
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid plate', () => {
      const data = {
        ...baseValidData,
        plate: 'INVALID',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Formato inválido')
      }
    })
  })

  describe('radar validation', () => {
    it('should accept array with one radar', () => {
      const data = {
        ...baseValidData,
        radarIds: ['RADAR001'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept array with multiple radars', () => {
      const data = {
        ...baseValidData,
        radarIds: ['RADAR001', 'RADAR002', 'RADAR003'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject empty array', () => {
      const data = {
        ...baseValidData,
        radarIds: [],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Campo obrigatório')
      }
    })
  })

  describe('required fields validation', () => {
    it('should reject when startDate is missing', () => {
      const data = {
        endDate: new Date('2024-01-15T12:00:00Z'),
        plate: 'ABC1234',
        radarIds: ['RADAR001'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Data/hora de início obrigatória',
        )
      }
    })

    it('should reject when endDate is missing', () => {
      const data = {
        startDate: new Date('2024-01-15T10:00:00Z'),
        plate: 'ABC1234',
        radarIds: ['RADAR001'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Data/hora de fim obrigatória',
        )
      }
    })
  })
})
