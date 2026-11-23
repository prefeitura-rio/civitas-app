import { readFileSync } from 'node:fs'

import { getRioSearchArea } from '@/utils/rio-search-area'

const originalFetch = global.fetch
beforeAll(() => {
  const boundaries = JSON.parse(
    readFileSync(
      'public/vehicle-intelligence/data/bairros_rio.geojson',
      'utf8',
    ),
  )
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => boundaries })
})
afterAll(() => {
  global.fetch = originalFetch
})

it.each([
  ['Centro', [-43.1729, -22.9068], true],
  ['Copacabana', [-43.185, -22.97], true],
  ['Santa Cruz', [-43.6845, -22.9165], true],
  ['Paquetá', [-43.1107, -22.7619], true],
  ['Nilópolis', [-43.413889, -22.808889], false],
  ['Niterói', [-43.103, -22.883], false],
  ['São Paulo', [-46.6333, -23.5505], false],
  ['invalid coordinates', [NaN, -22.9], false],
])(
  'validates the municipal boundary for %s',
  async (_name, coordinates, expected) => {
    const area = await getRioSearchArea()
    expect(area.contains(coordinates)).toBe(expected)
  },
)

it('reuses the municipal geometry across searches', async () => {
  const first = await getRioSearchArea()
  const second = await getRioSearchArea()
  expect(second).toBe(first)
  expect(global.fetch).toHaveBeenCalledTimes(1)
})
