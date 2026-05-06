import { ChevronDown, icons } from 'lucide-react'
import Link from 'next/link'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { useEmailNaoLidosCount } from '@/hooks/useQueries/useEmailNaoLidosCount'

import type { Category, ModuleWithChildren } from './constants'
import { isModuleWithChildren } from './constants'
import { SidebarButton } from './sidebar-button'

function SidebarNestedModule({ module }: { module: ModuleWithChildren }) {
  const showUnreadBadge = module.ticketScreenCode === 'inbox'
  const { data: unreadCount } = useEmailNaoLidosCount(showUnreadBadge)
  const LucideIcon = icons[module.icon]
  return (
    <Collapsible className="w-full">
      <div className="flex w-full min-w-0 items-center justify-start">
        {module.path ? (
          <>
            <Button
              variant="ghost"
              className="min-w-0 flex-1 justify-start px-2 group-hover:w-full"
              asChild
            >
              <Link
                href={module.path}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <LucideIcon className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate opacity-0 transition-all duration-300 group-hover:opacity-100">
                  {module.title}
                </span>
                {showUnreadBadge &&
                unreadCount != null &&
                unreadCount.total > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-auto shrink-0 px-1.5 py-0 text-[10px] tabular-nums opacity-0 transition-all duration-300 group-hover:opacity-100"
                    aria-label={`${unreadCount.total} não lidos`}
                  >
                    {unreadCount.total > 99 ? '99+' : unreadCount.total}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 [&[data-state=open]>svg]:rotate-180"
                aria-label={`Expandir ${module.title}`}
              >
                <ChevronDown className="AccordionChevron size-4 shrink-0" />
              </Button>
            </CollapsibleTrigger>
          </>
        ) : (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 group-hover:w-full [&[data-state=open]>svg]:rotate-180"
            >
              <div className="flex items-center gap-2">
                <LucideIcon className="shrink-0 text-muted-foreground" />
                <span className="opacity-0 transition-all duration-300 group-hover:opacity-100">
                  {module.title}
                </span>
              </div>
              <ChevronDown className="AccordionChevron size-4 shrink-0" />
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
      <CollapsibleContent>
        <div className="ml-2 mt-1 space-y-0 border-l border-border pl-2">
          {module.children.map((child, index) => (
            <SidebarButton
              key={index}
              icon={child.icon}
              title={child.title}
              path={child.path}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SidebarAccordion({ icon, title, modules }: Category) {
  const LucideIcon = icons[icon]
  return (
    <>
      <Separator className="my-4" />
      <AccordionItem value={title} className="border-b-0">
        <AccordionTrigger className="AccordionTrigger p-0 no-underline">
          <div className="flex items-center justify-start gap-2 p-2">
            <LucideIcon className="shrink-0 text-primary" />
            <span className="whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100">
              {title}
            </span>
          </div>
          <ChevronDown className="AccordionChevron size-6 shrink-0" />
        </AccordionTrigger>
        <AccordionContent className="">
          {modules.map((module, index) =>
            isModuleWithChildren(module) ? (
              <SidebarNestedModule key={index} module={module} />
            ) : (
              <SidebarButton
                key={index}
                icon={module.icon}
                title={module.title}
                path={module.path}
              />
            ),
          )}
        </AccordionContent>
      </AccordionItem>
    </>
  )
}
