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

  it('should be hidden when no radar is selected', () => {
    render(<RadarSelectCard {...defaultProps} />)

    const card = screen.queryByText('Radar RDR123')
    expect(card).not.toBeInTheDocument()
  })

  it('should display radar information when selected', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Radar OCR')).toBeInTheDocument()
    expect(screen.getAllByText('RDR123')).toHaveLength(1)
    expect(screen.getByText('avenida brasil - centro')).toBeInTheDocument()
  })

  it('should display radar code correctly', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const codeElements = screen.getAllByText('RDR123')
    expect(codeElements).toHaveLength(1)
  })

  it('should display location and district correctly', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('avenida brasil - centro')).toBeInTheDocument()
  })

  it('should display latitude and longitude correctly', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('-22.9068')).toBeInTheDocument()
    expect(screen.getByText('-43.1729')).toBeInTheDocument()
  })

  it('should display company correctly', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('CET-Rio')).toBeInTheDocument()
  })

  it('should display 24h active status as "Sim" when true', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Sim')).toBeInTheDocument()
    expect(screen.getByText('Sim')).toHaveClass('text-emerald-600')
  })

  it('should display 24h active status as "Não" when false', () => {
    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarInactive} />,
    )

    expect(screen.getByText('Atenção!')).toBeInTheDocument()
  })

  it('should display last detection when available', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    expect(screen.getByText('Última detecção')).toBeInTheDocument()
    expect(
      screen.getByText(/15\/01\/2024 às \d{2}:\d{2}:\d{2}/),
    ).toBeInTheDocument()
  })

  it('should not display last detection when not available', () => {
    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarInactive} />,
    )

    expect(screen.queryByText('Última detecção:')).not.toBeInTheDocument()
  })

  it('should call setSelectedObject(null) when close button is clicked', () => {
    const mockSetSelectedObject = jest.fn()
    render(
      <RadarSelectCard
        {...defaultProps}
        selectedObject={mockRadar}
        setSelectedObject={mockSetSelectedObject}
      />,
    )

    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    expect(mockSetSelectedObject).toHaveBeenCalledWith(null)
  })

  it('should have close button with X icon', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const closeButton = screen.getByRole('button', { name: '' })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveClass('h-5', 'w-5', 'p-0')
  })

  it('should have absolute positioning in top right corner', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar OCR').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('absolute', 'right-2', 'top-2')
  })

  it('should have fixed width of 72 (w-72)', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar OCR').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('w-72')
  })

  it('should have tracking-tighter for letter spacing', () => {
    render(<RadarSelectCard {...defaultProps} selectedObject={mockRadar} />)

    const card = screen.getByText('Radar OCR').closest('div')
      ?.parentElement?.parentElement
    expect(card).toHaveClass('tracking-tighter')
  })

  it('should handle undefined/null values gracefully', () => {
    const mockRadarWithNull = {
      ...mockRadar,
      location: null,
      district: null,
      company: null,
    }

    render(
      <RadarSelectCard {...defaultProps} selectedObject={mockRadarWithNull} />,
    )

    expect(screen.getByText('Localização')).toBeInTheDocument()
    expect(screen.getByText('null - null')).toBeInTheDocument()
    expect(screen.getByText('Empresa')).toBeInTheDocument()
  })
})
