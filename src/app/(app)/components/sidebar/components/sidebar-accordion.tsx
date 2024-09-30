import { ChevronDown, icons } from 'lucide-react'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

import type { Category } from './constants'
import { SidebarButton } from './sidebar-button'

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
          {modules.map((module, index) => (
            <SidebarButton
              key={index}
              icon={module.icon}
              title={module.title}
              path={module.path}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </>
  )
}
