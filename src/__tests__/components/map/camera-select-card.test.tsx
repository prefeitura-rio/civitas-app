import { fireEvent, render, screen } from '@testing-library/react'

import { CameraSelectCard } from '@/app/(app)/veiculos/components/map/components/select-cards/camera-select-card'
import type { CameraCOR } from '@/models/entities'

jest.mock('@/utils/string-extensions', () => ({
  capitalizeFirstLetter: jest.fn(
    (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  ),
}))

const mockWindowOpen = jest.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
})

describe('CameraSelectCard', () => {
  const mockCamera: CameraCOR = {
    code: 'CAM001',
    location: 'centro',
    zone: 'zona sul',
    streamingUrl: 'https://example.com/stream',
    longitude: -43.1729,
    latitude: -22.9068,
  }

  const mockCameraWithoutStreaming: CameraCOR = {
    code: 'CAM002',
    location: 'botafogo',
    zone: 'zona sul',
    streamingUrl: '',
    longitude: -43.1729,
    latitude: -22.9068,
  }

  const defaultProps = {
    selectedObject: null,
    setSelectedObject: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should be hidden when no camera is selected', () => {
      render(<CameraSelectCard {...defaultProps} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('hidden')
    })

    it('should display when a camera is selected', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).not.toHaveClass('hidden')
    })

    it('should display camera code correctly in title', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Câmera')).toBeInTheDocument()
      const codeElements = screen.getAllByText('CAM001')
      expect(codeElements).toHaveLength(1)
    })

    it('should display camera location and zone', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Localização')).toBeInTheDocument()
      expect(screen.getByText('Centro')).toBeInTheDocument()
      expect(screen.getByText('Zona')).toBeInTheDocument()
      expect(screen.getByText('Zona Sul')).toBeInTheDocument()
    })

    it('should display camera latitude and longitude', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Latitude')).toBeInTheDocument()
      expect(screen.getByText('-22.906800')).toBeInTheDocument()
      expect(screen.getByText('Longitude')).toBeInTheDocument()
      expect(screen.getByText('-43.172900')).toBeInTheDocument()
    })

    it('should display camera code in information section', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Código')).toBeInTheDocument()
      const codeElements = screen.getAllByText('CAM001')
      expect(codeElements).toHaveLength(1)
    })
  })

  describe('close button functionality', () => {
    it('should call setSelectedObject with null when close button is clicked', () => {
      const mockSetSelectedObject = jest.fn()
      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCamera}
          setSelectedObject={mockSetSelectedObject}
        />,
      )

      const closeButton = screen.getAllByRole('button')[0]
      fireEvent.click(closeButton)

      expect(mockSetSelectedObject).toHaveBeenCalledWith(null)
    })

    it('should display X icon in close button', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const closeButton = screen.getAllByRole('button')[0]
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('streaming functionality', () => {
    it('should display streaming button when streamingUrl is available', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Abrir Streaming')).toBeInTheDocument()
    })

    it('should open streaming in new tab when button is clicked', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const streamingButton = screen.getByText('Abrir Streaming')
      fireEvent.click(streamingButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/stream',
        '_blank',
      )
    })

    it('should not display streaming button when streamingUrl is not available', () => {
      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithoutStreaming}
        />,
      )

      expect(screen.queryByText('Abrir Streaming')).not.toBeInTheDocument()
    })
  })

  describe('positioning and styling', () => {
    it('should have correct positioning classes', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('absolute', 'left-2', 'top-2', 'w-[400px]')
    })

    it('should have correct tracking style', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('tracking-tighter')
    })
  })

  describe('undefined/null values', () => {
    it('should handle undefined values gracefully', () => {
      const mockCameraWithUndefined: CameraCOR = {
        code: 'CAM003',
        location: 'teste',
        zone: 'teste',
        streamingUrl: '',
        longitude: -43.1729,
        latitude: -22.9068,
      }

      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithUndefined}
        />,
      )

      expect(screen.getByText('Câmera')).toBeInTheDocument()
      const codeElements = screen.getAllByText('CAM003')
      expect(codeElements).toHaveLength(1)
      const testeElements = screen.getAllByText('Teste')
      expect(testeElements.length).toBeGreaterThanOrEqual(2) // Location and Zone fields
    })

    it('should handle null values gracefully', () => {
      const mockCameraWithNull: CameraCOR = {
        code: 'CAM004',
        location: 'teste',
        zone: 'teste',
        streamingUrl: '',
        longitude: -43.1729,
        latitude: -22.9068,
      }

      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithNull}
        />,
      )

      expect(screen.getByText('Câmera')).toBeInTheDocument()
      const codeElements = screen.getAllByText('CAM004')
      expect(codeElements).toHaveLength(1)
      const testeElements = screen.getAllByText('Teste')
      expect(testeElements.length).toBeGreaterThanOrEqual(2) // Location and Zone fields
    })
  })
})
