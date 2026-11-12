import {
  isRouteAllowed,
  parseRoute,
} from '@/modules/vehicle-intelligence/app/routes'

const allowed = (path: string, fullAccess = false) =>
  isRouteAllowed(parseRoute(path), fullAccess)

describe('isRouteAllowed', () => {
  it('opens Placas correlatas and Perfil de placa with what opens inside them', () => {
    for (const path of [
      '/correlation',
      '/profile',
      '/profile/ABC1D23',
      '/profile/ABC1D23/trends',
      '/profile/ABC1D23/correlations/timeline',
      '/profile/ABC1D23/correlations/dia/2026-03-01',
      `/occurrence/${encodeURIComponent('019-06778/2026')}`,
    ])
      expect([path, allowed(path)]).toEqual([path, true])
  })

  it('keeps the other screens behind the full screen', () => {
    for (const path of [
      '/',
      '/post-event',
      '/groups',
      '/groups/ABC1D23-XYZ9K87',
      '/territories',
      '/territories/Mar%C3%A9',
      '/occurrence',
    ]) {
      expect([path, allowed(path)]).toEqual([path, false])
      expect([path, allowed(path, true)]).toEqual([path, true])
    }
  })
})
