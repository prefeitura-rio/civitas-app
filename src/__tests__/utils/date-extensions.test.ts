import { dateConfig } from '@/lib/date-config'
import {
  addDays,
  addHours,
  addMinutes,
  setCurrentTime,
  setDatePreservingTime,
  setMaxTime,
  setMinTime,
} from '@/utils/date-extensions'

describe('Date Extensions', () => {
  let testDate: Date

  beforeEach(() => {
    testDate = new Date('2024-01-15T10:30:45.123')
  })

  describe('setMaxTime', () => {
    it('should set time to maximum values from dateConfig', () => {
      const result = setMaxTime(testDate)

      expect(result.getHours()).toBe(dateConfig.maxTime.hours)
      expect(result.getMinutes()).toBe(dateConfig.maxTime.minutes)
      expect(result.getSeconds()).toBe(dateConfig.maxTime.seconds)
      expect(result.getMilliseconds()).toBe(dateConfig.maxTime.milliseconds)
    })

    it('should preserve the original date', () => {
      const result = setMaxTime(testDate)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should not modify the original date', () => {
      const originalHours = testDate.getHours()
      const originalMinutes = testDate.getMinutes()

      setMaxTime(testDate)

      expect(testDate.getHours()).toBe(originalHours)
      expect(testDate.getMinutes()).toBe(originalMinutes)
    })

    it('should return a new Date instance', () => {
      const result = setMaxTime(testDate)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('setMinTime', () => {
    it('should set time to minimum values from dateConfig', () => {
      const result = setMinTime(testDate)

      expect(result.getHours()).toBe(dateConfig.defaultTime.hours)
      expect(result.getMinutes()).toBe(dateConfig.defaultTime.minutes)
      expect(result.getSeconds()).toBe(dateConfig.defaultTime.seconds)
      expect(result.getMilliseconds()).toBe(dateConfig.defaultTime.milliseconds)
    })

    it('should preserve the original date', () => {
      const result = setMinTime(testDate)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should not modify the original date', () => {
      const originalHours = testDate.getHours()
      const originalMinutes = testDate.getMinutes()

      setMinTime(testDate)

      expect(testDate.getHours()).toBe(originalHours)
      expect(testDate.getMinutes()).toBe(originalMinutes)
    })

    it('should return a new Date instance', () => {
      const result = setMinTime(testDate)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('setCurrentTime', () => {
    it('should set time to current time', () => {
      const now = new Date()
      const result = setCurrentTime(testDate)

      expect(result.getHours()).toBe(now.getHours())
      expect(result.getMinutes()).toBe(now.getMinutes())
      expect(result.getSeconds()).toBe(now.getSeconds())
    })

    it('should preserve the original date', () => {
      const result = setCurrentTime(testDate)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should not modify the original date', () => {
      const originalHours = testDate.getHours()
      const originalMinutes = testDate.getMinutes()

      setCurrentTime(testDate)

      expect(testDate.getHours()).toBe(originalHours)
      expect(testDate.getMinutes()).toBe(originalMinutes)
    })

    it('should return a new Date instance', () => {
      const result = setCurrentTime(testDate)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('setDatePreservingTime', () => {
    it('should set new date while preserving time', () => {
      const newDate = new Date(2024, 5, 20)
      const result = setDatePreservingTime(newDate, testDate)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(20)
      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
      expect(result.getMilliseconds()).toBe(123)
    })

    it('should not modify the original dates', () => {
      const newDate = new Date('2024-06-20')
      const originalNewDate = new Date(newDate)
      const originalTestDate = new Date(testDate)

      setDatePreservingTime(newDate, testDate)

      expect(newDate).toEqual(originalNewDate)
      expect(testDate).toEqual(originalTestDate)
    })

    it('should return a new Date instance', () => {
      const newDate = new Date('2024-06-20')
      const result = setDatePreservingTime(newDate, testDate)

      expect(result).not.toBe(newDate)
      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const result = addDays(testDate, 5)

      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should add negative days correctly', () => {
      const result = addDays(testDate, -3)

      expect(result.getDate()).toBe(12)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should handle month boundary correctly', () => {
      const result = addDays(testDate, 20)

      expect(result.getDate()).toBe(4)
      expect(result.getMonth()).toBe(1)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should preserve time when adding days', () => {
      const result = addDays(testDate, 5)

      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
      expect(result.getMilliseconds()).toBe(123)
    })

    it('should not modify the original date', () => {
      const originalDate = testDate.getDate()

      addDays(testDate, 5)

      expect(testDate.getDate()).toBe(originalDate)
    })

    it('should return a new Date instance', () => {
      const result = addDays(testDate, 5)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('addHours', () => {
    it('should add positive hours correctly', () => {
      const result = addHours(testDate, 3)

      expect(result.getHours()).toBe(13)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
    })

    it('should add negative hours correctly', () => {
      const result = addHours(testDate, -2)

      expect(result.getHours()).toBe(8)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
    })

    it('should handle day boundary correctly', () => {
      const result = addHours(testDate, 15)

      expect(result.getDate()).toBe(16)
      expect(result.getHours()).toBe(1)
    })

    it('should preserve date when adding hours', () => {
      const result = addHours(testDate, 3)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should not modify the original date', () => {
      const originalHours = testDate.getHours()

      addHours(testDate, 3)

      expect(testDate.getHours()).toBe(originalHours)
    })

    it('should return a new Date instance', () => {
      const result = addHours(testDate, 3)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('addMinutes', () => {
    it('should add positive minutes correctly', () => {
      const result = addMinutes(testDate, 45)

      expect(result.getHours()).toBe(11)
      expect(result.getMinutes()).toBe(15)
      expect(result.getSeconds()).toBe(45)
    })

    it('should add negative minutes correctly', () => {
      const result = addMinutes(testDate, -20)

      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(10)
      expect(result.getSeconds()).toBe(45)
    })

    it('should handle hour boundary correctly', () => {
      const result = addMinutes(testDate, 90)

      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(0)
    })

    it('should preserve date when adding minutes', () => {
      const result = addMinutes(testDate, 45)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should not modify the original date', () => {
      const originalMinutes = testDate.getMinutes()

      addMinutes(testDate, 45)

      expect(testDate.getMinutes()).toBe(originalMinutes)
    })

    it('should return a new Date instance', () => {
      const result = addMinutes(testDate, 45)

      expect(result).not.toBe(testDate)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap year correctly', () => {
      const leapYearDate = new Date('2024-02-28T10:30:45.123')
      const result = addDays(leapYearDate, 1)

      expect(result.getDate()).toBe(29)
      expect(result.getMonth()).toBe(1)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should handle year boundary correctly', () => {
      const yearEndDate = new Date('2024-12-31T10:30:45.123')
      const result = addDays(yearEndDate, 1)

      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2025)
    })

    it('should handle zero values correctly', () => {
      const resultDays = addDays(testDate, 0)
      const resultHours = addHours(testDate, 0)
      const resultMinutes = addMinutes(testDate, 0)

      expect(resultDays).toEqual(testDate)
      expect(resultHours).toEqual(testDate)
      expect(resultMinutes).toEqual(testDate)
    })

    it('should handle very large values correctly', () => {
      const result = addDays(testDate, 1000)

      expect(result.getTime()).toBeGreaterThan(testDate.getTime())
      expect(result).toBeInstanceOf(Date)
    })
  })
})
