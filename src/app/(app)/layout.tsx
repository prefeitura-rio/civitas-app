import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'

import { SideNavMenu } from './components/side-nav-menu'

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
      <SideNavMenu />
      {children}
    </div>
  )
}
