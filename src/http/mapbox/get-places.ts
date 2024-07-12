import axios from 'axios'
import type { FeatureCollection } from 'geojson'

import { config } from '@/config'

export async function getPlaces(query: string) {
  const response = await axios.get<FeatureCollection>(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${query}&proximity=ip&access_token=${config.mapboxAccessToken}`,
  )

  return response
}
