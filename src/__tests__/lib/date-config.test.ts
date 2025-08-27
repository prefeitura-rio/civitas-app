import { dateConfig } from '@/lib/date-config'

describe('dateConfig', () => {
  it('should export Brazilian Portuguese locale', () => {
    expect(dateConfig.locale).toBeDefined()
    expect(dateConfig.locale.code).toBe('pt-BR')
  })

  it('should define default time as 00:00:00', () => {
    expect(dateConfig.defaultTime).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  })

  it('should define max time as 23:59:59.999', () => {
    expect(dateConfig.maxTime).toEqual({
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    })
  })

  it('should define common date formats', () => {
    expect(dateConfig.formats).toEqual({
      dateTime: 'dd MMM, y HH:mm',
      date: 'dd/MM/yyyy',
      time: 'HH:mm',
      full: "EEEE, dd 'de' MMMM 'de' yyyy",
    })
  })

  it('should be available for import throughout the application', () => {
    // Verifica se a configuração é exportada corretamente
    expect(typeof dateConfig).toBe('object')
    expect(dateConfig.locale).toBeTruthy()
    expect(dateConfig.defaultTime).toBeTruthy()
    expect(dateConfig.formats).toBeTruthy()
  })
})
