'use client'
import { ChevronLeft } from 'lucide-react'
import React, { useState } from 'react'

import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

import { SideNav } from './side-nav'
import { navItems } from './sidebar-constants'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar()
  const [status, setStatus] = useState(false)

  const handleToggle = () => {
    setStatus(true)
    toggle()
    setTimeout(() => setStatus(false), 500)
  }

  return (
    <nav
      className={cn(
        `relative z-10 h-screen border-r`,
        status && 'duration-500',
        isOpen ? 'w-80' : 'w-[78px]',
        className,
      )}
    >
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-4 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          !isOpen && 'rotate-180',
        )}
        onClick={handleToggle}
      />
      <div className="h-full space-y-1 px-3 py-4 pt-8">
        <SideNav
          className="w-0 text-background opacity-0 transition-all duration-300"
          items={navItems}
        />
      </div>
    </nav>
  )
}
