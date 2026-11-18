import { render, screen, within } from '@testing-library/react'

import { TripCard } from '@/app/(app)/veiculos/busca-por-placa/veiculo/components/trip-list/components/trip-card'
import { PossibleStayBadge } from '@/components/custom/possible-stay-badge'
import { useMap } from '@/hooks/useContexts/use-map-context'
import type { Point as ApiPoint } from '@/http/cars/path/get-car-path'
import { formatCarPathResponse } from '@/utils/format-car-path-response'

jest.mock('@/hooks/useContexts/use-map-context', () => ({ useMap: jest.fn() }))

const reading: ApiPoint = {
  datahora: '2026-11-13T10:15:00-03:00',
  id_ponto_coleta: '123',
  latitude: -22.9,
  longitude: -43.2,
  bairro: 'Centro',
  localidade: 'Rua de teste',
  velocidade: 0,
  seconds_to_next_point: null,
}

function toPoint(overrides: Partial<ApiPoint> = {}) {
  return formatCarPathResponse([
    { locations: [[{ ...reading, ...overrides }]], polyline: null },
  ])[0].points[0]
}

it('shows a tentative label with the total detection count including the first reading', () => {
  const point = toPoint({
    parado: true,
    minutos_parado: 15,
    total_deteccoes_parado: 4,
  })

  expect(point.stayDurationMinutes).toBe(15)
  render(<PossibleStayBadge point={point} />)

  expect(
    screen.getByText('Possível permanência · 5 detecções'),
  ).toBeInTheDocument()
  expect(screen.queryByText('Possível permanência · 15 min')).toBeNull()
})

it.each([{}, { parado: false, total_deteccoes_parado: 0 }])(
  'does not flag readings without an indication of permanence: %j',
  (overrides) => {
    const { container } = render(
      <PossibleStayBadge point={toPoint(overrides)} />,
    )

    expect(container.childElementCount).toBe(0)
  },
)

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])(
  'shows the external badge only for stay-only trips (mixed: %s, expanded: %s)',
  (mixed, expanded) => {
    const point = toPoint({
      parado: true,
      minutos_parado: 15,
      total_deteccoes_parado: 4,
    })
    const initialPoint = toPoint({ datahora: '2026-11-13T10:00:00-03:00' })
    initialPoint.possibleStay = true
    initialPoint.possibleStayToNext = true
    initialPoint.stayDurationMinutes = 15
    initialPoint.stayDetectionCount = 5
    point.index = 1
    const movementPoint = toPoint({ datahora: '2026-11-13T10:20:00-03:00' })
    movementPoint.index = 2
    const trip = {
      index: 0,
      points: mixed
        ? [initialPoint, point, movementPoint]
        : [initialPoint, point],
      cloneAlert: false,
    }
    ;(useMap as jest.Mock).mockReturnValue({
      setViewport: jest.fn(),
      layers: {
        trips: {
          trips: [trip],
          selectedTrip: expanded ? trip : null,
          setSelectedTrip: jest.fn(),
        },
      },
    })

    render(
      <TripCard
        index={0}
        startLocation={initialPoint}
        endLocation={mixed ? movementPoint : point}
        cloneAlert={false}
      />,
    )

    expect(
      screen.queryAllByText('Possível permanência · 5 detecções'),
    ).toHaveLength((mixed ? 0 : 1) + (expanded ? 1 : 0))
    if (expanded) {
      expect(
        within(screen.getByText('10:00').parentElement!).getByText(
          'Possível permanência · 5 detecções',
        ),
      ).toBeInTheDocument()
      expect(
        within(screen.getByText('10:15').parentElement!).queryByText(
          /Possível permanência/,
        ),
      ).toBeNull()
    }
  },
)

it('keeps the flag and API duration on the final detection across different trips', () => {
  const trips = formatCarPathResponse([
    {
      locations: [
        [
          {
            ...reading,
            datahora: '2026-11-12T08:40:00-03:00',
            parado: false,
            minutos_parado: 0,
          },
        ],
      ],
      polyline: null,
    },
    {
      locations: [
        [
          {
            ...reading,
            datahora: '2026-11-12T17:24:00-03:00',
            parado: true,
            minutos_parado: 524,
            total_deteccoes_parado: 12,
          },
        ],
      ],
      polyline: null,
    },
  ])
  const finalPoint = trips[0].points[0]
  const initialPoint = trips[1].points[0]

  expect(finalPoint.startTime).toBe('2026-11-12T17:24:00-03:00')
  expect(finalPoint.possibleStay).toBe(true)
  expect(initialPoint.possibleStay).toBe(false)

  render(
    <>
      <PossibleStayBadge point={initialPoint} />
      <PossibleStayBadge point={finalPoint} />
    </>,
  )

  expect(screen.getAllByText(/Possível permanência/)).toHaveLength(1)
  expect(
    screen.getByText('Possível permanência · 13 detecções'),
  ).toBeInTheDocument()
})

it('repeats the stay start in the next trip while preserving the preceding trip', () => {
  const response = [
    {
      locations: [
        [
          { ...reading, datahora: '2026-11-16T08:45:00-03:00', parado: false },
          { ...reading, datahora: '2026-11-16T09:09:00-03:00', parado: false },
        ],
      ],
      polyline: null,
    },
    {
      locations: [
        [
          {
            ...reading,
            datahora: '2026-11-16T10:47:00-03:00',
            parado: true,
            inicio_permanencia: '2026-11-16T09:09:00-03:00',
            minutos_parado: 97,
            total_deteccoes_parado: 127,
          },
          { ...reading, datahora: '2026-11-16T11:00:00-03:00', parado: false },
        ],
      ],
      polyline: null,
    },
  ]
  const trips = formatCarPathResponse(response)
  const previous = trips[1]
  const next = trips[0]

  expect(previous.points.map((point) => point.startTime)).toEqual([
    '2026-11-16T08:45:00-03:00',
    '2026-11-16T09:09:00-03:00',
  ])
  expect(next.points.map((point) => point.startTime)).toEqual([
    '2026-11-16T09:09:00-03:00',
    '2026-11-16T10:47:00-03:00',
    '2026-11-16T11:00:00-03:00',
  ])
  expect(previous.points[1].possibleStay).toBe(true)
  expect(next.points.map((point) => point.possibleStay)).toEqual([
    true,
    true,
    false,
  ])
  expect(next.points[0].stayDurationMinutes).toBe(97)
  expect(next.points[0].stayDetectionCount).toBe(128)
  expect(next.points[0].secondsToNextPoint).toBe(98 * 60)
  expect(previous.points[1].secondsToNextPoint).toBeNull()
  expect(next.points.map((point) => point.possibleStayToNext)).toEqual([
    true,
    false,
    false,
  ])
  expect(previous.points[1].possibleStayToNext).toBe(false)
  expect(next.points.map((point) => point.isRepeatedStayStart)).toEqual([
    true,
    false,
    false,
  ])
  expect(previous.points[1].isRepeatedStayStart).toBe(false)
  // Formatting again must not add a second copy or mutate the API response.
  expect(formatCarPathResponse(response)).toEqual(trips)
  expect(response[1].locations[0]).toHaveLength(2)
  expect(previous.startTime).toBe('2026-11-16T08:45:00-03:00')
  expect(next.startTime).toBe('2026-11-16T10:47:00-03:00')
  ;(useMap as jest.Mock).mockReturnValue({
    setViewport: jest.fn(),
    layers: {
      trips: { trips, selectedTrip: next, setSelectedTrip: jest.fn() },
    },
  })
  render(
    <TripCard
      index={next.index}
      startLocation={next.points[0]}
      endLocation={next.points[next.points.length - 1]}
      cloneAlert={false}
    />,
  )
  expect(screen.getByText('10:47 - 11:00')).toBeInTheDocument()
  expect(screen.getByText('13 min')).toBeInTheDocument()
  expect(screen.getByText('09:09')).toBeInTheDocument()
  expect(
    screen
      .getByText('11:00')
      .compareDocumentPosition(screen.getByText('10:47')) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(
    screen
      .getByText('10:47')
      .compareDocumentPosition(screen.getByText('09:09')) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(
    screen.getByText('10:47').parentElement?.querySelector('.border-dashed'),
  ).not.toBeNull()
  expect(
    screen.getByText('11:00').parentElement?.querySelector('.border-dashed'),
  ).toBeNull()
})

it('does not invent an initial reading when the sequence starts outside the search', () => {
  const trips = formatCarPathResponse([
    {
      locations: [
        [
          {
            ...reading,
            parado: true,
            inicio_permanencia: '2026-11-13T09:00:00-03:00',
          },
        ],
      ],
      polyline: null,
    },
  ])

  expect(trips[0].points).toHaveLength(1)
})

it('renders two open trips with their own detection details', () => {
  const first = {
    ...toPoint(),
    index: 0,
    location: 'Local da primeira viagem',
    startTime: '2026-11-13T10:00:00-03:00',
  }
  const second = {
    ...toPoint(),
    index: 0,
    location: 'Local da segunda viagem',
    startTime: '2026-11-13T12:00:00-03:00',
  }
  const trips = [
    { index: 0, cloneAlert: false, points: [first] },
    { index: 1, cloneAlert: false, points: [second] },
  ]
  ;(useMap as jest.Mock).mockReturnValue({
    setViewport: jest.fn(),
    layers: {
      trips: {
        trips,
        selectedTrip: trips[1],
        selectedTrips: trips,
        setSelectedTrip: jest.fn(),
      },
    },
  })
  render(
    <>
      <TripCard
        index={0}
        startLocation={first}
        endLocation={first}
        cloneAlert={false}
      />
      <TripCard
        index={1}
        startLocation={second}
        endLocation={second}
        cloneAlert={false}
      />
    </>,
  )
  expect(screen.getByText(/local da primeira viagem/i)).toBeInTheDocument()
  expect(screen.getByText(/local da segunda viagem/i)).toBeInTheDocument()
  expect(screen.getByText('10:00')).toBeInTheDocument()
  expect(screen.getByText('12:00')).toBeInTheDocument()
})
