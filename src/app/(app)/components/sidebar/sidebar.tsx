'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/use-profile'
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
  const { profile } = useProfile()

  const handleToggle = () => {
    setStatus(true)
    toggle()
    setTimeout(() => setStatus(false), 500)
  }

  console.log({ profile })

  return (
    <nav
      className={cn(
        `relative z-10 h-screen border-r`,
        status && 'duration-500',
        isOpen ? 'w-72' : 'w-14',
        className,
      )}
    >
      <Button
        variant="outline"
        onClick={handleToggle}
        className="absolute -right-[0.85rem] top-4 z-50 flex h-7 w-7 items-center justify-center rounded-full border-2 p-0"
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </Button>
      <div className="h-full space-y-1 px-2 py-4 pt-10">
        <div className="flex justify-center py-4">
          {profile ? (
            isOpen ? (
              <span>{profile.username}</span>
            ) : (
              <span>{profile.username[0].toUpperCase()}</span>
            )
          ) : (
            <Skeleton className="my-1 h-4 w-full" />
          )}
        </div>
        <SideNav
          className="w-0 text-background opacity-0 transition-all duration-300"
          items={navItems}
        />
      </div>
    </nav>
  )
}
