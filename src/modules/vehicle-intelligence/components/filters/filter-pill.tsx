import { ChevronDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'

/** Pill "Rótulo **valor** ▾" com o popover das opções. */
export function FilterPill({
  label,
  value,
  icon,
  children,
  menuClassName,
}: {
  label: string
  value: string
  icon?: ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  menuClassName?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="filter-pill"
          aria-label={`${label}: ${value}`}
        >
          {icon}
          <span>{label}</span>
          <b>{value}</b>
          <ChevronDown size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={`filter-pill-menu${menuClassName ? ` ${menuClassName}` : ''}`}
      >
        {typeof children === 'function'
          ? children(() => setOpen(false))
          : children}
      </PopoverContent>
    </Popover>
  )
}
