'use client'

import { createContext, useContext } from 'react'

/**
 * Onde os portais do Radix (popover, select, tooltip) abrem: um elemento dentro de `.iv-root`. Fora dele, no `body`,
 * o conteúdo perderia o CSS e as cores do módulo, que valem só dentro da área do módulo.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null)

export function usePortalContainer() {
  return useContext(PortalContainerContext) ?? undefined
}
