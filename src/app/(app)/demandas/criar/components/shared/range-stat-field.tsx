import * as Slider from '@radix-ui/react-slider'

import { Label } from '@/components/ui/label'

import styles from '../../ticket-create/ticket-create-form.module.css'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit: string
  disabled?: boolean
}

export function RangeStatField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className={styles.fieldLabel}>{label}</Label>
        <p className="text-2xl font-semibold text-white">
          {value} {unit}
        </p>
      </div>

      <Slider.Root
        className={`relative flex h-6 w-full touch-none select-none items-center ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(values) => onChange(values[0] ?? min)}
      >
        <Slider.Track className="relative h-2 grow overflow-hidden rounded-full bg-slate-700">
          <Slider.Range className="absolute h-full rounded-full bg-cyan-400" />
        </Slider.Track>

        <Slider.Thumb
          className="block h-6 w-6 rounded-full border-2 border-cyan-400 bg-[#0f1724] shadow outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label={label}
        />
      </Slider.Root>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Min: {min} {unit}
        </span>
        <span>
          Max: {max} {unit}
        </span>
      </div>
    </div>
  )
}
