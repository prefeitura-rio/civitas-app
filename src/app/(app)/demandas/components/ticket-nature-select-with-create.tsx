'use client'

import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TicketNature } from '@/http/get-ticket-natures/get-ticket-natures'

import styles from './ticket-nature.module.css'
import { TicketNatureCreateDialog } from './ticket-nature-create-dialog'

const TICKET_NATURE_OUTROS_DELITOS_LABEL = 'outros delitos'

function normalizeCatalogLabel(value: string) {
  return value.trim().toLowerCase()
}

function isOutrosDelitosNature(nature: TicketNature | undefined): boolean {
  if (!nature?.name?.trim()) return false
  return (
    normalizeCatalogLabel(nature.name) === TICKET_NATURE_OUTROS_DELITOS_LABEL
  )
}

function mergeNatureOptions(
  options: TicketNature[],
  createdOptions: TicketNature[],
): TicketNature[] {
  const merged = new Map<string, TicketNature>()

  for (const nature of options) {
    merged.set(nature.id, nature)
  }

  for (const nature of createdOptions) {
    merged.set(nature.id, nature)
  }

  return Array.from(merged.values())
}

type TicketNatureSelectWithCreateProps = {
  value: string | null | undefined
  onValueChange: (value: string | null) => void
  options: TicketNature[]
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  onNatureCreated?: (nature: TicketNature) => void
}

export function TicketNatureSelectWithCreate({
  value,
  onValueChange,
  options,
  disabled = false,
  loading = false,
  placeholder = 'Selecione',
  triggerClassName,
  contentClassName,
  itemClassName,
  onNatureCreated,
}: TicketNatureSelectWithCreateProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createdOptions, setCreatedOptions] = useState<TicketNature[]>([])

  const mergedOptions = useMemo(
    () => mergeNatureOptions(options, createdOptions),
    [createdOptions, options],
  )

  useEffect(() => {
    setCreatedOptions((current) =>
      current.filter((nature) =>
        options.every((option) => option.id !== nature.id),
      ),
    )
  }, [options])

  const selectValue = value?.trim() ? value : undefined
  const isDisabled = disabled || loading
  const selectedNature = mergedOptions.find(
    (nature) => nature.id === selectValue,
  )
  const canCreateNature = isOutrosDelitosNature(selectedNature)

  useEffect(() => {
    if (!canCreateNature && isCreateDialogOpen) {
      setIsCreateDialogOpen(false)
    }
  }, [canCreateNature, isCreateDialogOpen])

  function handleNatureCreated(nature: TicketNature) {
    setCreatedOptions((current) => {
      if (current.some((item) => item.id === nature.id)) return current
      return [...current, nature]
    })
    onValueChange(nature.id)
    onNatureCreated?.(nature)
  }

  return (
    <>
      <div className="flex gap-2">
        <Select
          value={selectValue}
          onValueChange={(nextValue) =>
            onValueChange(nextValue.trim() ? nextValue : null)
          }
          disabled={isDisabled}
        >
          <SelectTrigger className={triggerClassName}>
            <SelectValue placeholder={loading ? 'Carregando…' : placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {loading
              ? null
              : mergedOptions.map((nature) => (
                  <SelectItem
                    key={nature.id}
                    value={nature.id}
                    className={itemClassName}
                  >
                    {nature.name}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>

        {canCreateNature ? (
          <button
            type="button"
            className={styles.addNatureButton}
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={isDisabled}
            aria-label="Nova natureza"
            title="Nova natureza"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <TicketNatureCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={handleNatureCreated}
      />
    </>
  )
}
