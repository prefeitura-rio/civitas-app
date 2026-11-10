import { fireEvent, render, screen, within } from '@testing-library/react'

import { MapLayerControl } from '@/app/(app)/veiculos/components/map/components/layer-toggle'
import { MapStyle } from '@/utils/get-map-style'

const mockToggleSchool = jest.fn()
const hidden = { isVisible: false, setIsVisible: jest.fn() }
const mockContext = {
  layers: {
    radars: hidden,
    cameras: hidden,
    fogoCruzado: hidden,
    AISP: hidden,
    CISP: hidden,
    busStops: hidden,
    schools: {
      isVisible: true,
      setIsVisible: mockToggleSchool,
      isLoading: false,
      isError: true,
    },
  },
  mapStyle: MapStyle.Map,
  setMapStyle: jest.fn(),
}
jest.mock('@/hooks/useContexts/use-map-context', () => ({
  useMap: () => mockContext,
}))

beforeEach(() => {
  mockContext.layers.schools.isError = true
  mockContext.layers.schools.isLoading = false
  mockToggleSchool.mockClear()
})

it('shows the layer error and lets the user turn it off for a retry', () => {
  render(<MapLayerControl />)
  fireEvent.click(screen.getByText('Camadas'))
  const button = screen.getByLabelText('Toggle Escolas Municipais layer')
  expect(within(button).getByText('Erro ao carregar')).toBeInTheDocument()
  expect(button).toHaveAttribute(
    'title',
    'Erro ao carregar. Desative e ative para tentar novamente.',
  )
  fireEvent.click(button)
  expect(mockToggleSchool).toHaveBeenCalledWith(false)
})

it('shows loading feedback for an enabled reference layer', () => {
  mockContext.layers.schools.isError = false
  mockContext.layers.schools.isLoading = true
  render(<MapLayerControl />)
  fireEvent.click(screen.getByText('Camadas'))
  const button = screen.getByLabelText('Toggle Escolas Municipais layer')
  expect(within(button).getByLabelText('Carregando')).toBeInTheDocument()
})
