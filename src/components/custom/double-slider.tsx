'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@/lib/utils'

interface CustomSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  unity?: string
  labelFormatter?: (value: number, thumbIndex: number) => string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  CustomSliderProps
>(({ className, unity, labelFormatter, ...props }, ref) => {
  const value0 = props.value?.[0]
  const value1 = props.value?.[1]

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <span className="absolute -top-6 right-0 w-12 whitespace-nowrap text-center text-sm">
          {value0 !== undefined
            ? labelFormatter
              ? labelFormatter(value0, 0)
              : `${value0} ${unity}`
            : ''}
        </span>
      </SliderPrimitive.Thumb>
      <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <span className="absolute -top-6 left-0 w-12 whitespace-nowrap text-center text-sm">
          {value1 !== undefined
            ? labelFormatter
              ? labelFormatter(value1, 1)
              : `${value1} ${unity}`
            : ''}
        </span>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
