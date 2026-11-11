/**
 * Campos de veículo da placa, iguais nos três recortes: o motor devolve o
 * cadastro PRF ou, sem ele, o tipo mais lido pelos equipamentos
 * (`vehicle_type_source` = "tipoveiculo").
 */
export type VehicleFields = {
  vehicle_type?: string | null
  vehicle_type_share?: number | null
  vehicle_type_source?: string | null
  vehicle_color?: string | null
  vehicle_model?: string | null
  manufacture_year?: number | null
  model_year?: number | null
}
