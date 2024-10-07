'use client'

import { PlaygroundMap } from './components/map'

export default function Home() {
  return (
    <div className="flex w-full">
      <div className="h-full w-full bg-slate-600">
        <PlaygroundMap />
      </div>
    </div>
  )
}
