import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { SearchByRadarForm } from '@/app/(app)/veiculos/busca-por-radar/components/search-by-radar-form'
import type { Radar } from '@/models/entities'

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock do contexto do mapa
const mockSetSelectedObjects = jest.fn()
const mockSetViewport = jest.fn()

const mockUseMap = jest.fn()

jest.mock('@/hooks/useContexts/use-map-context', () => ({
  useMap: () => mockUseMap(),
}))

// Mock do hook de parâmetros de busca
jest.mock('@/hooks/useParams/useCarRadarSearchParams', () => ({
  useCarRadarSearchParams: () => ({
    formattedSearchParams: {
      date: {
        from: '2024-01-01',
        to: '2024-01-31',
      },
    },
  }),
}))

const mockRadar: Radar = {
  cetRioCode: '0540461121',
  location: 'ESTRADA DOS BANDEIRANTES PROXIMO A ESTACAO BRT MERCK',
  district: 'centro',
  latitude: -22.9068,
  longitude: -43.1729,
  company: 'CET-Rio',
  activeInLast24Hours: true,
  lastDetectionTime: '2024-01-15T10:30:00Z',
  streetName: 'Estrada dos Bandeirantes',
  hasData: true,
  direction: 'norte',
  lane: 'direita',
  streetNumber: '123',
}

const mockRadar2: Radar = {
  ...mockRadar,
  cetRioCode: '0540461123',
  location:
    'ESTRADA DOS BANDEIRANTES PROXIMO A ESTACAO BRT MERCK - SENTIDO TANQUE',
}

describe('SearchByRadarForm', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('deve exibir lista de radares selecionados', () => {
    // Mock com radares selecionados
    mockUseMap.mockReturnValue({
      layers: {
        radars: {
          selectedObjects: [mockRadar, mockRadar2],
          setSelectedObjects: mockSetSelectedObjects,
          data: [mockRadar, mockRadar2],
        },
      },
      setViewport: mockSetViewport,
    })

    render(<SearchByRadarForm />)

    // Abrir o popover
    const radarButton = screen.getByText('Radares (2)')
    fireEvent.click(radarButton)

    // Verificar se os radares aparecem na lista
    expect(screen.getByText('0540461121')).toBeInTheDocument()
    expect(screen.getByText('0540461123')).toBeInTheDocument()
    expect(
      screen.getByText('ESTRADA DOS BANDEIRANTES PROXIMO A ESTACAO BRT MERCK'),
    ).toBeInTheDocument()
  })

  it('deve exibir contador correto de radares selecionados', () => {
    // Mock com diferentes quantidades de radares
    mockUseMap.mockReturnValue({
      layers: {
        radars: {
          selectedObjects: [mockRadar, mockRadar2],
          setSelectedObjects: mockSetSelectedObjects,
          data: [mockRadar, mockRadar2],
        },
      },
      setViewport: mockSetViewport,
    })

    render(<SearchByRadarForm />)

    // Verificar se o contador está correto
    expect(screen.getByText('Radares (2)')).toBeInTheDocument()
  })

  it('deve renderizar o formulário sem erros', () => {
    // Mock básico
    mockUseMap.mockReturnValue({
      layers: {
        radars: {
          selectedObjects: [],
          setSelectedObjects: mockSetSelectedObjects,
          data: [],
        },
      },
      setViewport: mockSetViewport,
    })

    render(<SearchByRadarForm />)

    // Verificar se o formulário renderiza
    expect(screen.getByText('Radares (0)')).toBeInTheDocument()
    expect(screen.getByText('Buscar')).toBeInTheDocument()
  })
})
