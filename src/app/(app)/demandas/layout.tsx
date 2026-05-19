import { config } from '@/config'

import {
  CHAMADOS_IMPERSONATION_BAR_HEIGHT,
  ChamadosImpersonationBar,
} from './chamados-impersonation-bar'
import { ChamadosImpersonationProvider } from './chamados-impersonation-context'

export default function ChamadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!config.enableImpersonation) {
    return children
  }

  return (
    <ChamadosImpersonationProvider>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <ChamadosImpersonationBar />
        <div
          className="min-h-0 flex-1"
          style={{ paddingTop: CHAMADOS_IMPERSONATION_BAR_HEIGHT }}
        >
          {children}
        </div>
      </div>
    </ChamadosImpersonationProvider>
  )
}
