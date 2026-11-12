import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import type { VehicleFields } from '@/modules/vehicle-intelligence/lib/prf'

/** Cores do cadastro PRF para o quadradinho do veículo. */
export const PRF_COLORS: Record<string, string> = {
  PRETA: '#111416',
  BRANCA: '#f2f4f5',
  PRATA: '#b8c0c4',
  CINZA: '#7d878c',
  VERMELHA: '#c0392b',
  AZUL: '#2f6fb5',
  AMARELA: '#e5c03a',
  VERDE: '#3f8f5a',
  MARROM: '#6b4a32',
  BEGE: '#d8c7a3',
  DOURADA: '#c9a447',
  LARANJA: '#e07b2c',
  ROXA: '#6f4a9b',
  ROSA: '#e08aa8',
  VINHO: '#6d2233',
  FANTASIA: 'linear-gradient(135deg,#e5c03a,#2f6fb5,#c0392b)',
}

/** Tipo do cadastro PRF (sem acento na origem) como texto. */
const PRF_TYPES: Record<string, string> = {
  AUTOMOVEL: 'Automóvel',
  CAMINHAO: 'Caminhão',
  'CAMINHAO TRATOR': 'Caminhão trator',
  UTILITARIO: 'Utilitário',
  ONIBUS: 'Ônibus',
  MICROONIBUS: 'Micro-ônibus',
  'SEMI-REBOQUE': 'Semirreboque',
  'MOTOR-CASA': 'Motor-casa',
}

const prfTypeText = (value: string) =>
  PRF_TYPES[value.toUpperCase()] ?? titleCase(value.toLowerCase())

/** "Carro" para automóvel; os outros tipos como no cadastro PRF. */
export function vehicleTypeLabel(
  type: string | null | undefined,
): string | null {
  if (!type) return null
  return ['AUTOMOVEL', 'AUTOMÓVEL'].includes(type.toUpperCase())
    ? 'Carro'
    : prfTypeText(type)
}

/** O veículo numa linha (cabeçalho do perfil): "HONDA/CG 160 FAN · Motocicleta preta · 2022"; sem PRF, o tipo lido. */
export function vehicleLine(vehicle: VehicleFields): string {
  const type = vehicleTypeLabel(vehicle.vehicle_type)
  if (vehicle.vehicle_type_source !== 'PRF') return type ?? 'Sem cadastro PRF'
  const typeAndColor = [type, vehicle.vehicle_color?.toLowerCase()]
    .filter(Boolean)
    .join(' ')
  return (
    [vehicle.vehicle_model, typeAndColor, vehicle.model_year]
      .filter(Boolean)
      .join(' · ') || 'Sem cadastro PRF'
  )
}
