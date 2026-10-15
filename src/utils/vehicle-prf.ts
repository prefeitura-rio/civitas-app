export type VehiclePrf = {
  placa: string
  tipo_veiculo_prf: string | null
  cor_veiculo_prf: string | null
  marca_modelo_prf: string | null
  ano_modelo_prf: number | null
  ano_fabricacao_prf: number | null
}

export function formatVehiclePrf(
  vehicle: VehiclePrf | null | undefined,
): string {
  if (!vehicle) return 'Nenhuma informação do veículo encontrada.'

  const year = [vehicle.ano_fabricacao_prf, vehicle.ano_modelo_prf]
    .map((value) => value?.toString().trim())
    .filter(Boolean)
    .join('/')

  return (
    [
      vehicle.tipo_veiculo_prf,
      vehicle.marca_modelo_prf,
      vehicle.cor_veiculo_prf,
      year,
    ]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' - ') || 'Nenhuma informação do veículo encontrada.'
  )
}
