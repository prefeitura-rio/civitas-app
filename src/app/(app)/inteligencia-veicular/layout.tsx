import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getSessionCookieName, validateAndRefreshSession } from '@/auth/session'
import { canViewTicketScreen } from '@/http/tickets/ticket-module-permissions-me'
import { fetchSessionScreenPermissions } from '@/lib/bff/screen-permissions'
import { VEHICLE_INTELLIGENCE_SCREEN_CODE } from '@/lib/vehicle-intelligence/constants'

// Guard no servidor: só quem tem a tela vehicle_intelligence (Coordenador e Analista) abre o módulo. A permissão vem
// do civitas-api, não do cookie gravado no login.
//
// Aqui não se renova o token (um Server Component não grava cookies). Se o token já expirou, a consulta volta 401 e a
// página abre; quem decide é o BFF `/api/bff-iv`, que renova o token, confere a mesma permissão e responde 403.
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

  return <div className="min-w-0 flex-1">{children}</div>
}
