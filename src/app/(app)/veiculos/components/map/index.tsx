import { getEnv } from '@/env/server'

import { Map } from './components/map'

export async function MapWrapper() {
  const env = await getEnv()

  return <Map mapboxAccessToken={env.MAPBOX_ACCESS_TOKEN} />
}
