import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { useTripsData } from '@/hooks/mapLayers/use-trips-data'
import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'
import { getCarPath } from '@/http/cars/path/get-car-path'
import type { Trip } from '@/models/entities'

jest.mock('@/http/cars/path/get-car-path', () => ({
  getCarPath: jest.fn(),
}))

jest.mock('@/http/cars/hint/get-cars-hint', () => ({
  getCarHint: jest.fn(),
}))

const searchParams: GetCarPathRequest = {
  plate: 'ABC1234',
  startTime: '2026-11-01T00:00:00Z',
  endTime: '2026-11-02T00:00:00Z',
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useTripsData selected trip', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clears selection safely before any trips have loaded', () => {
    const { result } = renderHook(
      () => useTripsData({ setViewport: jest.fn() }),
      { wrapper: createWrapper() },
    )

    expect(result.current.trips).toBeUndefined()
    expect(() =>
      act(() => {
        result.current.setSelectedTrip(null)
      }),
    ).not.toThrow()
    expect(result.current.selectedTrip).toBeNull()

    const trip: Trip = { index: 3, cloneAlert: false, points: [] }
    act(() => result.current.setSelectedTrip(trip))
    expect(result.current.selectedTrip).toBe(trip)
  })

  it('selects by index, toggles the same trip off, and clears invalid indexes', async () => {
    const trips: Trip[] = [
      { index: 0, cloneAlert: false, points: [] },
      { index: 1, cloneAlert: false, points: [] },
    ]
    ;(getCarPath as jest.Mock).mockResolvedValue(trips)
    const { result } = renderHook(
      () => useTripsData({ setViewport: jest.fn() }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.getTrips(searchParams)
    })
    expect(result.current.selectedTrip).toBe(trips[0])

    act(() => result.current.setSelectedTrip(1))
    expect(result.current.selectedTrip).toBe(trips[1])

    act(() => result.current.setSelectedTrip(1))
    expect(result.current.selectedTrip).toBeNull()

    act(() => result.current.setSelectedTrip(5))
    expect(result.current.selectedTrip).toBeNull()
  })
})
