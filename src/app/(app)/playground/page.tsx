import { getEnv } from '@/env/server'

import { PlaygroundMap } from './components/map'

export default async function Home() {
  const env = await getEnv()

  return (
    <div className="flex w-full">
      <div className="h-full w-full">
        <PlaygroundMap mapboxAccessToken={env.MAPBOX_ACCESS_TOKEN} />
      </div>
    </div>
  )
}
