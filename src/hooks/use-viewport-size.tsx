import { useCallback, useEffect, useState } from 'react'

interface ViewportSize {
  width: number
  height: number
}

export function useViewportSize(): ViewportSize {
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const handleResize = useCallback(() => {
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewportSize
}
