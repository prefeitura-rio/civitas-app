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

export default function Sidebar({ className }: SidebarProps) {
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
        `relative z-10 hidden h-screen border-r pt-20 md:block`,
        status && 'duration-500',
        isOpen ? 'w-72' : 'w-[78px]',
        className,
      )}
    >
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-20 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          !isOpen && 'rotate-180',
        )}
        onClick={handleToggle}
      />
      <div className="h-full space-y-4 py-4">
        <div className="h-full px-3 py-2">
          <div className="mt-3 h-full space-y-1">
            <SideNav
              className="text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
              items={navItems}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
