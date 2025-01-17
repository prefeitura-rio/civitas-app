'use server'

import axios from 'axios'
import type { FeatureCollection } from 'geojson'

import { getEnv } from '@/env/server'

export async function getPlaces(query: string) {
  const env = await getEnv()
  const accessToken = env.MAPBOX_ACCESS_TOKEN

  const response = await axios.get<FeatureCollection>(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${query}&proximity=ip&access_token=${accessToken}`,
  )

  return response.data
}
