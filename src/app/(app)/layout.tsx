import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
import { DemandantsContextProvider } from '@/contexts/demandants-context'
import { MonitoredPlatesContextProvider } from '@/contexts/monitored-plates-context'
import { OrganizationsContextProvider } from '@/contexts/organizations-context'
import { CustomQueryClientProvider } from '@/hooks/query-client-provider'

import { Sidebar } from './components/sidebar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isAuthenticated()) {
    redirect('/auth/sign-in')
  }

  return (
    <CustomQueryClientProvider>
      <OrganizationsContextProvider>
        <DemandantsContextProvider>
          <MonitoredPlatesContextProvider>
            <div className="flex min-h-screen w-full">
              <Sidebar />
              {children}
            </div>
          </MonitoredPlatesContextProvider>
        </DemandantsContextProvider>
      </OrganizationsContextProvider>
    </CustomQueryClientProvider>
  )
}
