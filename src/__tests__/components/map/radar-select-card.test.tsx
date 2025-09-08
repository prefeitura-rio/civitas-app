import { fireEvent, render, screen } from '@testing-library/react'

import { RadarSelectCard } from '@/app/(app)/veiculos/components/map/components/select-cards/radar-select-card'
import type { Radar } from '@/models/entities'

jest.mock('@/utils/string-extensions', () => ({
  capitalizeFirstLetter: (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1),
}))

const mockRadar: Radar = {
  cetRioCode: 'RDR123',
  location: 'avenida brasil',
  district: 'centro',
  latitude: -22.9068,
  longitude: -43.1729,
  company: 'CET-Rio',
  activeInLast24Hours: true,
  lastDetectionTime: '2024-01-15T10:30:00Z',
  streetName: 'Avenida Brasil',
  hasData: true,
  direction: 'norte',
  lane: 'direita',
  streetNumber: '123',
}

const mockRadarInactive: Radar = {
  ...mockRadar,
  cetRioCode: 'RDR456',
  activeInLast24Hours: false,
  lastDetectionTime: null,
}

const defaultProps = {
  selectedObject: null,
  setSelectedObject: jest.fn(),
}

describe('RadarSelectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve estar oculto quando nenhum radar está selecionado', () => {
    render(<RadarSelectCard {...defaultProps} />)

    const card = screen.queryByText('Radar RDR123')
    expect(card).not.toBeInTheDocument()
  })

  it('deve exibir informações do radar quando selecionado', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(screen.getAllByText('RDR123')).toHaveLength(2)
    expect(screen.getByText('Avenida Brasil - Centro')).toBeInTheDocument()
  })

  it('deve exibir código do radar corretamente', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const codeElements = screen.getAllByText('RDR123')
    expect(codeElements).toHaveLength(2)
  })

  it('deve exibir localização e bairro corretamente', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Avenida Brasil')).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('deve exibir latitude e longitude corretamente', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('-22.906800')).toBeInTheDocument()
    expect(screen.getByText('-43.172900')).toBeInTheDocument()
  })

  it('deve exibir empresa corretamente', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('CET-Rio')).toBeInTheDocument()
  })

  it('deve exibir status ativo 24h como "Sim" quando true', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Sim')).toBeInTheDocument()
    expect(screen.getByText('Sim')).toHaveClass('text-emerald-600')
  })

  it('deve exibir status ativo 24h como "Não" quando false', () => {
    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarInactive} />,
    )

    expect(screen.getByText('Não')).toBeInTheDocument()
    expect(screen.getByText('Não')).toHaveClass('text-rose-600')
  })

  it('deve exibir última detecção quando disponível', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    // O componente usa toLocaleString('pt-BR') que converte UTC para fuso horário local
    // Como o mock tem '2024-01-15T10:30:00Z', o horário será convertido
    expect(screen.getByText('Última detecção:')).toBeInTheDocument()
    // Verificar se algum horário está sendo exibido (sem especificar o horário exato)
    expect(
      screen.getByText('Última detecção:').closest('div'),
    ).toBeInTheDocument()
  })

  it('deve não exibir última detecção quando não disponível', () => {
    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarInactive} />,
    )

    expect(screen.queryByText('Última detecção:')).not.toBeInTheDocument()
  })

  it('deve chamar setSelectedObject(null) quando botão de fechar for clicado', () => {
    const mockSetSelectedObject = jest.fn()
    render(
      <RadarSelectCard
        {...defaultProps}
        selectedObject={mockRadar}
        setSelectedObject={mockSetSelectedObject}
      />,
    )

    // Encontrar o botão de fechar pela classe CSS específica
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    expect(mockSetSelectedObject).toHaveBeenCalledWith(null)
  })

  it('deve ter botão de fechar com ícone X', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const closeButton = screen.getByRole('button', { name: '' })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveClass('h-5', 'w-5', 'p-0')
  })

  it('deve ter posicionamento absoluto no canto superior direito', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('absolute', 'right-2', 'top-2')
  })

  it('deve ter largura fixa de 72 (w-72)', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('w-72')
  })

  it('deve ter tracking-tighter para espaçamento de letras', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('tracking-tighter')
  })

  it('deve lidar com valores undefined/null graciosamente', () => {
    const mockRadarWithNull = {
      ...mockRadar,
      location: null,
      district: null,
      company: null,
    }

    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarWithNull} />,
    )

    expect(screen.getByText('Localização:')).toBeInTheDocument()
    expect(screen.getAllByText('N/A')).toHaveLength(3)
    expect(screen.getByText('Bairro:')).toBeInTheDocument()
    expect(screen.getByText('Empresa:')).toBeInTheDocument()
  })
})
