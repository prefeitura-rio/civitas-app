import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { cn } from '@/modules/vehicle-intelligence/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
})
Card.displayName = 'Card'

function slotDiv(slot: string, baseClassName: string) {
  const Component = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'>
  >(({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot={slot}
      className={cn(baseClassName, className)}
      {...props}
    />
  ))
  Component.displayName = slot
  return Component
}

const CardHeader = slotDiv(
  'card-header',
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-[[data-slot=card-action]]:grid-cols-[1fr_auto] [.border-b]:pb-6',
)
const CardTitle = slotDiv('card-title', 'leading-none font-semibold')
const CardDescription = slotDiv(
  'card-description',
  'text-sm text-muted-foreground',
)
const CardAction = slotDiv(
  'card-action',
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
)
const CardContent = slotDiv('card-content', 'px-6')
const CardFooter = slotDiv(
  'card-footer',
  'flex items-center px-6 [.border-t]:pt-6',
)

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
