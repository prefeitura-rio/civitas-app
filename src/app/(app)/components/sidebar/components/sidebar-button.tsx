import { ChevronDown, icons } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import type { ModuleProduct } from './constants'

interface SidebarButtonProps extends ModuleProduct {
  isParent?: boolean
}

export function SidebarButton({
  icon,
  title,
  isParent = false,
  path,
}: SidebarButtonProps) {
  const LucideIcon = icons[icon]
  return (
    <div className="AccordionTrigger flex w-full justify-start">
      <Button
        variant="ghost"
        className="justify-between px-2 group-hover:w-full"
        asChild
      >
        <Link href={path}>
          <div className="flex items-center justify-start gap-2">
            <LucideIcon
              data-title={title}
              className="shrink-0 text-muted-foreground data-[title='Início']:text-primary"
            />
            <span className="opacity-0 transition-all duration-300 group-hover:opacity-100">
              {title}
            </span>
          </div>
          {isParent && (
            <ChevronDown className="AccordionChevron size-6 shrink-0" />
          )}
        </Link>
      </Button>
    </div>
  )
}
