import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
import { SidebarContextProvider } from '@/contexts/sidebar-context'
import { CustomQueryClientProvider } from '@/hooks/query-client-provider'

import { Sidebar } from './components/sidebar/sidebar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isAuthenticated()) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex min-h-screen">
      <CustomQueryClientProvider>
        <SidebarContextProvider>
          <Sidebar />
          {children}
        </SidebarContextProvider>
      </CustomQueryClientProvider>
    </div>
  )
}
