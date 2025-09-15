'use client'

import { useViewportStore } from '@/stores/viewport-store'

export function ViewportDebug() {
  const { width, height, mapWidth, mapHeight } = useViewportStore()

  return (
    <div className="fixed left-4 top-4 z-[200] rounded bg-black/80 p-2 font-mono text-xs text-white">
      <div>
        Viewport: {width} x {height}
      </div>
      <div>
        Map: {mapWidth} x {mapHeight}
      </div>
    </div>
  )
}
