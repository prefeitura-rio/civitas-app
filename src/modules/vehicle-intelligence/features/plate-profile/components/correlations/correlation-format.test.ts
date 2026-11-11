import {
  cispUnitLabel,
  cloneTemperatureLabel,
  correlationEventAnchor,
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
