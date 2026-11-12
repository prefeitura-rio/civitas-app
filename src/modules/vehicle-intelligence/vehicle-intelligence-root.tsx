'use client'

import 'leaflet/dist/leaflet.css'
import '@/modules/vehicle-intelligence/styles/index.css'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { useResolvedTicketModulePermissions } from '@/hooks/useQueries/useResolvedTicketModulePermissions'
import { canViewTicketScreen } from '@/http/tickets/ticket-module-permissions-me'
import { VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE } from '@/lib/vehicle-intelligence/constants'
import { App } from '@/modules/vehicle-intelligence/app/app'
import {
  toAppPath,
  toRoutePath,
} from '@/modules/vehicle-intelligence/app/base-path'
import {
  isRouteAllowed,
  LIMITED_HOME_PATH,
  parseRoute,
} from '@/modules/vehicle-intelligence/app/routes'
import { PortalContainerContext } from '@/modules/vehicle-intelligence/components/ui/portal-container'
import { recorteAtual } from '@/modules/vehicle-intelligence/config/recortes'
import { EventScopeProvider } from '@/modules/vehicle-intelligence/stores/event-scope'

/**
 * O módulo Inteligência Veicular dentro do civitas-app. Tudo do módulo fica em `.iv-root`: o CSS dele vale só aí
 * (postcss.config.mjs) e os portais (popover, select, tooltip) abrem dentro dele. O módulo rola a página inteira, como
 * no painel original; o civitas-app trava a rolagem do body, então ela é liberada enquanto o módulo está aberto.
 */
export function VehicleIntelligenceRoot({
  fontClassName,
}: {
  fontClassName: string
}) {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  )

  useEffect(() => {
    const previous = document.body.style.overflowY
    document.body.style.overflowY = 'auto'
    return () => {
      document.body.style.overflowY = previous
    }
  }, [])

  // Sem a tela completa, as telas além de Placas correlatas e Perfil de placa levam para Placas correlatas. A
  // permissão vem do civitas-api (não do cookie do login), a mesma que o sidebar usa para esconder os itens.
  const router = useRouter()
  const pathname = usePathname()
  const { permissions, resolved } = useResolvedTicketModulePermissions(null)
  const fullAccess = canViewTicketScreen(
    permissions,
    VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
  )
  const allowed =
    resolved && isRouteAllowed(parseRoute(toRoutePath(pathname)), fullAccess)
  useEffect(() => {
    if (resolved && !allowed)
      router.replace(`${toAppPath(LIMITED_HOME_PATH)}${window.location.search}`)
  }, [allowed, resolved, router])

  return (
    <div className={`iv-root ${fontClassName}`} data-recorte={recorteAtual}>
      <PortalContainerContext.Provider value={portalContainer}>
        <EventScopeProvider>
          {allowed ? (
            <App />
          ) : (
            <div className="flex h-screen items-center justify-center">
              <Spinner />
            </div>
          )}
        </EventScopeProvider>
      </PortalContainerContext.Provider>
      <div ref={setPortalContainer} className="iv-portal-root" />
    </div>
  )
}
