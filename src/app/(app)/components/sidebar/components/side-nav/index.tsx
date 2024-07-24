'use client'
import { ChevronDown, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useSidebar } from '@/hooks/use-contexts/use-sidebar-context'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/models/utils'
import { logout } from '@/utils/logout'

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
    <div className="flex h-[calc(100%-4rem)] flex-col justify-between">
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
                <Tooltip
                  asChild
                  text={item.title}
                  side="right"
                  hideContent={isOpen}
                >
                  <AccordionTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'group relative flex items-center justify-between text-sm tracking-tight duration-200 hover:bg-muted hover:no-underline',
                      )}
                      size="sm"
                    >
                      <item.icon className={cn('h-4 w-4', item.color)} />
                      <div
                        className={cn(
                          'absolute left-10 text-sm tracking-tight duration-200',
                          !isOpen && className,
                        )}
                      >
                        {item.title}
                      </div>

                      {isOpen && (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      )}
                    </Button>
                  </AccordionTrigger>
                </Tooltip>
                <AccordionContent className="mt-2 space-y-2 pb-1">
                  {item.children?.map((child) => (
                    // Essa div evita um bug de offset do tooltip
                    <div key={child.title}>
                      <Tooltip
                        asChild
                        side="right"
                        text={child.title}
                        hideContent={isOpen}
                      >
                        <Button
                          asChild
                          className={cn(
                            'group relative flex justify-start gap-x-3',
                            path === child.href && 'bg-muted hover:bg-muted',
                          )}
                          variant="ghost"
                          onClick={() => {
                            if (setOpen) setOpen(false)
                          }}
                          size="sm"
                        >
                          <Link
                            href={child.href}
                            onClick={() => {
                              if (setOpen) setOpen(false)
                            }}
                          >
                            <child.icon
                              className={cn('h-4 w-4', child.color)}
                            />
                            <div
                              className={cn(
                                'absolute left-10 text-sm tracking-tight duration-200',
                                !isOpen && className,
                              )}
                            >
                              {child.title}
                            </div>
                          </Link>
                        </Button>
                      </Tooltip>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            // Essa div evita um bug de offset do tooltip
            <div key={item.title}>
              <Tooltip
                asChild
                text={item.title}
                side="right"
                hideContent={isOpen}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    'group relative flex justify-start',
                    path === item.href && 'bg-muted hover:bg-muted',
                  )}
                  onClick={() => {
                    if (setOpen) setOpen(false)
                  }}
                  asChild
                  size="sm"
                >
                  <Link href={item.href}>
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    <span
                      className={cn(
                        'absolute left-10 text-sm tracking-tight duration-200',
                        !isOpen && className,
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </Button>
              </Tooltip>
            </div>
          ),
        )}
      </div>
      <Tooltip asChild text={'Sair'} side="right" hideContent={isOpen}>
        <Button
          onClick={() => {
            if (setOpen) setOpen(false)
            logout()
          }}
          variant="ghost"
          className={'group relative flex justify-start'}
          size="sm"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span
            className={cn(
              'absolute left-10 text-sm tracking-tight duration-200',
              !isOpen && className,
            )}
          >
            Sair
          </span>
        </Button>
      </Tooltip>
    </div>
  )
}
