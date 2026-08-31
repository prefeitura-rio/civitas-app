'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
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
import type { NotificationChannel } from '@/models/entities'

import { AuthorityLinkDialogShell } from './authority-link-dialog-shell'
import { MonitoredPlateAuthorityCollectionPointField } from './monitored-plate-authority-collection-point-field'
import {
  isMonitoredPlateAuthorityValidUntilBeyondMax,
  isMonitoredPlateAuthorityValidUntilExpired,
  MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE,
  parseIsoToDate,
  toMonitoredPlateAuthorityValidUntilIso,
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
  institutionAuthorityName?: string
  requestingInstitutionName?: string
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
  institutionAuthorityName,
  requestingInstitutionName,
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
  const [fieldErrors, setFieldErrors] = useState<{
    reference?: string
    requestedAt?: string
    validUntil?: string
    notificationChannelIds?: string
  }>({})

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
    setFieldErrors({})
  }, [draft])

  useEffect(() => {
    if (!open) {
      setConfirmRemoveOpen(false)
      setFieldErrors({})
    }
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
    const nextErrors = {
      reference: trimmedRef ? undefined : 'Campo obrigatório',
      requestedAt: requestedAt ? undefined : 'Campo obrigatório',
      validUntil: validUntilDate ? undefined : 'Campo obrigatório',
      notificationChannelIds:
        notificationChannelIds.length > 0 ? undefined : 'Campo obrigatório',
    }

    setFieldErrors(nextErrors)

    if (
      nextErrors.reference ||
      nextErrors.requestedAt ||
      nextErrors.validUntil ||
      nextErrors.notificationChannelIds
    ) {
      return
    }

    if (isMonitoredPlateAuthorityValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }

    if (active && isMonitoredPlateAuthorityValidUntilExpired(validUntilDate)) {
      toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
      return
    }

    const requestedAtIso = requestedAt!.toISOString()
    const validUntil = toMonitoredPlateAuthorityValidUntilIso(validUntilDate!)
    if (new Date(validUntil).getTime() <= new Date(requestedAtIso).getTime()) {
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
      notificationChannelIds,
      collectionPointIds: monitorAll ? undefined : collectionPointIds,
    })
    toast.success('Vínculo atualizado no cadastro.')
    onOpenChange(false)
  }

  if (!draft) return null

  return (
    <>
      <AuthorityLinkDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Editar vínculo"
        description={
          <span className="space-y-1">
            <span className="block text-foreground">
              {institutionAuthorityName ?? draft.institutionAuthorityId}
            </span>
            {requestingInstitutionName ? (
              <span className="block text-sm text-muted-foreground">
                Demandante: {requestingInstitutionName}
              </span>
            ) : null}
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
            <div className="flex gap-2">
              <Label htmlFor="draft-edit-ref">Nº de referência</Label>
              <InputError message={fieldErrors.reference} />
            </div>
            <Input
              id="draft-edit-ref"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value)
                setFieldErrors((prev) => ({
                  ...prev,
                  reference: undefined,
                }))
              }}
              maxLength={50}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="draft-edit-requested">Solicitado em</Label>
              <InputError message={fieldErrors.requestedAt} />
            </div>
            <DatePicker
              value={requestedAt}
              onChange={(value) => {
                setRequestedAt(value)
                setFieldErrors((prev) => ({
                  ...prev,
                  requestedAt: undefined,
                }))
              }}
              type="datetime-local"
              timePickerDisableFuture={false}
            />
          </div>
          <MonitoredPlateAuthorityValidUntilPicker
            label="Validade do vínculo"
            value={validUntilDate}
            onChange={(updater) => {
              setValidUntilDate(updater)
              setFieldErrors((prev) => ({
                ...prev,
                validUntil: undefined,
              }))
            }}
            errorMessage={fieldErrors.validUntil}
            allowClear={false}
          />
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Canais de notificação</Label>
              <InputError message={fieldErrors.notificationChannelIds} />
            </div>
            <MultipleSelector
              value={notificationChannelOptions.filter((item) =>
                notificationChannelIds.includes(item.value),
              )}
              onChange={(items) => {
                setNotificationChannelIds(items.map((item) => item.value))
                setFieldErrors((prev) => ({
                  ...prev,
                  notificationChannelIds: undefined,
                }))
              }}
              defaultOptions={notificationChannelOptions}
              options={notificationChannelOptions}
              placeholder="Selecione um ou mais canais"
              emptyIndicator={<p>Nenhum resultado encontrado.</p>}
            />
          </div>
          <label className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
              checked={active}
              onCheckedChange={(value) => {
                const next = Boolean(value)
                if (
                  next &&
                  isMonitoredPlateAuthorityValidUntilExpired(validUntilDate)
                ) {
                  toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
                  return
                }
                setActive(next)
              }}
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
              <strong>
                {institutionAuthorityName ?? draft.institutionAuthorityId}
              </strong>{' '}
              sai da lista deste cadastro (ainda não foi enviado à API).
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
