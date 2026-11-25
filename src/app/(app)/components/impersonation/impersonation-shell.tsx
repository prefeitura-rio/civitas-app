import type { CSSProperties, ReactNode } from 'react'

import { config } from '@/config'

import {
  CHAMADOS_IMPERSONATION_BAR_HEIGHT,
  ChamadosImpersonationBar,
} from './chamados-impersonation-bar'
import { ChamadosImpersonationProvider } from './chamados-impersonation-context'

/** Altura reservada à barra; telas de altura cheia descontam `var(--impersonation-bar-height, 0px)`. */
const shellStyle = {
  '--impersonation-bar-height': CHAMADOS_IMPERSONATION_BAR_HEIGHT,
  paddingTop: CHAMADOS_IMPERSONATION_BAR_HEIGHT,
} as CSSProperties

/** Barra de personificação em todo o app (dev e staging, com ENABLE_IMPERSONATION), para nunca ficar preso nela. */
export function ImpersonationShell({ children }: { children: ReactNode }) {
  if (!config.enableImpersonation) return children

  return (
    <ChamadosImpersonationProvider>
      <ChamadosImpersonationBar />
      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col"
        style={shellStyle}
      >
        {children}
      </div>
    </ChamadosImpersonationProvider>
  )
}
