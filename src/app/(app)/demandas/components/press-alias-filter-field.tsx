'use client'

import { Switch } from '@/components/ui/switch'

interface PressAliasFilterFieldProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function PressAliasFilterField({
  value,
  onChange,
}: PressAliasFilterFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-medium leading-none tracking-[0.04em] text-[#d9e5f0]">
        APELIDO DE IMPRENSA
      </span>
      <div className="flex min-h-[42px] items-center gap-2">
        <Switch
          checked={value}
          onCheckedChange={onChange}
          aria-label="Filtrar chamados com apelido de imprensa"
        />
        <span className="text-sm text-[#91a6bc]">
          {value ? 'Somente com apelido' : 'Todos os chamados'}
        </span>
      </div>
    </div>
  )
}
