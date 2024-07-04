'use client'
import { ChevronDown, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/models/utils'
import { logout } from '@/utils/logout'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './subnav-accordion'

interface SideNavProps {
  items: NavItem[]
  setOpen?: (open: boolean) => void
  className?: string
}

export function SideNav({ items, setOpen, className }: SideNavProps) {
  const path = usePathname()
  const { isOpen } = useSidebar()
  const [openItem, setOpenItem] = useState('')
  const [lastOpenItem, setLastOpenItem] = useState('')

  useEffect(() => {
    if (isOpen) {
      setOpenItem(lastOpenItem)
    } else {
      setLastOpenItem(openItem)
      setOpenItem('')
    }
  }, [isOpen])

  return (
    <nav className="flex h-full flex-col justify-between">
      <div className="space-y-2">
        {items.map((item) =>
          item.isChidren ? (
            <Accordion
              type="single"
              collapsible
              className="space-y-2"
              key={item.title}
              value={openItem}
              onValueChange={setOpenItem}
            >
              <AccordionItem value={item.title} className="border-none">
                <AccordionTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'group relative flex h-12 justify-between px-4 py-2 text-base duration-200 hover:bg-muted hover:no-underline',
                  )}
                >
                  <div>
                    <item.icon className={cn('h-5 w-5', item.color)} />
                  </div>
                  <div
                    className={cn(
                      'absolute left-12 text-base duration-200',
                      !isOpen && className,
                    )}
                  >
                    {item.title}
                  </div>

                  {isOpen && (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                  )}
                </AccordionTrigger>
                <AccordionContent className="mt-2 space-y-4 pb-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.title}
                      href={child.href}
                      onClick={() => {
                        if (setOpen) setOpen(false)
                      }}
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        'group relative flex h-12 justify-start gap-x-3',
                        path === child.href &&
                          'bg-muted font-bold hover:bg-muted',
                      )}
                    >
                      <child.icon className={cn('h-5 w-5', child.color)} />
                      <div
                        className={cn(
                          'absolute left-12 text-base duration-200',
                          !isOpen && className,
                        )}
                      >
                        {child.title}
                      </div>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => {
                if (setOpen) setOpen(false)
              }}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'group relative flex h-12 justify-start',
                path === item.href && 'bg-muted font-bold hover:bg-muted',
              )}
            >
              <item.icon className={cn('h-5 w-5', item.color)} />
              <span
                className={cn(
                  'absolute left-12 text-base duration-200',
                  !isOpen && className,
                )}
              >
                {item.title}
              </span>
            </Link>
          ),
        )}
      </div>
      <Button
        onClick={() => {
          if (setOpen) setOpen(false)
          logout()
        }}
        variant="ghost"
        className={'group relative flex h-12 justify-start'}
      >
        <LogOut className="h-5 w-5 text-muted-foreground" />
        <span
          className={cn(
            'absolute left-12 text-base duration-200',
            !isOpen && className,
          )}
        >
          Sair
        </span>
      </Button>
    </nav>
  )
}
