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

      const codeLabels = screen.getAllByText('CAM001')
      expect(codeLabels).toHaveLength(2) // Uma no título, outra na seção de informações
    })
  })

  describe('funcionalidade do botão fechar', () => {
    it('deve chamar setSelectedObject com null quando clicado', () => {
      const mockSetSelectedObject = jest.fn()

      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCamera}
          setSelectedObject={mockSetSelectedObject}
        />,
      )

      // O botão de fechar é o primeiro botão (sem nome acessível)
      const closeButton = screen.getAllByRole('button')[0]
      fireEvent.click(closeButton)

      expect(mockSetSelectedObject).toHaveBeenCalledWith(null)
    })
  })

  describe('botão de streaming', () => {
    it('deve exibir botão de streaming quando streamingUrl existe', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      expect(screen.getByText('Abrir Streaming')).toBeInTheDocument()
    })

    it('não deve exibir botão de streaming quando streamingUrl não existe', () => {
      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithoutStreaming}
        />,
      )

      expect(screen.queryByText('Abrir Streaming')).not.toBeInTheDocument()
    })

    it('deve abrir streaming em nova aba quando clicado', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const streamingButton = screen.getByText('Abrir Streaming')
      fireEvent.click(streamingButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com/stream',
        '_blank',
      )
    })
  })

  describe('estrutura do card', () => {
    it('deve ter layout responsivo com classes corretas', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const card = screen.getByText('Câmera').closest('div')
        ?.parentElement?.parentElement
      expect(card).toHaveClass(
        'absolute',
        'left-2',
        'top-2',
        'w-72',
        'tracking-tighter',
      )
    })

    it('deve ter informações organizadas em layout flexível', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const infoContainer = screen
        .getByText('Código:')
        .closest('div')?.parentElement
      expect(infoContainer).toHaveClass('space-y-2', 'text-sm')
    })

    it('deve ter botão de fechar posicionado corretamente', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const closeButton = screen.getAllByRole('button')[0]
      expect(closeButton).toHaveClass(
        'absolute',
        'right-1',
        'top-1',
        'h-5',
        'w-5',
        'p-0',
      )
    })
  })

  describe('acessibilidade', () => {
    it('deve ter botão de fechar com ícone X', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const closeButton = screen.getAllByRole('button')[0]
      expect(closeButton).toBeInTheDocument()
      // Verifica se o ícone X está presente
      expect(closeButton.querySelector('svg')).toBeInTheDocument()
    })

    it('deve ter botão de streaming com texto descritivo', () => {
      render(<CameraSelectCard {...defaultProps} selectedObject={mockCamera} />)

      const streamingButton = screen.getByRole('button', {
        name: 'Abrir Streaming',
      })
      expect(streamingButton).toBeInTheDocument()
    })
  })

  describe('casos edge', () => {
    it('deve lidar com câmera sem streamingUrl', () => {
      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={mockCameraWithoutStreaming}
        />,
      )

      // Deve exibir informações básicas
      const codeLabels = screen.getAllByText('CAM002')
      expect(codeLabels).toHaveLength(2) // Uma no título, outra na seção de informações
      expect(screen.getByText('Botafogo')).toBeInTheDocument()

      // Não deve exibir botão de streaming
      expect(screen.queryByText('Abrir Streaming')).not.toBeInTheDocument()
    })

    it('deve lidar com câmera com streamingUrl vazio', () => {
      const cameraWithEmptyStreaming = {
        ...mockCamera,
        streamingUrl: '',
      }

      render(
        <CameraSelectCard
          {...defaultProps}
          selectedObject={cameraWithEmptyStreaming}
        />,
      )

      // Não deve exibir botão de streaming
      expect(screen.queryByText('Abrir Streaming')).not.toBeInTheDocument()
    })
  })
})
