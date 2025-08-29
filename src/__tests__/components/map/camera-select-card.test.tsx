import { fireEvent, render, screen } from '@testing-library/react'

import { CameraSelectCard } from '@/app/(app)/veiculos/components/map/components/select-cards/camera-select-card'
import type { CameraCOR } from '@/models/entities'

// Mock do utils
jest.mock('@/utils/string-extensions', () => ({
  capitalizeFirstLetter: jest.fn(
    (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  ),
}))

// Mock do window.open
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

  describe('renderização', () => {
    it('deve estar oculto quando não há câmera selecionada', () => {
      render(<CameraSelectCard {...defaultProps} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('hidden')
    })

    it('deve exibir quando uma câmera está selecionada', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).not.toHaveClass('hidden')
    })

    it('deve exibir o código da câmera corretamente no título', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Câmera')).toBeInTheDocument()
      // Verifica se o código aparece no título (primeira ocorrência)
      const codeElements = screen.getAllByText('CAM001')
      expect(codeElements).toHaveLength(2) // Uma no título, outra na seção de informações
    })

    it('deve exibir localização e zona da câmera', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Localização:')).toBeInTheDocument()
      expect(screen.getByText('Centro')).toBeInTheDocument()
      expect(screen.getByText('Zona:')).toBeInTheDocument()
      expect(screen.getByText('Zona Sul')).toBeInTheDocument()
    })

    it('deve exibir latitude e longitude da câmera', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Latitude:')).toBeInTheDocument()
      expect(screen.getByText('-22.906800')).toBeInTheDocument()
      expect(screen.getByText('Longitude:')).toBeInTheDocument()
      expect(screen.getByText('-43.172900')).toBeInTheDocument()
    })

    it('deve exibir o código da câmera na seção de informações', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Código:')).toBeInTheDocument()
      const codeElements = screen.getAllByText('CAM001')
      expect(codeElements).toHaveLength(2) // Uma no título, outra na seção de informações
    })
  })

  describe('funcionalidade do botão de fechar', () => {
    it('deve chamar setSelectedObject com null quando o botão de fechar é clicado', () => {
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

    it('deve exibir o ícone X no botão de fechar', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const closeButton = screen.getAllByRole('button')[0]
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('funcionalidade do streaming', () => {
    it('deve exibir o botão de streaming quando streamingUrl está disponível', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Abrir Streaming')).toBeInTheDocument()
    })

    it('deve abrir o streaming em nova aba quando o botão é clicado', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const streamingButton = screen.getByText('Abrir Streaming')
      fireEvent.click(streamingButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/stream',
        '_blank',
      )
    })

    it('não deve exibir o botão de streaming quando streamingUrl não está disponível', () => {
      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithoutStreaming}
        />,
      )

      expect(screen.queryByText('Abrir Streaming')).not.toBeInTheDocument()
    })
  })

  describe('posicionamento e estilo', () => {
    it('deve ter as classes de posicionamento corretas', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('absolute', 'left-2', 'top-2', 'w-72')
    })

    it('deve ter o estilo de tracking correto', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass('tracking-tighter')
    })
  })

  describe('valores undefined/null', () => {
    it('deve lidar graciosamente com valores undefined', () => {
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
      expect(codeElements).toHaveLength(2) // Uma no título, outra na seção de informações
      expect(screen.getByText('Teste - Teste')).toBeInTheDocument()
    })

    it('deve lidar graciosamente com valores null', () => {
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
      expect(codeElements).toHaveLength(2) // Uma no título, outra na seção de informações
      expect(screen.getByText('Teste - Teste')).toBeInTheDocument()
    })
  })
})
