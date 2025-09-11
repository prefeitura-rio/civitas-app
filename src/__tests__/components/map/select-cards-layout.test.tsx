import { render } from '@testing-library/react'

import { CameraSelectCard } from '@/app/(app)/veiculos/components/map/components/select-cards/camera-select-card'
import { RadarSelectCard } from '@/app/(app)/veiculos/components/map/components/select-cards/radar-select-card'
import type { CameraCOR, Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

jest.mock('@/stores/use-map-store', () => ({
  useMapStore: jest.fn(),
}))

const mockUseMapStore = jest.mocked(useMapStore)

jest.mock('@/utils/string-extensions', () => ({}))

const mockRadar: Radar = {
  cetRioCode: '123456',
  latitude: -22.9068,
  longitude: -43.1729,
  location: 'Avenida Atlântica',
  district: 'Copacabana',
  company: 'TECHNO RADARES',
  activeInLast24Hours: true,
  lastDetectionTime: new Date('2025-01-15T10:30:00'),
  streetName: 'Avenida Atlântica',
  hasData: true,
  direction: 'Sentido Centro',
  lane: 'Faixa 1',
  streetNumber: '1000',
}

const mockCamera: CameraCOR = {
  code: 'CAM001',
  latitude: -22.9068,
  longitude: -43.1729,
  location: 'copacabana palace',
  zone: 'zona sul',
  streamingUrl: 'https://example.com/stream',
}

describe('Select Cards Layout Snapshots', () => {
  beforeEach(() => {
    mockUseMapStore.mockImplementation((selector) => {
      const state = {
        zoomToLocation: jest.fn(),
        restorePreviousViewport: jest.fn(),
        previousViewport: {
          latitude: -22.9068,
          longitude: -43.1729,
          zoom: 12,
        },
      }
      return selector(state)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('RadarSelectCard Layout', () => {
    it('deve manter o layout compacto do radar card com radar ativo', () => {
      const { container } = render(
        <RadarSelectCard
          selectedObject={mockRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      expect(container.firstChild).toMatchSnapshot('radar-card-ativo')
    })

    it('deve manter o layout compacto do radar card com radar inativo', () => {
      const inactiveRadar: Radar = {
        ...mockRadar,
        activeInLast24Hours: false,
        lastDetectionTime: new Date('2024-12-01T10:30:00'),
      }

      const { container } = render(
        <RadarSelectCard
          selectedObject={inactiveRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      expect(container.firstChild).toMatchSnapshot('radar-card-inativo')
    })

    it('deve manter o layout quando não há objeto selecionado', () => {
      const { container } = render(
        <RadarSelectCard selectedObject={null} setSelectedObject={jest.fn()} />,
      )

      expect(container.firstChild).toMatchSnapshot('radar-card-null')
    })
  })

  describe('CameraSelectCard Layout', () => {
    it('deve manter o layout compacto do camera card com streaming', () => {
      const { container } = render(
        <CameraSelectCard
          selectedObject={mockCamera}
          setSelectedObject={jest.fn()}
        />,
      )

      expect(container.firstChild).toMatchSnapshot('camera-card-com-streaming')
    })

    it('deve manter o layout compacto do camera card sem streaming', () => {
      const cameraWithoutStreaming: CameraCOR = {
        ...mockCamera,
        streamingUrl: undefined,
      }

      const { container } = render(
        <CameraSelectCard
          selectedObject={cameraWithoutStreaming}
          setSelectedObject={jest.fn()}
        />,
      )

      expect(container.firstChild).toMatchSnapshot('camera-card-sem-streaming')
    })

    it('deve manter o layout quando não há objeto selecionado', () => {
      const { container } = render(
        <CameraSelectCard
          selectedObject={null}
          setSelectedObject={jest.fn()}
        />,
      )

      expect(container.firstChild).toMatchSnapshot('camera-card-null')
    })
  })

  describe('Layout Consistency Tests', () => {
    it('deve ter títulos alinhados à esquerda', () => {
      const { container: radarContainer } = render(
        <RadarSelectCard
          selectedObject={mockRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      const { container: cameraContainer } = render(
        <CameraSelectCard
          selectedObject={mockCamera}
          setSelectedObject={jest.fn()}
        />,
      )

      const radarTitle = radarContainer.querySelector('h3')
      const cameraTitle = cameraContainer.querySelector('h3')

      expect(radarTitle).toHaveClass('text-left')
      expect(cameraTitle).toHaveClass('text-left')
    })

    it('deve ter linha divisória no header', () => {
      const { container: radarContainer } = render(
        <RadarSelectCard
          selectedObject={mockRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      const { container: cameraContainer } = render(
        <CameraSelectCard
          selectedObject={mockCamera}
          setSelectedObject={jest.fn()}
        />,
      )

      const radarHeader = radarContainer.querySelector(
        '[class*="border-b"]',
      ) as HTMLElement
      const cameraHeader = cameraContainer.querySelector(
        '[class*="border-b"]',
      ) as HTMLElement

      expect(radarHeader).toBeInTheDocument()
      expect(cameraHeader).toBeInTheDocument()
    })

    it('deve ter tamanhos de texto consistentes', () => {
      const { container: radarContainer } = render(
        <RadarSelectCard
          selectedObject={mockRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      const { container: cameraContainer } = render(
        <CameraSelectCard
          selectedObject={mockCamera}
          setSelectedObject={jest.fn()}
        />,
      )

      const radarLabels = radarContainer.querySelectorAll('.font-medium')
      const cameraLabels = cameraContainer.querySelectorAll('.font-medium')

      radarLabels.forEach((label) => {
        if (!label.textContent?.includes('Ativo nas últimas')) {
          expect(label).toHaveClass('text-sm')
        }
      })

      cameraLabels.forEach((label) => {
        expect(label).toHaveClass('text-sm')
      })
    })

    it('deve ter padding compacto', () => {
      const { container: radarContainer } = render(
        <RadarSelectCard
          selectedObject={mockRadar}
          setSelectedObject={jest.fn()}
        />,
      )

      const { container: cameraContainer } = render(
        <CameraSelectCard
          selectedObject={mockCamera}
          setSelectedObject={jest.fn()}
        />,
      )

      const radarHeader = radarContainer.querySelector('[class*="py-3"]')
      const cameraHeader = cameraContainer.querySelector('[class*="py-3"]')

      expect(radarHeader).toBeInTheDocument()
      expect(cameraHeader).toBeInTheDocument()
    })
  })
})
