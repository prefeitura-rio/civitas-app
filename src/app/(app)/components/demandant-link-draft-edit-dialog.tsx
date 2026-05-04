'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Demandant } from '@/models/entities'

import {
  isDemandantLinkValidUntilBeyondMax,
  parseIsoToDate,
  validUntilInstantsEqual,
} from './demandant-link-datetime'
import { DemandantLinkLprMultiSelect } from './demandant-link-lpr-multi-select'
import { DemandantLinkValidUntilPicker } from './demandant-link-valid-until-picker'
import type { MonitoredPlateDraftDemandantLink } from './monitored-plate-draft-demandant-link'

function lprEquipmentIdsEqual(
  a: string[] | undefined,
  b: string[] | undefined,
) {
  const sa = [...(a ?? [])].sort().join('\0')
  const sb = [...(b ?? [])].sort().join('\0')
  return sa === sb
}

interface DemandantLinkDraftEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: MonitoredPlateDraftDemandantLink | null
  demandant: Demandant | undefined
  onSave: (
    clientId: string,
    data: Pick<
      MonitoredPlateDraftDemandantLink,
      'referenceNumber' | 'validUntil' | 'notes' | 'lprEquipmentIds'
    >,
  ) => void
  onRemove: (clientId: string) => void
}

export function DemandantLinkDraftEditDialog({
  open,
  onOpenChange,
  draft,
  demandant,
  onSave,
  onRemove,
}: DemandantLinkDraftEditDialogProps) {
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [lprEquipmentIds, setLprEquipmentIds] = useState<string[]>([])
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  useEffect(() => {
    if (!draft) return
    setReference(draft.referenceNumber)
    setNotes(draft.notes ?? '')
    setValidUntilDate(parseIsoToDate(draft.validUntil))
    setLprEquipmentIds(draft.lprEquipmentIds ? [...draft.lprEquipmentIds] : [])
  }, [draft])

  useEffect(() => {
    if (!open) setConfirmRemoveOpen(false)
  }, [open])

  function handleSave() {
    if (!draft) return
    const trimmedRef = reference.trim()
    if (!trimmedRef) {
      toast.error('O número de referência não pode ficar vazio.')
      return
    }

    if (isDemandantLinkValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }

    const validUntil = validUntilDate?.toISOString()

    const origRef = draft.referenceNumber.trim()
    const origNotes = (draft.notes ?? '').trim()
    const origValidDate = parseIsoToDate(draft.validUntil)

    const nextNotes = notes.trim()
    if (
      trimmedRef === origRef &&
      nextNotes === origNotes &&
      validUntilInstantsEqual(origValidDate, validUntilDate) &&
      lprEquipmentIdsEqual(draft.lprEquipmentIds, lprEquipmentIds)
    ) {
      toast.message('Nada alterado neste vínculo.')
      return
    }

    onSave(draft.clientId, {
      referenceNumber: trimmedRef,
      validUntil,
      notes: nextNotes || undefined,
      lprEquipmentIds: lprEquipmentIds.length > 0 ? lprEquipmentIds : undefined,
    })
    toast.success('Vínculo atualizado no cadastro.')
    onOpenChange(false)
  }

  if (!draft || !demandant) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar vínculo</DialogTitle>
            <DialogDescription className="space-y-1 text-left">
              <span className="block text-foreground">{demandant.name}</span>
              <span className="block text-sm text-muted-foreground">
                Organização: {demandant.organization.name} (
                {demandant.organization.acronym})
              </span>
              <span className="block text-sm text-muted-foreground">
                Será enviado ao salvar a placa.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-w-0 flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="draft-edit-ref">Nº de referência</Label>
              <Input
                id="draft-edit-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={50}
              />
            </div>
            <DemandantLinkValidUntilPicker
              label="Validade do vínculo"
              value={validUntilDate}
              onChange={setValidUntilDate}
            />
            <DemandantLinkLprMultiSelect
              value={lprEquipmentIds}
              onChange={setLprEquipmentIds}
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="draft-edit-notes">Notas do vínculo</Label>
              <Textarea
                id="draft-edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Os LPR escolhidos aqui serão enviados no cadastro da placa junto
              com este vínculo.
            </p>
          </div>

          <div className="mt-2 flex w-full min-w-0 flex-col gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full shrink-0 font-normal"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-10 w-full shrink-0 font-normal"
              onClick={handleSave}
            >
              Salvar alterações
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full shrink-0 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmRemoveOpen(true)}
            >
              Remover desta lista
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{demandant.name}</strong> sai da lista deste cadastro
              (ainda não foi enviado à API).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                onRemove(draft.clientId)
                setConfirmRemoveOpen(false)
                onOpenChange(false)
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
