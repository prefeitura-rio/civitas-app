'use client'
import { formatDate } from 'date-fns'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Demandant, DemandantLink } from '@/models/entities'

import { DemandantLinkCreateDialog } from './demandant-link-create-dialog'
import { DemandantLinkEditDialog } from './demandant-link-edit-dialog'

interface MonitoredPlateDemandantLinksPanelProps {
  plate: string
  links: DemandantLink[] | undefined
  demandants: Demandant[]
  disabled?: boolean
  onOpenCreateDemandant: () => void
}

export function MonitoredPlateDemandantLinksPanel({
  plate,
  links = [],
  demandants,
  disabled = false,
  onOpenCreateDemandant,
}: MonitoredPlateDemandantLinksPanelProps) {
  const [editingLink, setEditingLink] = useState<DemandantLink | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Vínculos com demandantes
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => setCreateOpen(true)}
        >
          Adicionar novo víncio
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Clique em um víncio para editar referência, validade, notas e status.
      </p>

      {links.length > 0 ? (
        <ul className="flex max-h-60 flex-col gap-2 overflow-auto pr-1">
          {links.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                disabled={disabled}
                className="w-full rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setEditingLink(link)}
              >
                <div className="font-medium">{link.demandant.name}</div>
                <div className="text-xs text-muted-foreground">
                  {link.demandant.organization.acronym} · Ref.{' '}
                  {link.reference_number}
                  {link.valid_until
                    ? ` · até ${formatDate(new Date(link.valid_until), 'dd/MM/yyyy HH:mm')}`
                    : ''}
                  {` · ${link.active ? 'ativo' : 'inativo'}`} ·{' '}
                  {link.radars.length} LPR
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum vínculo cadastrado ainda.
        </p>
      )}

      <DemandantLinkEditDialog
        plate={plate}
        link={editingLink}
        open={!!editingLink}
        onOpenChange={(next) => {
          if (!next) setEditingLink(null)
        }}
      />

      <DemandantLinkCreateDialog
        plate={plate}
        open={createOpen}
        onOpenChange={setCreateOpen}
        demandants={demandants}
        existingLinks={links}
        onOpenCreateDemandant={onOpenCreateDemandant}
      />
    </div>
  )
}
