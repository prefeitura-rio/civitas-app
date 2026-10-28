import { renderHook } from '@testing-library/react'

import { useReportVehicle } from '@/hooks/useQueries/useReportVehicle'
import { useVehicle } from '@/hooks/useQueries/useVehicle'
import { useVehiclePrf } from '@/hooks/useQueries/useVehiclePrf'
import type { Vehicle } from '@/models/entities'
import { formatReportVehicle, type VehiclePrf } from '@/utils/vehicle-prf'

jest.mock('@/hooks/useQueries/useVehicle', () => ({ useVehicle: jest.fn() }))
jest.mock('@/hooks/useQueries/useVehiclePrf', () => ({
  useVehiclePrf: jest.fn(),
}))

const cortexQuery = jest.mocked(useVehicle)
const prfQuery = jest.mocked(useVehiclePrf)
const cortexVehicle = {
  tipoVeiculo: 'Automóvel',
  marcaModelo: 'Modelo Cortex',
  cor: 'Azul',
  anoFabricacao: '2020',
  anoModelo: '2021',
} as Vehicle
const prfVehicle: VehiclePrf = {
  placa: 'ABC1D23',
  tipo_veiculo_prf: 'Carro',
  marca_modelo_prf: 'Modelo PRF',
  cor_veiculo_prf: 'Prata',
  ano_fabricacao_prf: 2019,
  ano_modelo_prf: 2020,
}

beforeEach(() => jest.clearAllMocks())

it('uses Cortex data in reports without requesting PRF', () => {
  cortexQuery.mockReturnValue({
    data: cortexVehicle,
    isPending: false,
  } as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({ isPending: true } as ReturnType<
    typeof useVehiclePrf
  >)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(cortexQuery).toHaveBeenCalledWith('ABC1D23', true)
  expect(prfQuery).toHaveBeenCalledWith('ABC1D23', false)
  expect(result.current.vehicle).toBe(cortexVehicle)
  expect(result.current.isPending).toBe(false)
  expect(formatReportVehicle(result.current.vehicle)).toBe(
    'Automóvel - Modelo Cortex - Azul - 2020/2021',
  )
})

it('uses PRF after Cortex returns no vehicle', () => {
  cortexQuery.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({
    data: prfVehicle,
    isPending: false,
  } as ReturnType<typeof useVehiclePrf>)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(prfQuery).toHaveBeenCalledWith('ABC1D23', true)
  expect(result.current.vehicle).toBe(prfVehicle)
  expect(formatReportVehicle(result.current.vehicle)).toBe(
    'Carro - Modelo PRF - Prata - 2019/2020',
  )
})

it('waits for Cortex before enabling PRF', () => {
  cortexQuery.mockReturnValue({
    data: undefined,
    isPending: true,
  } as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({ isPending: true } as ReturnType<
    typeof useVehiclePrf
  >)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(prfQuery).toHaveBeenCalledWith('ABC1D23', false)
  expect(result.current.isPending).toBe(true)
})

it('waits for PRF before reporting that vehicle data is absent', () => {
  cortexQuery.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({
    data: undefined,
    isPending: true,
  } as ReturnType<typeof useVehiclePrf>)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(result.current.isPending).toBe(true)
  expect(formatReportVehicle(result.current.vehicle)).toBe(
    'Nenhuma informação do veículo encontrada.',
  )
})

it('does not request PRF after a Cortex access denial', () => {
  cortexQuery.mockReturnValue({
    data: undefined,
    error: { isAxiosError: true, response: { status: 451 } },
    isPending: false,
  } as unknown as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({ isPending: true } as ReturnType<
    typeof useVehiclePrf
  >)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(prfQuery).toHaveBeenCalledWith('ABC1D23', false)
  expect(result.current.vehicle).toBeUndefined()
  expect(result.current.isPending).toBe(false)
})

it('shows absence only after both sources have no data', () => {
  cortexQuery.mockReturnValue({
    data: undefined,
    error: new Error('Cortex unavailable'),
    isPending: false,
  } as ReturnType<typeof useVehicle>)
  prfQuery.mockReturnValue({
    data: null,
    isPending: false,
  } as ReturnType<typeof useVehiclePrf>)

  const { result } = renderHook(() => useReportVehicle('ABC1D23'))

  expect(prfQuery).toHaveBeenCalledWith('ABC1D23', true)
  expect(formatReportVehicle(result.current.vehicle)).toBe(
    'Nenhuma informação do veículo encontrada.',
  )
})
