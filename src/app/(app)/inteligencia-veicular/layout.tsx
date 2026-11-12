import type { Metadata } from 'next'
// eslint-disable-next-line camelcase -- nome exportado pelo next/font
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getSessionCookieName, validateAndRefreshSession } from '@/auth/session'
import { canViewTicketScreen } from '@/http/tickets/ticket-module-permissions-me'
import { fetchSessionScreenPermissions } from '@/lib/bff/screen-permissions'
import { VEHICLE_INTELLIGENCE_SCREEN_CODE } from '@/lib/vehicle-intelligence/constants'

import { VehicleIntelligenceIsland } from './components/vehicle-intelligence-island'

// As fontes do módulo, lidas pelo CSS dele em --iv-font-sans e --iv-font-mono.
const sans = Inter({ subsets: ['latin'], variable: '--iv-font-sans' })
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--iv-font-mono',
})

export const metadata: Metadata = {
  title: 'CIVITAS — Inteligência Veicular',
}

// Guard no servidor: só quem tem a tela vehicle_intelligence (Coordenador e Analista) abre o módulo. A permissão vem
// do civitas-api, não do cookie gravado no login.
//
// Aqui não se renova o token (um Server Component não grava cookies). Se o token já expirou, a consulta volta 401 e o
// módulo abre; quem decide é o BFF `/api/bff-iv`, que renova o token e confere a mesma permissão a cada chamada.
//
// O módulo fica montado aqui, e não na página: trocar de tela (/inteligencia-veicular/groups, ...) não o desmonta.
export default async function VehicleIntelligenceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionValue = cookies().get(getSessionCookieName())?.value
  const result = await validateAndRefreshSession(sessionValue, false, false)
  if (!result.session) {
    redirect('/auth/sign-in')
  }

  const permissions = await fetchSessionScreenPermissions(result.session)
  if (
    permissions.status === 'ok' &&
    !canViewTicketScreen(
      permissions.permissions,
      VEHICLE_INTELLIGENCE_SCREEN_CODE,
    )
  ) {
    redirect('/forbidden')
  }

  return (
    <div className="min-w-0 flex-1">
      <VehicleIntelligenceIsland
        fontClassName={`${sans.variable} ${mono.variable}`}
      />
      {children}
    </div>
  )
}
