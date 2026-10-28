import type { Vehicle } from '@/models/entities'

export type VehiclePrf = {
  placa: string
  tipo_veiculo_prf: string | null
  cor_veiculo_prf: string | null
  marca_modelo_prf: string | null
  ano_modelo_prf: number | null
  ano_fabricacao_prf: number | null
}

export type ReportVehicle = Vehicle | VehiclePrf

export function formatReportVehicle(
  vehicle: ReportVehicle | null | undefined,
): string {
  if (!vehicle) return 'Nenhuma informação do veículo encontrada.'
  const isPrf = 'marca_modelo_prf' in vehicle
  const fields = isPrf
    ? [
        vehicle.tipo_veiculo_prf,
        vehicle.marca_modelo_prf,
        vehicle.cor_veiculo_prf,
      ]
    : [vehicle.tipoVeiculo, vehicle.marcaModelo, vehicle.cor]
  const years = isPrf
    ? [vehicle.ano_fabricacao_prf, vehicle.ano_modelo_prf]
    : [vehicle.anoFabricacao, vehicle.anoModelo]
  const year = years
    .map((value) => (value == null ? '' : String(value).trim()))
    .filter(Boolean)
    .join('/')

  return (
    [...fields, year]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' - ') || 'Nenhuma informação do veículo encontrada.'
  )
}
