import { render, screen } from '@testing-library/react'

import { ReportTrip } from '@/app/(app)/veiculos/busca-por-placa/veiculo/components/report/components/components/report-trip'
import type { Point } from '@/models/entities'

jest.mock('@react-pdf/renderer', () => ({
  Font: { register: jest.fn(), registerHyphenationCallback: jest.fn() },
  StyleSheet: { create: (styles: unknown) => styles },
  Image: 'img',
  Text: 'span',
  View: 'div',
}))

jest.mock(
  '@/app/(app)/veiculos/busca-por-placa/veiculo/components/report/components/components/trip/map-view',
  () => ({
    MapView: () => <div>Mapa</div>,
  }),
)

const point: Point = {
  index: 0,
  from: [-43.244579, -22.930684],
  startTime: '2026-11-16T11:19:00-03:00',
  cetRioCode: '0002573',
  district: 'Tijuca',
  location: 'Rua General Espirito Santo Cardoso',
  direction: null,
  lane: null,
  speed: 0,
  secondsToNextPoint: null,
  cloneAlert: false,
}

function report(points: Point[]) {
  let counter = 0
  return render(
    <ReportTrip
      trip={{ index: 0, cloneAlert: false, points }}
      plate="ABC1D23"
      totalTrips={25}
      useImgCounter={() => ++counter}
      useTableCounter={() => ++counter}
    />,
  )
}

it('keeps trip titles and labels only the corresponding detection', () => {
  const { container } = report([
    point,
    {
      ...point,
      index: 1,
      startTime: '2026-11-16T13:06:00-03:00',
      possibleStay: true,
      stayDurationMinutes: 107,
      stayDetectionCount: 200,
    },
  ])

  expect(screen.getByText('Viagem 25 - Parte 1 de 2:')).toBeInTheDocument()
  expect(screen.getByText('Viagem 25 - Parte 2 de 2:')).toBeInTheDocument()
  expect(
    screen.getAllByText('Possível permanência · 200 detecções'),
  ).toHaveLength(1)
  expect(screen.getAllByText(/referente à viagem 25\./)).toHaveLength(4)
  expect(container.textContent).not.toContain('Possível permanência 25')
})

it('preserves the title and captions of movement trips', () => {
  report([point])

  expect(screen.getByText('Viagem 25:')).toBeInTheDocument()
  expect(screen.getAllByText(/referente à viagem 25\./)).toHaveLength(2)
  expect(screen.queryByText(/Possível permanência/)).toBeNull()
})
