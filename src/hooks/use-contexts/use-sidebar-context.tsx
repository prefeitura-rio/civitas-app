import { useContext } from 'react'

import { SidebarContext } from '@/contexts/sidebar-context'

export function useSidebar() {
  const sidebarContext = useContext(SidebarContext)
  return sidebarContext
}
