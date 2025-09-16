import { formatCoordinates, parseCoordinates } from '@/utils/coordinate-parser'

describe('parseCoordinates', () => {
  describe('valid coordinate formats', () => {
    it('should parse coordinates with comma and space', () => {
      const result = parseCoordinates('-22.808889, -43.413889')
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })

    it('should parse coordinates with comma without space', () => {
      const result = parseCoordinates('-22.808889,-43.413889')
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })

    it('should parse coordinates with space only', () => {
      const result = parseCoordinates('-22.808889 -43.413889')
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })

    it('should parse coordinates with semicolon', () => {
      const result = parseCoordinates('-22.808889; -43.413889')
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })

    it('should parse coordinates with extra spaces', () => {
      const result = parseCoordinates('  -22.808889  ,  -43.413889  ')
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })

    it('should parse positive coordinates', () => {
      const result = parseCoordinates('22.808889, 43.413889')
      expect(result).toEqual({
        latitude: 22.808889,
        longitude: 43.413889,
      })
    })

    it('should parse coordinates with different decimal places', () => {
      const result = parseCoordinates('-22.8, -43.4')
      expect(result).toEqual({
        latitude: -22.8,
        longitude: -43.4,
      })
    })

    it('should parse coordinates with many decimal places', () => {
      const result = parseCoordinates('-22.808889123, -43.413889456')
      expect(result).toEqual({
        latitude: -22.808889123,
        longitude: -43.413889456,
      })
    })
  })

  describe('invalid coordinate formats', () => {
    it('should return null for empty string', () => {
      const result = parseCoordinates('')
      expect(result).toBeNull()
    })

    it('should return null for whitespace only', () => {
      const result = parseCoordinates('   ')
      expect(result).toBeNull()
    })

    it('should return null for invalid format', () => {
      const result = parseCoordinates('invalid coordinates')
      expect(result).toBeNull()
    })

    it('should return null for single number', () => {
      const result = parseCoordinates('-22.808889')
      expect(result).toBeNull()
    })

    it('should return null for three numbers', () => {
      const result = parseCoordinates('-22.808889, -43.413889, 100')
      expect(result).toBeNull()
    })

    it('should return null for invalid separator', () => {
      const result = parseCoordinates('-22.808889| -43.413889')
      expect(result).toBeNull()
    })
  })

  describe('coordinate validation', () => {
    it('should return null for latitude out of range (above 90)', () => {
      const result = parseCoordinates('91.0, -43.413889')
      expect(result).toBeNull()
    })

    it('should return null for latitude out of range (below -90)', () => {
      const result = parseCoordinates('-91.0, -43.413889')
      expect(result).toBeNull()
    })

    it('should return null for longitude out of range (above 180)', () => {
      const result = parseCoordinates('-22.808889, 181.0')
      expect(result).toBeNull()
    })

    it('should return null for longitude out of range (below -180)', () => {
      const result = parseCoordinates('-22.808889, -181.0')
      expect(result).toBeNull()
    })

    it('should accept boundary values', () => {
      const result1 = parseCoordinates('90.0, 180.0')
      expect(result1).toEqual({
        latitude: 90.0,
        longitude: 180.0,
      })

      const result2 = parseCoordinates('-90.0, -180.0')
      expect(result2).toEqual({
        latitude: -90.0,
        longitude: -180.0,
      })
    })

    it('should return null for NaN values', () => {
      const result = parseCoordinates('abc, def')
      expect(result).toBeNull()
    })
  })

  describe('case insensitive', () => {
    it('should work with uppercase input', () => {
      const result = parseCoordinates('-22.808889, -43.413889'.toUpperCase())
      expect(result).toEqual({
        latitude: -22.808889,
        longitude: -43.413889,
      })
    })
  })
})

describe('formatCoordinates', () => {
  it('should format coordinates with 6 decimal places', () => {
    const result = formatCoordinates(-22.808889, -43.413889)
    expect(result).toBe('-22.808889, -43.413889')
  })

  it('should format coordinates with fewer decimal places', () => {
    const result = formatCoordinates(-22.8, -43.4)
    expect(result).toBe('-22.800000, -43.400000')
  })

  it('should format coordinates with more decimal places', () => {
    const result = formatCoordinates(-22.808889123, -43.413889456)
    expect(result).toBe('-22.808889, -43.413889')
  })

  it('should format positive coordinates', () => {
    const result = formatCoordinates(22.808889, 43.413889)
    expect(result).toBe('22.808889, 43.413889')
  })

  it('should format zero coordinates', () => {
    const result = formatCoordinates(0, 0)
    expect(result).toBe('0.000000, 0.000000')
  })
})
