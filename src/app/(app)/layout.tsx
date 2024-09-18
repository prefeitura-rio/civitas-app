import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
import { MonitoredPlatesContextProvider } from '@/contexts/monitored-plates-context'
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
      <MonitoredPlatesContextProvider>
        <div className="flex min-h-screen min-w-screen-2xl">
          <Sidebar />
          {/* <div className="w-full">
          <span>abcdefasda</span>
          </div> */}
          {children}
        </div>
      </MonitoredPlatesContextProvider>
    </CustomQueryClientProvider>
  )
}
