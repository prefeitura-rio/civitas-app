import { useCallback, useEffect, useRef, useState } from 'react'

import { prefersReducedMotion } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'

const MOTION_MS = 180

/**
 * O polo aberto ("origin:<id>" ou "destination:<id>") e a transição: ao abrir, os pontos crescem depois que o mapa
 * enquadra; ao fechar, encolhem antes. Esc fecha. `closeLegend` (estável) roda a cada polo aberto.
 */
export function usePoleSelection(closeLegend: () => void) {
  const [selection, setSelection] = useState<string | null>(null)
  const [expansion, setExpansion] = useState(1)
  const [animating, setAnimating] = useState(false)
  const closeTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    },
    [],
  )
  const settle = useCallback(() => {
    setExpansion(1)
    setAnimating(false)
  }, [])
  const cancelClose = () => {
    if (closeTimer.current === null) return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const clear = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    if (prefersReducedMotion()) {
      setSelection(null)
      setExpansion(1)
      return
    }
    setExpansion(0)
    closeTimer.current = window.setTimeout(() => {
      setAnimating(true)
      setSelection(null)
      closeTimer.current = null
    }, MOTION_MS)
  }, [])
  const open = useCallback(
    (key: string) => {
      if (key === selection) {
        clear()
        return
      }
      cancelClose()
      setAnimating(true)
      setExpansion(0)
      closeLegend()
      setSelection(key)
    },
    [clear, closeLegend, selection],
  )
  useEffect(() => {
    if (!selection) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clear, selection])
  return { selection, expansion, animating, settle, clear, open }
}
