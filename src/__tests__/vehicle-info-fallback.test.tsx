import { render, screen } from '@testing-library/react'

import { VehicleInfo } from '@/app/(app)/veiculos/busca-por-placa/veiculo/components/trip-list/components/vehicle-info'
import { useVehicle } from '@/hooks/useQueries/useVehicle'
import { useVehiclePrf } from '@/hooks/useQueries/useVehiclePrf'

jest.mock('@/hooks/useQueries/useVehicle', () => ({ useVehicle: jest.fn() }))
jest.mock('@/hooks/useQueries/useVehiclePrf', () => ({
  useVehiclePrf: jest.fn(),
}))

const cortexQuery = jest.mocked(useVehicle)
const vehiclePrfQuery = jest.mocked(useVehiclePrf)

describe('VehicleInfo fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows only basic vehicle fields when Cortex has no data', () => {
    cortexQuery.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: {
        placa: 'ABC1D23',
        marca_modelo_prf: 'Modelo X',
        cor_veiculo_prf: 'PRETA',
        ano_modelo_prf: 2022,
        ano_fabricacao_prf: 2021,
        tipo_veiculo_prf: 'AUTOMOVEL',
      },
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', true)
    expect(screen.getByText('Modelo X')).toBeInTheDocument()
    expect(screen.getByText('PRETA')).toBeInTheDocument()
    expect(screen.getByText('2022')).toBeInTheDocument()
    expect(screen.queryByText(/Restrições/)).not.toBeInTheDocument()
    expect(screen.queryByText('Ver mais...')).not.toBeInTheDocument()
  })

  it('shows an empty message only after both sources return no vehicle data', () => {
    cortexQuery.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: null,
      error: null,
      isPending: false,
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma informação do veículo encontrada.',
    )
    expect(screen.queryByText('Ver mais...')).not.toBeInTheDocument()
  })

  it('distinguishes a failed fallback request from an empty result', () => {
    cortexQuery.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isPending: false,
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Não foi possível carregar as informações do veículo.',
    )
  })

  it('waits for Cortex before enabling the fallback', () => {
    cortexQuery.mockReturnValue({
      data: undefined,
      isPending: true,
    } as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: {
        placa: 'ABC1D23',
        marca_modelo_prf: 'Dado em cache',
        cor_veiculo_prf: null,
        ano_modelo_prf: null,
        ano_fabricacao_prf: null,
        tipo_veiculo_prf: null,
      },
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', false)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Procurando informações do veículo...',
    )
    expect(screen.queryByText('Dado em cache')).not.toBeInTheDocument()
  })

  it('keeps the loading message while checking the fallback source', () => {
    cortexQuery.mockReturnValue({
      data: undefined,
      isPending: false,
    } as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: undefined,
      isPending: true,
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', true)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Procurando informações do veículo...',
    )
  })

  it('keeps the full Cortex view when Cortex returns a vehicle', () => {
    cortexQuery.mockReturnValue({
      data: {
        marcaModelo: 'Modelo Cortex',
        cor: 'AZUL',
        anoModelo: '2023',
        restricao: [],
        possuidor: { nomePossuidor: 'Possuidor' },
        proprietario: { nomeProprietario: 'Proprietário' },
        arrendatario: {},
        indiceNacionalVeiculos: [],
      },
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({ data: undefined } as ReturnType<
      typeof useVehiclePrf
    >)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', false)
    expect(screen.getByText('Modelo Cortex')).toBeInTheDocument()
    expect(screen.getByText('Restrições:')).toBeInTheDocument()
    expect(screen.getByText('Ver mais...')).toBeInTheDocument()
  })

  it('does not use fallback when Cortex denies access', () => {
    cortexQuery.mockReturnValue({
      data: undefined,
      error: { isAxiosError: true, response: { status: 451 } },
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({ data: undefined } as ReturnType<
      typeof useVehiclePrf
    >)

    const { container } = render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', false)
    expect(container.firstChild).toBeNull()
  })

  it('uses PRF when the Cortex endpoint returns an internal error', () => {
    cortexQuery.mockReturnValue({
      data: undefined,
      error: { isAxiosError: true, response: { status: 500 } },
      isPending: false,
    } as unknown as ReturnType<typeof useVehicle>)
    vehiclePrfQuery.mockReturnValue({
      data: {
        placa: 'ABC1D23',
        marca_modelo_prf: 'Modelo PRF',
        cor_veiculo_prf: null,
        ano_modelo_prf: null,
        ano_fabricacao_prf: null,
        tipo_veiculo_prf: null,
      },
      isPending: false,
    } as ReturnType<typeof useVehiclePrf>)

    render(<VehicleInfo plate="ABC1D23" />)

    expect(vehiclePrfQuery).toHaveBeenCalledWith('ABC1D23', true)
    expect(screen.getByText('Modelo PRF')).toBeInTheDocument()
    expect(screen.getByText('Fonte: PRF')).toBeInTheDocument()
  })
})
