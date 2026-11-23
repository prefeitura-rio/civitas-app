import axios from 'axios'
import type { FeatureCollection } from 'geojson'

import { config } from '@/config'

export async function getPlaces(
  query: string,
  bounds?: [number, number, number, number],
) {
  const restriction = bounds ? `&bbox=${bounds.join(',')}&country=br` : ''
  const response = await axios.get<FeatureCollection>(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&proximity=ip${restriction}&access_token=${config.mapboxAccessToken}`,
  )

  return response.data
}
