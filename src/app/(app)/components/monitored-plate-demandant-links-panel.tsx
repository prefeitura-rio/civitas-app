'use client'
import { formatDate } from 'date-fns'
import { type Dispatch, type SetStateAction, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Demandant, DemandantLink } from '@/models/entities'

import { DemandantLinkCreateDialog } from './demandant-link-create-dialog'
import { DemandantLinkDraftEditDialog } from './demandant-link-draft-edit-dialog'
import { DemandantLinkEditDialog } from './demandant-link-edit-dialog'
import type { MonitoredPlateDraftDemandantLink } from './monitored-plate-draft-demandant-link'

type PanelMode = 'persisted' | 'draft'

interface MonitoredPlateDemandantLinksPanelProps {
  mode: PanelMode
  /** Placa persistida ou valor atual do campo placa no formulário (rascunho). */
  plate: string
  links?: DemandantLink[]
  draftLinks?: MonitoredPlateDraftDemandantLink[]
  onDraftLinksChange?: Dispatch<
    SetStateAction<MonitoredPlateDraftDemandantLink[]>
  >
  demandants: Demandant[]
  disabled?: boolean
  onOpenCreateDemandant: () => void
}

export function MonitoredPlateDemandantLinksPanel({
  mode,
  plate,
  links = [],
  draftLinks = [],
  onDraftLinksChange,
  demandants,
  disabled = false,
  onOpenCreateDemandant,
}: MonitoredPlateDemandantLinksPanelProps) {
  const [editingLink, setEditingLink] = useState<DemandantLink | null>(null)
  const [editingDraft, setEditingDraft] =
    useState<MonitoredPlateDraftDemandantLink | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const reservedDemandantIds =
    mode === 'persisted'
      ? links.map((l) => l.demandant.id)
      : draftLinks.map((d) => d.demandantId)

  function updateDraft(
    clientId: string,
    data: Pick<
      MonitoredPlateDraftDemandantLink,
      'referenceNumber' | 'validUntil' | 'notes' | 'lprEquipmentIds'
    >,
  ) {
    if (!onDraftLinksChange) return
    onDraftLinksChange((prev) =>
      prev.map((d) => (d.clientId === clientId ? { ...d, ...data } : d)),
    )
  }

  function removeDraft(clientId: string) {
    if (!onDraftLinksChange) return
    onDraftLinksChange((prev) => prev.filter((d) => d.clientId !== clientId))
  }

  const helperText =
    mode === 'persisted'
      ? 'Clique em um vínculo para editar referência, validade, notas e status.'
      : 'Vínculos abaixo serão enviados ao cadastrar a placa. Você pode editar ou remover antes de salvar.'

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
          Adicionar novo vínculo
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{helperText}</p>

      {mode === 'persisted' ? (
        links.length > 0 ? (
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
                    {link.demandant.organization.name} (
                    {link.demandant.organization.acronym}) · Ref.{' '}
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
        )
      ) : draftLinks.length > 0 ? (
        <ul className="flex max-h-60 flex-col gap-2 overflow-auto pr-1">
          {draftLinks.map((d) => {
            const dem = demandants.find((x) => x.id === d.demandantId)
            if (!dem) return null
            return (
              <li key={d.clientId}>
                <button
                  type="button"
                  disabled={disabled}
                  className="w-full rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditingDraft(d)}
                >
                  <div className="font-medium">{dem.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {dem.organization.name} ({dem.organization.acronym}) · Ref.{' '}
                    {d.referenceNumber}
                    {d.validUntil
                      ? ` · até ${formatDate(new Date(d.validUntil), 'dd/MM/yyyy HH:mm')}`
                      : ''}
                    {` · rascunho`} · {d.lprEquipmentIds?.length ?? 0} LPR
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum vínculo na lista ainda.
        </p>
      )}

      {mode === 'persisted' && (
        <DemandantLinkEditDialog
          plate={plate}
          link={editingLink}
          open={!!editingLink}
          onOpenChange={(next) => {
            if (!next) setEditingLink(null)
          }}
        />
      )}

      {mode === 'draft' && (
        <DemandantLinkDraftEditDialog
          open={!!editingDraft}
          onOpenChange={(next) => {
            if (!next) setEditingDraft(null)
          }}
          draft={editingDraft}
          demandant={
            editingDraft
              ? demandants.find((x) => x.id === editingDraft.demandantId)
              : undefined
          }
          onSave={updateDraft}
          onRemove={removeDraft}
        />
      )}

      <DemandantLinkCreateDialog
        plate={plate}
        open={createOpen}
        onOpenChange={setCreateOpen}
        demandants={demandants}
        reservedDemandantIds={reservedDemandantIds}
        onOpenCreateDemandant={onOpenCreateDemandant}
        draftOnly={
          mode === 'draft' && onDraftLinksChange
            ? {
                plateDescription: plate,
                onAdd: (payload) => {
                  onDraftLinksChange((prev) => [
                    ...prev,
                    {
                      clientId: crypto.randomUUID(),
                      demandantId: payload.demandantId,
                      referenceNumber: payload.referenceNumber,
                      validUntil: payload.validUntil,
                      notes: payload.notes,
                      lprEquipmentIds: payload.lprEquipmentIds,
                    },
                  ])
                },
              }
            : undefined
        }
      />
    </div>
  )
}
