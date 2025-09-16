import '@/utils/string-extensions'

describe('String.prototype.capitalizeFirstLetter', () => {
  describe('when capitalizing strings', () => {
    it('should capitalize single word', () => {
      expect('hello'.capitalizeFirstLetter()).toBe('Hello')
    })

    it('should capitalize multiple words', () => {
      expect('hello world'.capitalizeFirstLetter()).toBe('Hello World')
    })

    it('should handle already capitalized words', () => {
      expect('Hello World'.capitalizeFirstLetter()).toBe('Hello World')
    })

    it('should handle mixed case strings', () => {
      expect('hELLo WoRLd'.capitalizeFirstLetter()).toBe('Hello World')
    })

    it('should handle strings with multiple spaces', () => {
      expect('hello  world   test'.capitalizeFirstLetter()).toBe(
        'Hello  World   Test',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(''.capitalizeFirstLetter()).toBe('')
    })

    it('should handle single character', () => {
      expect('a'.capitalizeFirstLetter()).toBe('A')
    })

    it('should handle string with only spaces', () => {
      expect('   '.capitalizeFirstLetter()).toBe('   ')
    })

    it('should handle string starting with space', () => {
      expect(' hello world'.capitalizeFirstLetter()).toBe(' Hello World')
    })

    it('should handle string ending with space', () => {
      expect('hello world '.capitalizeFirstLetter()).toBe('Hello World ')
    })

    it('should handle numbers and special characters', () => {
      expect('hello 123 world!'.capitalizeFirstLetter()).toBe(
        'Hello 123 World!',
      )
    })

    it('should handle accented characters', () => {
      expect('josé maría'.capitalizeFirstLetter()).toBe('José María')
    })
  })
})
