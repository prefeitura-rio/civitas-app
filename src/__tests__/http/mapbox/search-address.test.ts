import axios from 'axios'

import { searchAddress } from '@/http/mapbox/search-address'

jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }))

const address = {
  street: 'RUA CELSO JOSE ABDALLA SAYEG',
  addressNumber: '521',
  neighborhood: 'JARDIM BOTANICO (SOUSAS)',
  place: 'CAMPINAS',
  region: 'SP',
  postcode: '13106272',
}
const feature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-46.97, -22.89] },
  properties: {
    feature_type: 'address',
    context: { country: { country_code: 'BR' } },
    match_code: {
      confidence: 'high',
      street: 'matched',
      address_number: 'matched',
      place: 'matched',
      region: 'matched',
      postcode: 'matched',
    },
    coordinates: { accuracy: 'point' },
  },
}
const mockGet = jest.mocked(axios.get)

describe('searchAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      data: { type: 'FeatureCollection', features: [] },
    })
  })

  it('sends address components separately with autocomplete disabled', async () => {
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [feature] },
    })
    await searchAddress(address)
    expect(mockGet).toHaveBeenCalledWith(
      'https://api.mapbox.com/search/geocode/v6/forward',
      expect.objectContaining({
        params: expect.objectContaining({
          street: address.street,
          address_number: '521',
          neighborhood: address.neighborhood,
          place: 'CAMPINAS',
          region: 'SP',
          postcode: '13106272',
          country: 'br',
          autocomplete: false,
          types: 'address',
        }),
      }),
    )
  })

  it('skips a mismatched first result and keeps a matching later result', async () => {
    const wrongCity = {
      ...feature,
      properties: {
        ...feature.properties,
        match_code: {
          ...feature.properties.match_code,
          place: 'unmatched',
        },
      },
    }
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [wrongCity, feature] },
    })
    expect((await searchAddress(address)).features).toEqual([feature])
  })

  it.each(['street', 'address_number', 'place', 'region', 'postcode'])(
    'rejects a different %s even if confidence is high',
    async (component) => {
      const mismatch = {
        ...feature,
        properties: {
          ...feature.properties,
          match_code: {
            ...feature.properties.match_code,
            [component]: 'unmatched',
          },
        },
      }
      mockGet.mockResolvedValueOnce({
        data: { type: 'FeatureCollection', features: [mismatch] },
      })
      expect((await searchAddress(address)).features).toEqual([])
    },
  )

  it('rejects results without match metadata or with low confidence', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          {
            ...feature,
            properties: { ...feature.properties, match_code: undefined },
          },
          {
            ...feature,
            properties: {
              ...feature.properties,
              match_code: {
                ...feature.properties.match_code,
                confidence: 'low',
              },
            },
          },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('does not geocode an address without a street or geographic context', async () => {
    expect(
      (
        await searchAddress({
          place: 'Campinas',
          region: 'SP',
        })
      ).features,
    ).toEqual([])
    expect(
      (await searchAddress({ street: 'Rua Central', addressNumber: '10' }))
        .features,
    ).toEqual([])
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('returns an empty collection when Mapbox finds no address', async () => {
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [] },
    })
    expect((await searchAddress(address)).features).toEqual([])
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('rejects the different Campinas street returned for the reported CNPJ address', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          {
            ...feature,
            geometry: { type: 'Point', coordinates: [-47.035051, -22.84871] },
            properties: {
              ...feature.properties,
              match_code: {
                ...feature.properties.match_code,
                street: 'unmatched',
                postcode: 'unmatched',
                address_number: 'plausible',
                confidence: 'low',
              },
            },
          },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('rejects invalid coordinates even for a matched address', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          { ...feature, geometry: { type: 'Point', coordinates: [0, 0] } },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('accepts the observed Maceio result when context matches despite formatting flags', async () => {
    const matchingContext = {
      ...feature,
      geometry: { type: 'Point', coordinates: [-35.75, -9.6] },
      properties: {
        ...feature.properties,
        context: {
          country: { country_code: 'BR' },
          place: { name: 'Maceió' },
          region: { region_code: 'AL' },
          postcode: { name: '57082-036' },
        },
        match_code: {
          ...feature.properties.match_code,
          place: 'unmatched',
          postcode: 'unmatched',
          confidence: 'medium',
        },
      },
    }
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [matchingContext] },
    })
    expect(
      (
        await searchAddress({
          street: 'VICENTE CELESTINO',
          addressNumber: '1',
          place: 'MACEIO',
          region: 'AL',
          postcode: '57082036',
        })
      ).features,
    ).toEqual([matchingContext])
  })

  it('rejects a different actual municipality even when the match flag says matched', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          {
            ...feature,
            properties: {
              ...feature.properties,
              context: {
                country: { country_code: 'BR' },
                place: { name: 'Guarulhos' },
              },
            },
          },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('falls back to the matching street and uses its CEP prefix to reject other candidates', async () => {
    const street = {
      ...feature,
      geometry: { type: 'Point', coordinates: [-46.964697, -22.891253] },
      properties: {
        feature_type: 'street',
        name: 'Rua Celso José Abdalla Sayeg',
        context: {
          country: { country_code: 'BR' },
          place: { name: 'Campinas' },
          region: { region_code: 'SP' },
          postcode: { name: '13106' },
        },
      },
    }
    const wrongArea = {
      ...street,
      properties: {
        ...street.properties,
        context: {
          ...street.properties.context,
          postcode: { name: '13088' },
        },
      },
    }
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [] },
    })
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [wrongArea, street] },
    })

    expect((await searchAddress(address)).features).toEqual([street])
    expect(mockGet.mock.calls[1][1]?.params).toEqual(
      expect.objectContaining({
        types: 'street',
        street: address.street,
        postcode: address.postcode,
      }),
    )
    expect(mockGet.mock.calls[1][1]?.params).not.toHaveProperty(
      'address_number',
    )
  })

  it('does not accept a different street merely because its CEP and municipality match', async () => {
    mockGet.mockResolvedValueOnce({
      data: { type: 'FeatureCollection', features: [] },
    })
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          {
            ...feature,
            properties: {
              feature_type: 'street',
              name: 'Rua Celso José Fernandes',
              context: {
                country: { country_code: 'BR' },
                place: { name: 'Campinas' },
                region: { region_code: 'SP' },
                postcode: { name: '13106' },
              },
            },
          },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('requires returned geographic context for a medium-confidence address', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        type: 'FeatureCollection',
        features: [
          {
            ...feature,
            properties: {
              ...feature.properties,
              match_code: {
                ...feature.properties.match_code,
                confidence: 'medium',
              },
            },
          },
        ],
      },
    })
    expect((await searchAddress(address)).features).toEqual([])
  })

  it('searches only for a street approximation when no house number is available', async () => {
    await searchAddress({ ...address, addressNumber: undefined })
    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockGet.mock.calls[0][1]?.params).toEqual(
      expect.objectContaining({ types: 'street' }),
    )
    expect(mockGet.mock.calls[0][1]?.params).not.toHaveProperty(
      'address_number',
    )
  })

  it('propagates request errors without treating them as an absent address', async () => {
    mockGet.mockRejectedValueOnce(new Error('Connection unavailable'))
    await expect(searchAddress(address)).rejects.toThrow(
      'Connection unavailable',
    )
    expect(mockGet).toHaveBeenCalledTimes(1)
  })
})
