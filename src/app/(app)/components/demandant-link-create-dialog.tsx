'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
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
import { postMonitoredPlateDemandantLink } from '@/http/cars/monitored/post-monitored-plate-demandant-link'
import type { Demandant, DemandantLink } from '@/models/entities'
import { genericErrorMessage, isConflictError } from '@/utils/error-handlers'

import { fromDatetimeLocalValue } from './demandant-link-datetime'

interface DemandantLinkCreateDialogProps {
  plate: string
  open: boolean
  onOpenChange: (open: boolean) => void
  demandants: Demandant[]
  existingLinks: DemandantLink[]
  onOpenCreateDemandant: () => void
}

export function DemandantLinkCreateDialog({
  plate,
  open,
  onOpenChange,
  demandants,
  existingLinks,
  onOpenCreateDemandant,
}: DemandantLinkCreateDialogProps) {
  const queryClient = useQueryClient()
  const [demandantTitle, setDemandantTitle] = useState('')
  const [demandantId, setDemandantId] = useState('')
  const [reference, setReference] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) {
      setDemandantTitle('')
      setDemandantId('')
      setReference('')
      setValidUntil('')
      setNotes('')
    }
  }, [open])

  const linkedIds = new Set(existingLinks.map((l) => l.demandant.id))
  const availableDemandants = demandants.filter((d) => !linkedIds.has(d.id))

  const postMutation = useMutation({
    mutationFn: postMonitoredPlateDemandantLink,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored', data.plate],
      })
      toast.success('Vínculo adicionado.')
      onOpenChange(false)
    },
    onError: (error) => {
      console.error(error)
      if (isConflictError(error)) {
        toast.error('Este demandante já está vinculado a esta placa.')
      } else {
        toast.error(genericErrorMessage)
      }
    },
  })

  function handleSubmit() {
    const ref = reference.trim()
    if (!demandantId || !ref) {
      toast.error('Selecione o demandante e informe o número de referência.')
      return
    }
    let validUntilIso: string | undefined
    if (validUntil.trim()) {
      validUntilIso = fromDatetimeLocalValue(validUntil)
      if (!validUntilIso) {
        toast.error('Data de validade inválida.')
        return
      }
    }
    postMutation.mutate({
      plate,
      demandantId,
      referenceNumber: ref,
      validUntil: validUntilIso,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo vínculo com demandante</DialogTitle>
          <DialogDescription>
            Placa {plate}. O demandante não pode repetir nesta placa.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <Label>Demandante</Label>
            <SelectWithSearch
              value={demandantTitle}
              onSelect={(item) => {
                setDemandantTitle(item.label)
                setDemandantId(item.value)
              }}
              options={availableDemandants.map((item) => ({
                label: `${item.name} (${item.organization.acronym})`,
                value: item.id,
              }))}
              disabled={postMutation.isPending}
              placeholder="Selecione"
              topAction={
                <div className="flex justify-center p-2">
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    type="button"
                    onClick={onOpenCreateDemandant}
                  >
                    Criar novo demandante
                  </Button>
                </div>
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-link-ref">Nº de referência</Label>
            <Input
              id="create-link-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={50}
              disabled={postMutation.isPending}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-link-until">Validade (opcional)</Label>
            <Input
              id="create-link-until"
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={postMutation.isPending}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-link-notes">Notas (opcional)</Label>
            <Textarea
              id="create-link-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={postMutation.isPending}
              rows={3}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full min-w-0 flex-col gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={postMutation.isPending}
            className="h-10 w-full shrink-0 font-normal"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={postMutation.isPending}
            className="h-10 w-full shrink-0 font-normal"
            onClick={handleSubmit}
          >
            {postMutation.isPending ? (
              <Spinner className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              'Adicionar vínculo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
