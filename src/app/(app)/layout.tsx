import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
import { DemandantsContextProvider } from '@/contexts/demandants-context'
import { MonitoredPlatesContextProvider } from '@/contexts/monitored-plates-context'
import { OperationsContextProvider } from '@/contexts/operations-context'
import { OrganizationsContextProvider } from '@/contexts/organizations-context'
import { CustomQueryClientProvider } from '@/hooks/query-client-provider'
import {
  parseTicketModulePermissionsCookie,
  TICKET_MODULE_PERMISSIONS_COOKIE,
} from '@/http/tickets/ticket-module-permissions-me'

import { Sidebar } from './components/sidebar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isAuthenticated()) {
    redirect('/auth/sign-in')
  }

  const ticketPermissionsFromCookie = parseTicketModulePermissionsCookie(
    cookies().get(TICKET_MODULE_PERMISSIONS_COOKIE)?.value,
  )

  return (
    <CustomQueryClientProvider>
      <OrganizationsContextProvider>
        <DemandantsContextProvider>
          <OperationsContextProvider>
            <MonitoredPlatesContextProvider>
              <div className="flex min-h-screen w-full">
                <Sidebar
                  initialTicketModulePermissions={ticketPermissionsFromCookie}
                />
                {children}
              </div>
            </MonitoredPlatesContextProvider>
          </OperationsContextProvider>
        </DemandantsContextProvider>
      </OrganizationsContextProvider>
    </CustomQueryClientProvider>
  )
}
