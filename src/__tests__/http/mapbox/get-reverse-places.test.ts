import axios from 'axios'
import type { FeatureCollection } from 'geojson'

import { getReversePlaces } from '@/http/mapbox/get-reverse-places'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock('@/config', () => ({
  config: {
    mapboxAccessToken: 'test-token',
  },
}))

describe('getReversePlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should make correct API call with coordinates', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            full_address:
              'Rua Cândida, Paiol, Nilópolis - Rio de Janeiro, Brazil',
            coordinates: {
              latitude: -22.808889,
              longitude: -43.413889,
            },
          },
          geometry: {
            type: 'Point',
            coordinates: [-43.413889, -22.808889],
          },
        },
      ],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = -22.808889
    const longitude = -43.413889

    const result = await getReversePlaces(latitude, longitude)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=-43.413889&latitude=-22.808889&access_token=test-token',
    )

    expect(result).toEqual(mockResponse)
  })

  it('should handle positive coordinates', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = 22.808889
    const longitude = 43.413889

    await getReversePlaces(latitude, longitude)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=43.413889&latitude=22.808889&access_token=test-token',
    )
  })

  it('should handle zero coordinates', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = 0
    const longitude = 0

    await getReversePlaces(latitude, longitude)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=0&latitude=0&access_token=test-token',
    )
  })

  it('should handle boundary coordinates', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = 90.0
    const longitude = 180.0

    await getReversePlaces(latitude, longitude)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=180&latitude=90&access_token=test-token',
    )
  })

  it('should handle negative boundary coordinates', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = -90.0
    const longitude = -180.0

    await getReversePlaces(latitude, longitude)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=-180&latitude=-90&access_token=test-token',
    )
  })

  it('should handle API errors', async () => {
    const errorMessage = 'API Error'
    mockedAxios.get.mockRejectedValue(new Error(errorMessage))

    const latitude = -22.808889
    const longitude = -43.413889

    await expect(getReversePlaces(latitude, longitude)).rejects.toThrow(
      errorMessage,
    )

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/reverse?longitude=-43.413889&latitude=-22.808889&access_token=test-token',
    )
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network Error')
    mockedAxios.get.mockRejectedValue(networkError)

    const latitude = -22.808889
    const longitude = -43.413889

    await expect(getReversePlaces(latitude, longitude)).rejects.toThrow(
      'Network Error',
    )
  })

  it('should handle empty response', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = -22.808889
    const longitude = -43.413889

    const result = await getReversePlaces(latitude, longitude)

    expect(result).toEqual(mockResponse)
    expect(result.features).toHaveLength(0)
  })

  it('should handle response with multiple features', async () => {
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            full_address: 'First Address',
            coordinates: {
              latitude: -22.808889,
              longitude: -43.413889,
            },
          },
          geometry: {
            type: 'Point',
            coordinates: [-43.413889, -22.808889],
          },
        },
        {
          type: 'Feature',
          properties: {
            full_address: 'Second Address',
            coordinates: {
              latitude: -22.809123,
              longitude: -43.414567,
            },
          },
          geometry: {
            type: 'Point',
            coordinates: [-43.414567, -22.809123],
          },
        },
      ],
    }

    mockedAxios.get.mockResolvedValue({ data: mockResponse })

    const latitude = -22.808889
    const longitude = -43.413889

    const result = await getReversePlaces(latitude, longitude)

    expect(result).toEqual(mockResponse)
    expect(result.features).toHaveLength(2)
    expect(result.features[0].properties?.full_address).toBe('First Address')
    expect(result.features[1].properties?.full_address).toBe('Second Address')
  })
})
