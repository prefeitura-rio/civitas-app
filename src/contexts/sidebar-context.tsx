'use client'
import { createContext, type ReactNode, useState } from 'react'

interface SidebarContextProps {
  isOpen: boolean
  toggle: () => void
}

export const SidebarContext = createContext({} as SidebarContextProps)

interface SidebarContextProviderProps {
  children: ReactNode
}
export function SidebarContextProvider({
  children,
}: SidebarContextProviderProps) {
  const [isOpen, setIsOpen] = useState(true)

  function toggle() {
    setIsOpen(!isOpen)
  }
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}
