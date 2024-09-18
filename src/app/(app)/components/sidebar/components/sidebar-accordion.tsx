import { ChevronDown, icons } from 'lucide-react'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { Module } from './constants'
import { SidebarButton } from './sidebar-button'

export function SidebarAccordion({ icon, title, products }: Module) {
  const LucideIcon = icons[icon]
  return (
    <AccordionItem value={title}>
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
        {products.map((subitem, index) => (
          <SidebarButton
            key={index}
            icon={subitem.icon}
            title={subitem.title}
            path={subitem.path}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
