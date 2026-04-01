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
import type { Demandant } from '@/models/entities'
import { genericErrorMessage, isConflictError } from '@/utils/error-handlers'

import {
  getDefaultDemandantLinkValidUntil,
  isDemandantLinkValidUntilBeyondMax,
} from './demandant-link-datetime'
import { DemandantLinkLprMultiSelect } from './demandant-link-lpr-multi-select'
import { DemandantLinkValidUntilPicker } from './demandant-link-valid-until-picker'

export interface DemandantLinkDraftCreatePayload {
  demandantId: string
  referenceNumber: string
  validUntil?: string
  notes?: string
  lprEquipmentIds?: string[]
}

interface DemandantLinkCreateDialogProps {
  plate: string
  open: boolean
  onOpenChange: (open: boolean) => void
  demandants: Demandant[]
  /** Demandantes já vinculados (API) ou já na lista de rascunho. */
  reservedDemandantIds: string[]
  onOpenCreateDemandant: () => void
  /**
   * Se definido, não chama a API: apenas adiciona ao rascunho do formulário de criação da placa.
   */
  draftOnly?: {
    plateDescription: string
    onAdd: (payload: DemandantLinkDraftCreatePayload) => void
  }
}

export function DemandantLinkCreateDialog({
  plate,
  open,
  onOpenChange,
  demandants,
  reservedDemandantIds,
  onOpenCreateDemandant,
  draftOnly,
}: DemandantLinkCreateDialogProps) {
  const queryClient = useQueryClient()
  const [demandantTitle, setDemandantTitle] = useState('')
  const [demandantId, setDemandantId] = useState('')
  const [reference, setReference] = useState('')
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [notes, setNotes] = useState('')
  const [lprEquipmentIds, setLprEquipmentIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setDemandantTitle('')
      setDemandantId('')
      setReference('')
      setNotes('')
      setLprEquipmentIds([])
      return
    }
    setValidUntilDate(getDefaultDemandantLinkValidUntil())
  }, [open])

  const reserved = new Set(reservedDemandantIds)
  const availableDemandants = demandants.filter((d) => !reserved.has(d.id))

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

  const pending = draftOnly ? false : postMutation.isPending

  function handleSubmit() {
    const ref = reference.trim()
    if (!demandantId || !ref) {
      toast.error('Selecione o demandante e informe o número de referência.')
      return
    }
    if (isDemandantLinkValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }
    const validUntilIso = validUntilDate
      ? validUntilDate.toISOString()
      : undefined

    const payload: DemandantLinkDraftCreatePayload = {
      demandantId,
      referenceNumber: ref,
      validUntil: validUntilIso,
      notes: notes.trim() || undefined,
      lprEquipmentIds: lprEquipmentIds.length > 0 ? lprEquipmentIds : undefined,
    }

    if (draftOnly) {
      draftOnly.onAdd(payload)
      toast.success('Vínculo incluído no cadastro.')
      onOpenChange(false)
      return
    }

    postMutation.mutate({
      plate,
      demandantId: payload.demandantId,
      referenceNumber: payload.referenceNumber,
      validUntil: payload.validUntil,
      notes: payload.notes,
      lprEquipmentIds: payload.lprEquipmentIds,
    })
  }

  const plateLine = draftOnly
    ? draftOnly.plateDescription.trim() || '(defina a placa acima)'
    : plate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo vínculo com demandante</DialogTitle>
          <DialogDescription>
            {draftOnly ? (
              <>
                Placa <strong>{plateLine}</strong>. Cada demandante só pode
                aparecer uma vez nesta lista.
              </>
            ) : (
              <>Placa {plateLine}. O demandante não pode repetir nesta placa.</>
            )}
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
                label: `${item.name} — ${item.organization.name} (${item.organization.acronym})`,
                value: item.id,
              }))}
              disabled={pending}
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
              disabled={pending}
            />
          </div>
          <DemandantLinkValidUntilPicker
            label="Validade (opcional)"
            value={validUntilDate}
            onChange={setValidUntilDate}
            disabled={pending}
          />
          <DemandantLinkLprMultiSelect
            value={lprEquipmentIds}
            onChange={setLprEquipmentIds}
            disabled={pending}
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="create-link-notes">Notas (opcional)</Label>
            <Textarea
              id="create-link-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={pending}
              rows={3}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full min-w-0 flex-col gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="h-10 w-full shrink-0 font-normal"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="h-10 w-full shrink-0 font-normal"
            onClick={handleSubmit}
          >
            {pending ? (
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
