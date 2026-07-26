'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

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
import {
  getMonitoredPlateAuthority,
  type MonitoredPlateAuthorityRecord,
} from '@/http/monitored-plate-authorities'
import type { MonitoredPlateAuthoritySummary } from '@/http/monitored-plates'
import type { NotificationChannel } from '@/models/entities'

import {
  isMonitoredPlateAuthorityValidUntilBeyondMax,
  parseIsoToDate,
  validUntilInstantsEqual,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityValidUntilPicker } from './monitored-plate-authority-link-valid-until-picker'
import { MonitoredPlateAuthorityCollectionPointMultiSelect } from './picker/monitored-plate-authority-collection-point-multi-select'

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

  const { data: authorityLink, isLoading } = useQuery({
    queryKey: ['monitored-plate-authorities', link?.id],
    queryFn: () => getMonitoredPlateAuthority({ id: link!.id }),
    enabled: open && Boolean(link?.id),
  })

  useEffect(() => {
    if (!authorityLink) return

    setReference(authorityLink.referenceNumber)
    setRequestedAt(parseIsoToDate(authorityLink.requestedAt))
    setValidUntilDate(parseIsoToDate(authorityLink.validUntil))
    setActive(authorityLink.active)
    setNotificationChannelIds([...authorityLink.notificationChannelIds])
    setMonitorAll(authorityLink.monitorAllCollectionPoints)
    setCollectionPointIds(
      authorityLink.monitorAllCollectionPoints
        ? []
        : [...authorityLink.collectionPointIds],
    )
  }, [authorityLink])

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

  async function handleSave() {
    if (!link || !authorityLink) return

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-none overflow-y-auto overflow-x-hidden p-4 sm:w-full sm:max-w-3xl sm:p-6 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
          <DialogHeader className="pr-8">
            <DialogTitle>Editar vínculo</DialogTitle>
            <DialogDescription className="space-y-1 break-words text-left">
              <span className="block text-foreground">
                {link.institutionAuthority.name}
              </span>
              {link.institutionAuthority.requestingInstitution ? (
                <span className="block text-sm text-muted-foreground">
                  Demandante:{' '}
                  {link.institutionAuthority.requestingInstitution.name}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {isLoading && !authorityLink ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-col gap-6 py-2">
                <div className="flex w-full min-w-0 flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="persisted-edit-ref">Nº de referência</Label>
                    <Input
                      id="persisted-edit-ref"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      maxLength={50}
                      disabled={isBusy}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="persisted-edit-requested">
                      Solicitado em
                    </Label>
                    <DatePicker
                      value={requestedAt}
                      onChange={setRequestedAt}
                      type="datetime-local"
                      timePickerDisableFuture={false}
                      disabled={isBusy}
                    />
                  </div>
                  <MonitoredPlateAuthorityValidUntilPicker
                    label="Validade do vínculo"
                    value={validUntilDate}
                    onChange={setValidUntilDate}
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label>Canais de notificação</Label>
                    <MultipleSelector
                      value={notificationChannelOptions.filter((item) =>
                        notificationChannelIds.includes(item.value),
                      )}
                      onChange={(items) =>
                        setNotificationChannelIds(
                          items.map((item) => item.value),
                        )
                      }
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
                </div>

                <div className="min-w-0">
                  <MonitoredPlateAuthorityCollectionPointMultiSelect
                    value={collectionPointIds}
                    onChange={setCollectionPointIds}
                    disabled={isBusy}
                    monitorAll={monitorAll}
                    onMonitorAllChange={setMonitorAll}
                  />
                </div>
              </div>

              <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex w-auto min-w-0 flex-col gap-2 border-t border-border bg-background px-4 pb-1 pt-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full shrink-0 font-normal sm:w-auto sm:min-w-32"
                  disabled={isBusy}
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="h-10 w-full shrink-0 font-normal sm:w-auto sm:min-w-32"
                  disabled={isBusy}
                  onClick={handleSave}
                >
                  {isSaving ? <Spinner /> : 'Salvar alterações'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-full shrink-0 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isBusy}
                  onClick={() => setConfirmRemoveOpen(true)}
                >
                  Remover vínculo
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
