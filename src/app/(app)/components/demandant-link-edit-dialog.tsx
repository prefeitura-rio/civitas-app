'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Spinner } from '@/components/custom/spinner'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { deleteMonitoredPlateDemandantLink } from '@/http/cars/monitored/delete-monitored-plate-demandant-link'
import {
  patchMonitoredPlateDemandantLink,
  type PatchMonitoredPlateDemandantLinkInput,
} from '@/http/cars/monitored/patch-monitored-plate-demandant-link'
import type { DemandantLink } from '@/models/entities'
import { genericErrorMessage, isConflictError } from '@/utils/error-handlers'

import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from './demandant-link-datetime'

interface DemandantLinkEditDialogProps {
  plate: string
  link: DemandantLink | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemandantLinkEditDialog({
  plate,
  link,
  open,
  onOpenChange,
}: DemandantLinkEditDialogProps) {
  const queryClient = useQueryClient()
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [active, setActive] = useState(true)
  const [validUntilLocal, setValidUntilLocal] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (!link) return
    setReference(link.reference_number)
    setNotes(link.notes ?? '')
    setActive(link.active)
    setValidUntilLocal(toDatetimeLocalValue(link.valid_until))
  }, [link])

  useEffect(() => {
    if (!open) setConfirmDeleteOpen(false)
  }, [open])

  const patchMutation = useMutation({
    mutationFn: patchMonitoredPlateDemandantLink,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored', data.plate],
      })
      toast.success('Vínculo atualizado.')
      onOpenChange(false)
    },
    onError: (error) => {
      console.error(error)
      if (isConflictError(error)) {
        toast.error('Conflito ao atualizar o vínculo.')
      } else {
        toast.error(genericErrorMessage)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMonitoredPlateDemandantLink,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored', data.plate],
      })
      toast.success('Vínculo removido.')
      setConfirmDeleteOpen(false)
      onOpenChange(false)
    },
    onError: () => toast.error(genericErrorMessage),
  })

  const busy = patchMutation.isPending || deleteMutation.isPending

  function handleSave() {
    if (!link) return

    const payload: PatchMonitoredPlateDemandantLinkInput = {
      plate,
      linkId: link.id,
    }

    const trimmedRef = reference.trim()
    if (!trimmedRef) {
      toast.error('O número de referência não pode ficar vazio.')
      return
    }

    if (trimmedRef !== link.reference_number)
      payload.referenceNumber = trimmedRef

    const linkNotes = link.notes ?? ''
    if (notes.trim() !== linkNotes) payload.notes = notes.trim()

    if (active !== link.active) payload.active = active

    const origLocal = toDatetimeLocalValue(link.valid_until)
    if (validUntilLocal.trim() !== origLocal) {
      if (validUntilLocal.trim() === '') payload.validUntil = null
      else {
        const iso = fromDatetimeLocalValue(validUntilLocal)
        payload.validUntil = iso ?? null
      }
    }

    if (Object.keys(payload).length <= 2) {
      toast.message('Nada alterado neste vínculo.')
      return
    }

    patchMutation.mutate(payload)
  }

  if (!link) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar vínculo</DialogTitle>
            <DialogDescription>
              {link.demandant.name} ({link.demandant.organization.acronym})
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-w-0 flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-link-ref">Nº de referência</Label>
              <Input
                id="edit-link-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={50}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-link-until">Validade do vínculo</Label>
              <Input
                id="edit-link-until"
                type="datetime-local"
                value={validUntilLocal}
                onChange={(e) => setValidUntilLocal(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-link-notes">Notas do vínculo</Label>
              <Textarea
                id="edit-link-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={busy}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-link-active"
                checked={active}
                onCheckedChange={setActive}
                disabled={busy}
              />
              <Label htmlFor="edit-link-active" className="font-normal">
                Vínculo ativo
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Radares LPR neste víncio: {link.radars.length}. Lista de
              equipamentos só via API por enquanto.
            </p>
          </div>

          <div className="mt-2 flex w-full min-w-0 flex-col gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={busy}
              className="h-10 w-full shrink-0 font-normal"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="default"
              disabled={busy}
              className="h-10 w-full shrink-0 font-normal"
              onClick={handleSave}
            >
              {patchMutation.isPending ? (
                <Spinner className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                'Salvar alterações'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              className="h-10 w-full shrink-0 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Remover este vínculo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
            <AlertDialogDescription>
              O víncio com <strong>{link.demandant.name}</strong> será excluído.
              A placa e os demais víncios permanecem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                deleteMutation.mutate({ plate, linkId: link.id })
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
