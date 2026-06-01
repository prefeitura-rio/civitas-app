import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  getSessionCookieName,
  isValidSession,
  validateAndRefreshSession,
} from '@/auth/session'
import { SessionActivityTracker } from '@/components/custom/session-activity-tracker'
import { DemandantsContextProvider } from '@/contexts/demandants-context'
import { MonitoredPlatesContextProvider } from '@/contexts/monitored-plates-context'
import { OrganizationsContextProvider } from '@/contexts/organizations-context'
import { CustomQueryClientProvider } from '@/hooks/query-client-provider'
import {
  parseTicketModulePermissionsCookie,
  TICKET_MODULE_PERMISSIONS_COOKIE,
} from '@/http/tickets/ticket-module-permissions-me'

import { Sidebar } from './components/sidebar'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessionValue = cookies().get(getSessionCookieName())?.value

  if (!isValidSession(sessionValue)) {
    redirect('/auth/sign-in')
  }

  // Server-side check without refresh to avoid renewal unrelated to user activity.
  const result = await validateAndRefreshSession(sessionValue, false, false)
  if (!result.session) {
    redirect('/auth/sign-in')
  }

  const ticketPermissionsFromCookie = parseTicketModulePermissionsCookie(
    cookies().get(TICKET_MODULE_PERMISSIONS_COOKIE)?.value,
  )

  return (
    <CustomQueryClientProvider>
      <OrganizationsContextProvider>
        <DemandantsContextProvider>
          <MonitoredPlatesContextProvider>
            <div className="flex min-h-screen w-full">
              <SessionActivityTracker />
              <Sidebar
                initialTicketModulePermissions={ticketPermissionsFromCookie}
              />
              {children}
            </div>
          </MonitoredPlatesContextProvider>
        </DemandantsContextProvider>
      </OrganizationsContextProvider>
    </CustomQueryClientProvider>
  )
}
