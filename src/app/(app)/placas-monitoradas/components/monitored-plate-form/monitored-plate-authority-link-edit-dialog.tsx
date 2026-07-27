'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  getMonitoredPlateAuthority,
  type MonitoredPlateAuthorityRecord,
} from '@/http/monitored-plate-authorities'
import type { MonitoredPlateAuthoritySummary } from '@/http/monitored-plates'
import type { NotificationChannel } from '@/models/entities'

import { AuthorityLinkDialogShell } from './authority-link-dialog-shell'
import { MonitoredPlateAuthorityCollectionPointField } from './monitored-plate-authority-collection-point-field'
import {
  isMonitoredPlateAuthorityValidUntilBeyondMax,
  parseIsoToDate,
  toMonitoredPlateAuthorityValidUntilIso,
  validUntilInstantsEqual,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityValidUntilPicker } from './monitored-plate-authority-link-valid-until-picker'

function collectionPointIdsEqual(a: string[], b: string[]) {
  const sa = [...a].sort().join('\u0000')
  const sb = [...b].sort().join('\u0000')
  return sa === sb
}

function notificationChannelIdsEqual(a: string[], b: string[]) {
  const sa = [...a].sort().join('\u0000')
  const sb = [...b].sort().join('\u0000')
  return sa === sb
}

interface MonitoredPlateAuthorityLinkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: MonitoredPlateAuthoritySummary | null
  notificationChannels: NotificationChannel[]
  isSaving?: boolean
  isRemoving?: boolean
  onSave: (
    id: string,
    data: Pick<
      MonitoredPlateAuthorityRecord,
      | 'referenceNumber'
      | 'requestedAt'
      | 'validUntil'
      | 'active'
      | 'monitorAllCollectionPoints'
      | 'notificationChannelIds'
      | 'collectionPointIds'
    >,
  ) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function MonitoredPlateAuthorityLinkEditDialog({
  open,
  onOpenChange,
  link,
  notificationChannels,
  isSaving = false,
  isRemoving = false,
  onSave,
  onRemove,
}: MonitoredPlateAuthorityLinkEditDialogProps) {
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

  const { data: authorityLink, isLoading } = useQuery({
    queryKey: ['monitored-plate-authorities', link?.id],
    queryFn: () => getMonitoredPlateAuthority({ id: link!.id }),
    enabled: open && Boolean(link?.id),
  })

  useEffect(() => {
    if (!open || !link) return

    setReference(link.referenceNumber)
    setRequestedAt(parseIsoToDate(link.requestedAt))
    setValidUntilDate(parseIsoToDate(link.validUntil))
    setActive(link.active)
    setNotificationChannelIds(
      link.notificationChannels.map((channel) => channel.id).filter(Boolean),
    )
    setMonitorAll(link.monitorAllCollectionPoints)
    setCollectionPointIds(
      link.monitorAllCollectionPoints ? [] : [...link.collectionPointIds],
    )
    setFieldErrors({})
  }, [open, link])

  useEffect(() => {
    if (!authorityLink) return

    setReference(authorityLink.referenceNumber)
    setRequestedAt(parseIsoToDate(authorityLink.requestedAt))
    setValidUntilDate(parseIsoToDate(authorityLink.validUntil))
    setActive(authorityLink.active)
    setNotificationChannelIds(
      authorityLink.notificationChannelIds.length > 0
        ? [...authorityLink.notificationChannelIds]
        : (authorityLink.notificationChannels
            ?.map((channel) => channel.id)
            .filter(Boolean) ?? []),
    )
    setMonitorAll(authorityLink.monitorAllCollectionPoints)
    setCollectionPointIds(
      authorityLink.monitorAllCollectionPoints
        ? []
        : [...authorityLink.collectionPointIds],
    )
    setFieldErrors({})
  }, [authorityLink])

  useEffect(() => {
    if (!open) {
      setConfirmRemoveOpen(false)
      setFieldErrors({})
    }
  }, [open])

  const notificationChannelOptions = useMemo(() => {
    const byId = new Map<string, { label: string; value: string }>()

    for (const item of notificationChannels) {
      byId.set(item.id, {
        label: item.title || item.id,
        value: item.id,
      })
    }

    for (const item of link?.notificationChannels ?? []) {
      if (!byId.has(item.id)) {
        byId.set(item.id, {
          label: item.title || item.id,
          value: item.id,
        })
      }
    }

    for (const item of authorityLink?.notificationChannels ?? []) {
      if (!byId.has(item.id)) {
        byId.set(item.id, {
          label: item.title || item.id,
          value: item.id,
        })
      }
    }

    return Array.from(byId.values())
  }, [
    authorityLink?.notificationChannels,
    link?.notificationChannels,
    notificationChannels,
  ])

  async function handleSave() {
    if (!link || !authorityLink) return

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

    const requestedAtIso = requestedAt!.toISOString()
    const validUntil = toMonitoredPlateAuthorityValidUntilIso(validUntilDate!)
    if (new Date(validUntil).getTime() <= new Date(requestedAtIso).getTime()) {
      toast.error('A validade deve ser posterior à solicitação.')
      return
    }

    const requestedAtUnchanged =
      new Date(authorityLink.requestedAt).getTime() ===
      new Date(requestedAtIso).getTime()

    if (
      trimmedRef === authorityLink.referenceNumber.trim() &&
      requestedAtUnchanged &&
      validUntilInstantsEqual(
        parseIsoToDate(authorityLink.validUntil),
        validUntilDate,
      ) &&
      active === authorityLink.active &&
      monitorAll === authorityLink.monitorAllCollectionPoints &&
      notificationChannelIdsEqual(
        authorityLink.notificationChannelIds,
        notificationChannelIds,
      ) &&
      collectionPointIdsEqual(
        authorityLink.monitorAllCollectionPoints
          ? []
          : authorityLink.collectionPointIds,
        collectionPointIds,
      )
    ) {
      toast.message('Nada alterado neste vínculo.')
      return
    }

    await onSave(link.id, {
      referenceNumber: trimmedRef,
      requestedAt: requestedAtIso,
      validUntil,
      active,
      monitorAllCollectionPoints: monitorAll,
      notificationChannelIds,
      collectionPointIds: monitorAll ? [] : collectionPointIds,
    })
    toast.success('Vínculo atualizado com sucesso.')
    onOpenChange(false)
  }

  async function handleRemove() {
    if (!link) return

    await onRemove(link.id)
    setConfirmRemoveOpen(false)
    toast.success('Vínculo removido com sucesso.')
    onOpenChange(false)
  }

  if (!link) return null

  const isBusy = isLoading || isSaving || isRemoving

  return (
    <>
      <AuthorityLinkDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Editar vínculo"
        description={
          <span className="space-y-1">
            <span className="block text-foreground">
              {link.institutionAuthority.name}
            </span>
            {link.institutionAuthority.requestingInstitution ? (
              <span className="block text-sm text-muted-foreground">
                Demandante:{' '}
                {link.institutionAuthority.requestingInstitution.name}
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
              disabled={isBusy}
              onClick={() => setConfirmRemoveOpen(true)}
            >
              Remover vínculo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-32"
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto sm:min-w-32"
              disabled={isBusy}
              onClick={handleSave}
            >
              {isSaving ? <Spinner /> : 'Salvar alterações'}
            </Button>
          </>
        }
      >
        {isLoading && !authorityLink ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="persisted-edit-ref">Nº de referência</Label>
                <InputError message={fieldErrors.reference} />
              </div>
              <Input
                id="persisted-edit-ref"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value)
                  setFieldErrors((prev) => ({
                    ...prev,
                    reference: undefined,
                  }))
                }}
                maxLength={50}
                disabled={isBusy}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="persisted-edit-requested">Solicitado em</Label>
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
                disabled={isBusy}
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
              disabled={isBusy}
            />
            <div className="flex min-w-0 flex-col gap-1">
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
                disabled={isBusy}
              />
            </div>
            <label className="flex min-h-10 items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-sm">Vínculo ativo</span>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                disabled={isBusy}
                aria-label="Vínculo ativo"
              />
            </label>
            <MonitoredPlateAuthorityCollectionPointField
              value={collectionPointIds}
              onChange={setCollectionPointIds}
              disabled={isBusy}
              monitorAll={monitorAll}
              onMonitorAllChange={setMonitorAll}
            />
          </div>
        )}
      </AuthorityLinkDialogShell>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação desvincula o requisitante desta placa monitorada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction disabled={isRemoving} onClick={handleRemove}>
              {isRemoving ? <Spinner /> : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
