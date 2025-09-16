import { validateCPF } from '@/utils/validate-cpf'

describe('validateCPF', () => {
  describe('when CPF is valid', () => {
    it('should return true for valid CPF with dots and dash', () => {
      expect(validateCPF('123.456.789-09')).toBe(true)
    })

    it('should return true for valid CPF without formatting', () => {
      expect(validateCPF('12345678909')).toBe(true)
    })

    it('should return true for another valid CPF', () => {
      expect(validateCPF('111.444.777-35')).toBe(true)
    })
  })

  describe('when CPF is invalid', () => {
    it('should return false for CPF with wrong length', () => {
      expect(validateCPF('123.456.789')).toBe(false)
      expect(validateCPF('123.456.789-091')).toBe(false)
    })

    it('should return false for CPF with all same digits', () => {
      expect(validateCPF('111.111.111-11')).toBe(false)
      expect(validateCPF('222.222.222-22')).toBe(false)
      expect(validateCPF('000.000.000-00')).toBe(false)
    })

    it('should return false for CPF with invalid check digits', () => {
      expect(validateCPF('123.456.789-00')).toBe(false)
      expect(validateCPF('123.456.789-99')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(validateCPF('')).toBe(false)
    })

    it('should return false for string with letters', () => {
      expect(validateCPF('abc.def.ghi-jk')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle CPF with extra spaces', () => {
      expect(validateCPF(' 123.456.789-09 ')).toBe(true)
    })

    it('should handle CPF with mixed characters', () => {
      expect(validateCPF('123abc456def789ghi09')).toBe(true)
    })
  })
})
