import { validateCNPJ } from '@/utils/validate-cnpj'

describe('validateCNPJ', () => {
  describe('when CNPJ is valid', () => {
    it('should return true for valid CNPJ with formatting', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
    })

    it('should return true for valid CNPJ without formatting', () => {
      expect(validateCNPJ('11222333000181')).toBe(true)
    })

    it('should return true for another valid CNPJ', () => {
      expect(validateCNPJ('11.444.777/0001-61')).toBe(true)
    })

    it('should return true for valid CNPJ with mixed formatting', () => {
      expect(validateCNPJ('11.222333/0001-81')).toBe(true)
    })
  })

  describe('when CNPJ is invalid', () => {
    it('should return false for CNPJ with wrong length', () => {
      expect(validateCNPJ('123456789')).toBe(false)
      expect(validateCNPJ('123456789012345')).toBe(false)
    })

    it('should return false for CNPJ with all same digits', () => {
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false)
      expect(validateCNPJ('22.222.222/2222-22')).toBe(false)
      expect(validateCNPJ('00.000.000/0000-00')).toBe(false)
    })

    it('should return false for CNPJ with invalid check digits', () => {
      expect(validateCNPJ('11.222.333/0001-00')).toBe(false)
      expect(validateCNPJ('11.222.333/0001-99')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(validateCNPJ('')).toBe(false)
    })

    it('should return false for string with letters', () => {
      expect(validateCNPJ('ab.cde.fgh/ijkl-mn')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle CNPJ with extra spaces', () => {
      expect(validateCNPJ(' 11.222.333/0001-81 ')).toBe(true)
    })

    it('should handle CNPJ with mixed characters', () => {
      expect(validateCNPJ('11abc222def333ghi000jkl1mno81')).toBe(true)
    })

    it('should handle CNPJ with dots and slashes only', () => {
      expect(validateCNPJ('11222333000181')).toBe(true)
    })

    it('should handle CNPJ with various special characters', () => {
      expect(validateCNPJ('11@222#333$0001%81')).toBe(true)
    })
  })
})
