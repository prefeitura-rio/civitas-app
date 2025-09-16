import { radarSearchSchema } from '@/app/(app)/veiculos/components/validationSchemas'

describe('radarSearchSchema', () => {
  const baseValidData = {
    startDate: new Date('2024-01-15T10:00:00Z'),
    endDate: new Date('2024-01-15T12:00:00Z'), // 2 horas depois
    plate: 'ABC1234',
    radarIds: ['RADAR001'],
  }

  describe('validação de datas', () => {
    it('deve aceitar intervalo válido de 2 horas', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T12:00:00Z'),
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve aceitar intervalo válido de exatamente 5 horas', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T15:00:00Z'), // 5 horas depois
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar quando data de fim é anterior à data de início', () => {
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

    it('deve rejeitar quando data de fim é igual à data de início', () => {
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

    it('deve rejeitar intervalo maior que 5 horas', () => {
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

    it('deve aceitar intervalo que transborda para o dia seguinte (dentro do limite)', () => {
      const data = {
        ...baseValidData,
        startDate: new Date('2024-01-15T23:00:00Z'),
        endDate: new Date('2024-01-16T02:00:00Z'), // 3 horas depois (passa meia-noite)
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar intervalo que transborda para o dia seguinte (acima do limite)', () => {
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

  describe('validação de placa', () => {
    it('deve aceitar placa válida', () => {
      const data = {
        ...baseValidData,
        plate: 'ABC1234',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve aceitar placa com wildcard', () => {
      const data = {
        ...baseValidData,
        plate: 'ABC*234',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve aceitar placa vazia (opcional)', () => {
      const data = {
        ...baseValidData,
        plate: '',
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve aceitar placa undefined (opcional)', () => {
      const data = {
        ...baseValidData,
        plate: undefined,
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar placa inválida', () => {
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

  describe('validação de radares', () => {
    it('deve aceitar array com um radar', () => {
      const data = {
        ...baseValidData,
        radarIds: ['RADAR001'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve aceitar array com múltiplos radares', () => {
      const data = {
        ...baseValidData,
        radarIds: ['RADAR001', 'RADAR002', 'RADAR003'],
      }

      const result = radarSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar array vazio', () => {
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

  describe('validação de campos obrigatórios', () => {
    it('deve rejeitar quando startDate está faltando', () => {
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

    it('deve rejeitar quando endDate está faltando', () => {
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
