import { formatVehiclePrf, type VehiclePrf } from '@/utils/vehicle-prf'

const vehicle: VehiclePrf = {
  placa: 'IFX4382',
  tipo_veiculo_prf: 'Carro',
  marca_modelo_prf: 'Volkswagen Gol',
  cor_veiculo_prf: 'Prata',
  ano_fabricacao_prf: 2020,
  ano_modelo_prf: 2021,
}

describe('formatVehiclePrf', () => {
  it('formats vehicle data in the requested field order', () => {
    expect(formatVehiclePrf(vehicle)).toBe(
      'Carro - Volkswagen Gol - Prata - 2020/2021',
    )
  })

  it('omits unavailable fields without dangling separators', () => {
    expect(
      formatVehiclePrf({
        ...vehicle,
        tipo_veiculo_prf: null,
        cor_veiculo_prf: ' ',
        ano_fabricacao_prf: null,
      }),
    ).toBe('Volkswagen Gol - 2021')
  })

  it('uses a fallback when all vehicle fields are unavailable', () => {
    expect(formatVehiclePrf(null)).toBe(
      'Nenhuma informação do veículo encontrada.',
    )
    expect(
      formatVehiclePrf({
        placa: 'IFX4382',
        tipo_veiculo_prf: null,
        cor_veiculo_prf: null,
        marca_modelo_prf: null,
        ano_modelo_prf: null,
        ano_fabricacao_prf: null,
      }),
    ).toBe('Nenhuma informação do veículo encontrada.')
  })
})
