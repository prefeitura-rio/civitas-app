import axios from 'axios'
import type { FeatureCollection } from 'geojson'

import { config } from '@/config'

export async function getReversePlaces(latitude: number, longitude: number) {
  const response = await axios.get<FeatureCollection>(
    `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${config.mapboxAccessToken}`,
  )

  return response.data
}
