'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import type { TicketDashboardWidgetsFormValues } from '@/http/tickets/ticket-dashboard-widgets-config'

import tcFormStyles from '../../../criar/ticket-create/ticket-create-form.module.css'
import type { WidgetConfigSection } from '../widgets-config.constants'
import styles from '../widgets-config.module.css'

type WidgetConfigSectionProps = {
  section: WidgetConfigSection
  control: Control<TicketDashboardWidgetsFormValues>
  disabled?: boolean
}

export function WidgetConfigSection({
  section,
  control,
  disabled = false,
}: WidgetConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={styles.sectionCard}
    >
      <header className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{section.title}</span>
        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Recolher seção' : 'Expandir seção'}
        >
          {isOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
      </header>

      <CollapsibleContent>
        {section.fields.map((field) => (
          <div key={field.name} className={styles.widgetRow}>
            <p className={styles.widgetLabel}>{field.label}</p>
            <Controller
              control={control}
              name={field.name}
              render={({ field: controllerField }) => (
                <Switch
                  size="sm"
                  className={`${styles.widgetSwitch} ${tcFormStyles.apelidoToggle}`}
                  checked={controllerField.value}
                  onCheckedChange={controllerField.onChange}
                  disabled={disabled}
                  aria-label={field.label}
                />
              )}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
