import axios from 'axios'

import { getPlaces } from '@/http/mapbox/get-places'

jest.mock('axios')
jest.mock('@/config', () => ({ config: { mapboxAccessToken: 'test-token' } }))

const mockedAxios = axios as jest.Mocked<typeof axios>
beforeEach(() => {
  jest.clearAllMocks()
  mockedAxios.get.mockResolvedValue({
    data: { type: 'FeatureCollection', features: [] },
  })
})

it('limits address candidates to the supplied municipal bounds and Brazil', async () => {
  const bounds: [number, number, number, number] = [
    -43.79547, -23.08291, -43.0969, -22.74603,
  ]
  await getPlaces('Rua A & B', bounds)
  const url = new URL(mockedAxios.get.mock.calls[0][0])
  expect(url.searchParams.get('q')).toBe('Rua A & B')
  expect(url.searchParams.get('bbox')).toBe(bounds.join(','))
  expect(url.searchParams.get('country')).toBe('br')
})

it('keeps unrestricted lookups available to other callers', async () => {
  await getPlaces('Rua A')
  const url = new URL(mockedAxios.get.mock.calls[0][0])
  expect(url.searchParams.has('bbox')).toBe(false)
  expect(url.searchParams.has('country')).toBe(false)
})
