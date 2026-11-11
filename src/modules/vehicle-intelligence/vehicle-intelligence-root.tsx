'use client'

import 'leaflet/dist/leaflet.css'
import '@/modules/vehicle-intelligence/styles/index.css'

import { useEffect, useState } from 'react'

import { App } from '@/modules/vehicle-intelligence/app/app'
import { openedFromSearch } from '@/modules/vehicle-intelligence/components/plate/plate-search-logic'
import { PortalContainerContext } from '@/modules/vehicle-intelligence/components/ui/portal-container'
import { recorteAtual } from '@/modules/vehicle-intelligence/config/recortes'

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
  // O perfil aberto pela busca em outro recorte chega com `?fatos=todos` ("Ver todos os fatos"): lido uma vez, antes
  // da primeira tela, como no main.tsx do painel.
  useState(openedFromSearch)

  useEffect(() => {
    const previous = document.body.style.overflowY
    document.body.style.overflowY = 'auto'
    return () => {
      document.body.style.overflowY = previous
    }
  }, [])

  return (
    <div className={`iv-root ${fontClassName}`} data-recorte={recorteAtual}>
      <PortalContainerContext.Provider value={portalContainer}>
        <App />
      </PortalContainerContext.Provider>
      <div ref={setPortalContainer} className="iv-portal-root" />
    </div>
  )
}
