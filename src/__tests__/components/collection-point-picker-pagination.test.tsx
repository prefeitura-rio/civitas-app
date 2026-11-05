import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode, useEffect } from 'react'

import { CollectionPointPickerDialog } from '@/components/custom/collection-point-picker/collection-point-picker-dialog'
import { useCollectionPointPickerState } from '@/components/custom/collection-point-picker/use-collection-point-picker-state'
import type { CollectionPoint } from '@/models/entities'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)
jest.mock('deck.gl', () => ({
  ...jest.requireActual('../../../node_modules/@deck.gl/layers/dist/index.cjs'),
  DeckGL: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
jest.mock('react-map-gl', () => ({ __esModule: true, default: () => null }))
jest.mock('supercluster', () =>
  jest.requireActual('../../../node_modules/supercluster/dist/supercluster.js'),
)
jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({ data: mockPoints, isPending: false }),
}))
jest.mock('@/http/mapbox/get-places', () => ({ getPlaces: jest.fn() }))

const visiblePoints: CollectionPoint[] = Array.from(
  { length: 45 },
  (_, index) => ({
    cetRioCode: `VISIBLE-${String(index).padStart(3, '0')}`,
    company: 'CIVITAS',
    longitude: -43.2,
    latitude: -22.9,
    location: 'MATCH',
    district: 'Centro',
    direction: null,
    lane: null,
    lastDetectionTime: null,
    activeInLast24Hours: true,
  }),
)
const outsidePoints = visiblePoints.slice(0, 20).map((point, index) => ({
  ...point,
  cetRioCode: `OUTSIDE-${index}`,
  longitude: -50,
  latitude: -10,
}))
let mockPoints = [...visiblePoints, ...outsidePoints]
const emptySelection: string[] = []
const onChange = jest.fn()

function Picker({ value = emptySelection }: { value?: string[] }) {
  const picker = useCollectionPointPickerState({ value, onChange })
  // Simulate the renderer's initial measurement once, independently of rerenders.
  useEffect(() => {
    picker.handleMapResize({ width: 900, height: 520 })
    picker.handleViewStateChange({
      longitude: -43.2,
      latitude: -22.9,
      zoom: 12,
    })
  }, [])
  return (
    <CollectionPointPickerDialog
      open
      onOpenChange={jest.fn()}
      picker={picker}
    />
  )
}

describe('collection point picker pagination summary', () => {
  beforeEach(() => {
    onChange.mockClear()
    mockPoints = [...visiblePoints, ...outsidePoints]
  })

  it('uses the eligible total before pagination and updates the loaded count while scrolling', () => {
    render(<Picker />)
    expect(screen.getByText('Mostrando 20 de 45 radares.')).toBeInTheDocument()
    const list = screen.getByText('VISIBLE-000').closest('.overflow-y-auto')
    if (!list) throw new Error('Missing radar list')

    fireEvent.scroll(list, { target: { scrollTop: 500 } })
    expect(screen.getByText('Mostrando 40 de 45 radares.')).toBeInTheDocument()
    fireEvent.scroll(list, { target: { scrollTop: 1000 } })
    expect(screen.getByText('Mostrando 45 de 45 radares.')).toBeInTheDocument()
  })

  it.each([0, 10, 20])(
    'keeps the summary visible with %s eligible results and excludes out-of-viewport points without a search',
    (count) => {
      mockPoints = [...visiblePoints.slice(0, count), ...outsidePoints]
      render(<Picker />)

      expect(
        screen.getByText(`Mostrando ${count} de ${count} radares.`),
      ).toBeInTheDocument()
    },
  )

  it('includes matching out-of-viewport points in the total when searching', () => {
    render(<Picker />)
    fireEvent.change(
      screen.getByPlaceholderText('Buscar por código, local, bairro ou faixa'),
      { target: { value: 'MATCH' } },
    )

    expect(screen.getByText('Mostrando 20 de 65 radares.')).toBeInTheDocument()
  })

  it('keeps the selected tab total independent of the all-points total', () => {
    render(
      <Picker
        value={visiblePoints.slice(0, 25).map((point) => point.cetRioCode)}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Selecionados (25)' }))

    expect(screen.getByText('Mostrando 20 de 25 radares.')).toBeInTheDocument()
  })

  it('selects all viewport results beyond the loaded page and retains previously selected outside points', () => {
    render(
      <Picker
        value={[outsidePoints[0].cetRioCode, visiblePoints[0].cetRioCode]}
      />,
    )
    expect(screen.getByText('Mostrando 20 de 45 radares.')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Selecionar todos' }),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Selecionar visíveis (45)' }),
    )

    expect(onChange).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Selecionados (46)' }),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Limpar toda a seleção' }),
    )
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar seleção' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('disables visible selection when only out-of-viewport results match a search', () => {
    render(<Picker />)
    fireEvent.change(
      screen.getByPlaceholderText('Buscar por código, local, bairro ou faixa'),
      { target: { value: 'OUTSIDE' } },
    )

    expect(
      screen.getByRole('button', { name: 'Selecionar visíveis (0)' }),
    ).toBeDisabled()
    expect(onChange).not.toHaveBeenCalled()
  })
})
