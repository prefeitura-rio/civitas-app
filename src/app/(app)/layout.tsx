import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
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
    <div className="flex min-h-screen">
      <CustomQueryClientProvider>
        <Sidebar />
        {children}
      </CustomQueryClientProvider>
    </div>
  )
}
