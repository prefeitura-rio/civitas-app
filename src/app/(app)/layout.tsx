import { redirect } from 'next/navigation'

import { hasAccessToken } from '@/auth/auth'
import { MonitoredPlatesContextProvider } from '@/contexts/monitored-plates-context'
import { OperationsContextProvider } from '@/contexts/operations-context'
import { CustomQueryClientProvider } from '@/hooks/query-client-provider'
import LogoutTimeOut from '@/utils/logout-timeout'

import { Sidebar } from './components/sidebar'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isAuthenticaded = await hasAccessToken()

  if (!isAuthenticaded) {
    redirect('/auth/sign-in')
  }

  return (
    <CustomQueryClientProvider>
      <OperationsContextProvider>
        <MonitoredPlatesContextProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <LogoutTimeOut />
            {children}
          </div>
        </MonitoredPlatesContextProvider>
      </OperationsContextProvider>
    </CustomQueryClientProvider>
  )
}
