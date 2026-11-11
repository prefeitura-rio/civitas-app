import {
  calendarDaySpan,
  cispUnitLabel,
  civilDay,
  clockTime,
  cloneTemperatureLabel,
  correlationEventAnchor,
  intervalLabel,
  minutesLabel,
  temperatureLabel,
  temperatureTone,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import {
  vehicleLine,
  vehicleTypeLabel,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/vehicle'

describe('plate-profile/correlation-format', () => {
  it('nomeia a delegacia pelo código e pelo nome cadastrado', () => {
    expect(cispUnitLabel('005', { '005': '005A. DP - [MEM DE SÁ]' })).toBe(
      '5ª DP · Mem de Sá',
    )
    expect(cispUnitLabel('077', {})).toBe('CISP 077')
    expect(cispUnitLabel(null, {})).toBe('—')
  })

  it('escreve o intervalo entre fatos em minutos, horas ou dias', () => {
    expect(intervalLabel(25 * 60_000)).toBe('25 min')
    expect(intervalLabel(5 * 3_600_000)).toBe('5 h')
    expect(intervalLabel(24 * 3_600_000)).toBe('1 dia')
    expect(intervalLabel(72 * 3_600_000)).toBe('3 dias')
    expect(intervalLabel(0)).toBe('—')
  })

  it('classifica a força da correlação e a temperatura do clone', () => {
    expect([75, 40, 10].map(temperatureTone)).toEqual(['hot', 'warm', 'cold'])
    expect([75, 40, 10].map(temperatureLabel)).toEqual([
      'Alta',
      'Média',
      'Baixa',
    ])
    expect(cloneTemperatureLabel('quente', 0)).toBe('alta')
    expect(cloneTemperatureLabel('media', 0)).toBe('média')
    expect(cloneTemperatureLabel(null, 72)).toBe('alta')
    expect(cloneTemperatureLabel(undefined, null)).toBe('baixa')
  })

  it('conta os dias entre o primeiro e o último fato', () => {
    expect(calendarDaySpan('2026-01-01', '2026-01-31')).toBe(31)
    expect(
      calendarDaySpan('2026-01-01T10:00:00-03:00', '2026-01-01T10:00:00-03:00'),
    ).toBe(1)
    expect(calendarDaySpan(null, '2026-01-31')).toBe(0)
  })

  it('escreve a data civil sem passar pelo fuso e a hora em Brasília', () => {
    expect(civilDay('2026-01-16')).toBe('16/01/2026')
    expect(civilDay('2026-01-16T01:00:00Z')).toBe('16/01/2026')
    expect(civilDay(null)).toBe('data não informada')
    expect(clockTime('2026-01-16T17:05:00Z')).toBe('14:05')
  })

  it('escreve a distância no tempo até o fato', () => {
    expect(minutesLabel(-12.4)).toBe('12 min')
    expect(minutesLabel(75)).toBe('1h15')
    expect(minutesLabel(120)).toBe('2 h')
  })

  it('monta a âncora do fato a partir do RO', () => {
    expect(correlationEventAnchor('906-00171/2026')).toBe(
      'corr-ro-906-00171-2026',
    )
  })
})

describe('plate-profile/vehicle', () => {
  it('descreve o veículo numa linha, com o cadastro PRF quando há', () => {
    expect(
      vehicleLine({
        vehicle_type: 'MOTOCICLETA',
        vehicle_type_source: 'PRF',
        vehicle_color: 'PRETA',
        vehicle_model: 'HONDA/CG 160 FAN',
        model_year: 2022,
      }),
    ).toBe('HONDA/CG 160 FAN · Motocicleta preta · 2022')
    expect(
      vehicleLine({
        vehicle_type: 'AUTOMOVEL',
        vehicle_type_source: 'tipoveiculo',
      }),
    ).toBe('Carro')
    expect(vehicleLine({})).toBe('Sem cadastro PRF')
  })

  it('traduz o tipo do cadastro PRF', () => {
    expect(vehicleTypeLabel('CAMINHAO TRATOR')).toBe('Caminhão trator')
    expect(vehicleTypeLabel('Automóvel')).toBe('Carro')
    expect(vehicleTypeLabel(null)).toBeNull()
  })
})
