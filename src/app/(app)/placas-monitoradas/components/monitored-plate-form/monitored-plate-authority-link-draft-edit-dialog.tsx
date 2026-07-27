'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import MultipleSelector from '@/components/custom/multiselect-with-search'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  InstitutionAuthority,
  NotificationChannel,
} from '@/models/entities'

import { AuthorityLinkDialogShell } from './authority-link-dialog-shell'
import { MonitoredPlateAuthorityCollectionPointField } from './monitored-plate-authority-collection-point-field'
import {
  isMonitoredPlateAuthorityValidUntilBeyondMax,
  parseIsoToDate,
  validUntilInstantsEqual,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityValidUntilPicker } from './monitored-plate-authority-link-valid-until-picker'
import type { MonitoredPlateDraftAuthorityLink } from './monitored-plate-draft-authority-link'

function collectionPointIdsEqual(
  a: string[] | undefined,
  b: string[] | undefined,
) {
  const sa = [...(a ?? [])].sort().join('\u0000')
  const sb = [...(b ?? [])].sort().join('\u0000')
  return sa === sb
}

function notificationChannelIdsEqual(
  a: string[] | undefined,
  b: string[] | undefined,
) {
  const sa = [...(a ?? [])].sort().join('\u0000')
  const sb = [...(b ?? [])].sort().join('\u0000')
  return sa === sb
}

interface MonitoredPlateAuthorityLinkDraftEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: MonitoredPlateDraftAuthorityLink | null
  institutionAuthority: InstitutionAuthority | undefined
  notificationChannels: NotificationChannel[]
  onSave: (
    clientId: string,
    data: Omit<
      MonitoredPlateDraftAuthorityLink,
      'clientId' | 'institutionAuthorityId'
    >,
  ) => void
  onRemove: (clientId: string) => void
}

export function MonitoredPlateAuthorityLinkDraftEditDialog({
  open,
  onOpenChange,
  draft,
  institutionAuthority,
  notificationChannels,
  onSave,
  onRemove,
}: MonitoredPlateAuthorityLinkDraftEditDialogProps) {
  const [reference, setReference] = useState('')
  const [requestedAt, setRequestedAt] = useState<Date | undefined>()
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [active, setActive] = useState(true)
  const [notificationChannelIds, setNotificationChannelIds] = useState<
    string[]
  >([])
  const [monitorAll, setMonitorAll] = useState(true)
  const [collectionPointIds, setCollectionPointIds] = useState<string[]>([])
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  useEffect(() => {
    if (!draft) return
    const requestedAtDate = parseIsoToDate(draft.requestedAt)

    setReference(draft.referenceNumber)
    setRequestedAt(requestedAtDate)
    setValidUntilDate(parseIsoToDate(draft.validUntil))
    setActive(draft.active)
    setNotificationChannelIds(
      draft.notificationChannelIds ? [...draft.notificationChannelIds] : [],
    )
    setMonitorAll(draft.monitorAllCollectionPoints)
    setCollectionPointIds(
      draft.monitorAllCollectionPoints
        ? []
        : draft.collectionPointIds
          ? [...draft.collectionPointIds]
          : [],
    )
  }, [draft])

  useEffect(() => {
    if (!open) setConfirmRemoveOpen(false)
  }, [open])

  const notificationChannelOptions = useMemo(
    () =>
      notificationChannels.map((item) => ({
        label: item.title || item.id,
        value: item.id,
      })),
    [notificationChannels],
  )

  function handleSave() {
    if (!draft) return
    const trimmedRef = reference.trim()
    if (!trimmedRef || !requestedAt) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }
    if (isMonitoredPlateAuthorityValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }

    const requestedAtIso = requestedAt.toISOString()
    const validUntil = validUntilDate?.toISOString()
    if (
      validUntil &&
      new Date(validUntil).getTime() <= new Date(requestedAtIso).getTime()
    ) {
      toast.error('A validade deve ser posterior à solicitação.')
      return
    }

    const requestedAtUnchanged =
      new Date(draft.requestedAt).getTime() ===
      new Date(requestedAtIso).getTime()

    if (
      trimmedRef === draft.referenceNumber.trim() &&
      requestedAtUnchanged &&
      validUntilInstantsEqual(
        parseIsoToDate(draft.validUntil),
        validUntilDate,
      ) &&
      active === draft.active &&
      monitorAll === draft.monitorAllCollectionPoints &&
      notificationChannelIdsEqual(
        draft.notificationChannelIds,
        notificationChannelIds,
      ) &&
      collectionPointIdsEqual(
        draft.monitorAllCollectionPoints ? [] : draft.collectionPointIds,
        collectionPointIds,
      )
    ) {
      toast.message('Nada alterado neste vínculo.')
      return
    }

    onSave(draft.clientId, {
      referenceNumber: trimmedRef,
      requestedAt: requestedAtIso,
      validUntil,
      active,
      monitorAllCollectionPoints: monitorAll,
      notificationChannelIds:
        notificationChannelIds.length > 0 ? notificationChannelIds : undefined,
      collectionPointIds: monitorAll ? undefined : collectionPointIds,
    })
    toast.success('Vínculo atualizado no cadastro.')
    onOpenChange(false)
  }

  if (!draft || !institutionAuthority) return null

  return (
    <>
      <AuthorityLinkDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Editar vínculo"
        description={
          <span className="space-y-1">
            <span className="block text-foreground">
              {institutionAuthority.name}
            </span>
            {institutionAuthority.requestingInstitution ? (
              <span className="block text-sm text-muted-foreground">
                Demandante: {institutionAuthority.requestingInstitution.name}
              </span>
            ) : null}
            <span className="block text-sm text-muted-foreground">
              Será enviado ao salvar a placa.
            </span>
          </span>
        }
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto sm:w-auto"
              onClick={() => setConfirmRemoveOpen(true)}
            >
              Remover desta lista
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-32"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto sm:min-w-32"
              onClick={handleSave}
            >
              Salvar alterações
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="draft-edit-ref">Nº de referência</Label>
            <Input
              id="draft-edit-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="draft-edit-requested">Solicitado em</Label>
            <DatePicker
              value={requestedAt}
              onChange={setRequestedAt}
              type="datetime-local"
              timePickerDisableFuture={false}
            />
          </div>
          <MonitoredPlateAuthorityValidUntilPicker
            label="Validade do vínculo"
            value={validUntilDate}
            onChange={setValidUntilDate}
          />
          <div className="flex flex-col gap-1">
            <Label>Canais de notificação</Label>
            <MultipleSelector
              value={notificationChannelOptions.filter((item) =>
                notificationChannelIds.includes(item.value),
              )}
              onChange={(items) =>
                setNotificationChannelIds(items.map((item) => item.value))
              }
              defaultOptions={notificationChannelOptions}
              options={notificationChannelOptions}
              placeholder="Selecione um ou mais canais"
              emptyIndicator={<p>Nenhum resultado encontrado.</p>}
            />
          </div>
          <label className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
              checked={active}
              onCheckedChange={(value) => setActive(Boolean(value))}
            />
            <span className="text-sm">Vínculo ativo</span>
          </label>
          <MonitoredPlateAuthorityCollectionPointField
            value={collectionPointIds}
            onChange={setCollectionPointIds}
            monitorAll={monitorAll}
            onMonitorAllChange={setMonitorAll}
          />
        </div>
      </AuthorityLinkDialogShell>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{institutionAuthority.name}</strong> sai da lista deste
              cadastro (ainda não foi enviado à API).
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
