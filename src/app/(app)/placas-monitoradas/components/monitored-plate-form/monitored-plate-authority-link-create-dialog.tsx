'use client'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { InstitutionAuthorityFormDialog } from '@/app/(app)/demandantes/components/institution-authorities/institution-authority-dialogs/components/institution-authority-form-dialog'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
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
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import type {
  InstitutionAuthority,
  NotificationChannel,
} from '@/models/entities'

import {
  getDefaultMonitoredPlateAuthorityValidUntil,
  isMonitoredPlateAuthorityValidUntilBeyondMax,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityValidUntilPicker } from './monitored-plate-authority-link-valid-until-picker'
import { MonitoredPlateAuthorityCollectionPointMultiSelect } from './picker/monitored-plate-authority-collection-point-multi-select'

export interface MonitoredPlateAuthorityDraftCreatePayload {
  institutionAuthorityId: string
  referenceNumber: string
  requestedAt: string
  validUntil?: string
  active: boolean
  monitorAllCollectionPoints: boolean
  notificationChannelIds?: string[]
  collectionPointIds?: string[]
}

interface MonitoredPlateAuthorityLinkCreateDialogProps {
  plate: string
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionAuthorities: InstitutionAuthority[]
  notificationChannels: NotificationChannel[]
  reservedAuthorityIds: string[]
  plateDescription: string
  onCreate: (
    payload: MonitoredPlateAuthorityDraftCreatePayload,
  ) => void | Promise<void>
  submitLabel?: string
  successMessage?: string
  disabled?: boolean
  isSubmitting?: boolean
}

export function MonitoredPlateAuthorityLinkCreateDialog({
  plate,
  open,
  onOpenChange,
  institutionAuthorities,
  notificationChannels,
  reservedAuthorityIds,
  plateDescription,
  onCreate,
  submitLabel = 'Adicionar vínculo',
  successMessage = 'Vínculo incluído no cadastro.',
  disabled = false,
  isSubmitting = false,
}: MonitoredPlateAuthorityLinkCreateDialogProps) {
  const { formDialogDisclosure, setDialogInitialData } =
    useInstitutionAuthorities()
  const [authorityTitle, setAuthorityTitle] = useState('')
  const [authorityId, setAuthorityId] = useState('')
  const [reference, setReference] = useState('')
  const [requestedAt, setRequestedAt] = useState<Date | undefined>()
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [active, setActive] = useState(true)
  const [notificationChannelIds, setNotificationChannelIds] = useState<
    string[]
  >([])
  const [collectionPointIds, setCollectionPointIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setAuthorityTitle('')
      setAuthorityId('')
      setReference('')
      setRequestedAt(undefined)
      setValidUntilDate(undefined)
      setActive(true)
      setNotificationChannelIds([])
      setCollectionPointIds([])
      return
    }

    setRequestedAt(new Date())
    setValidUntilDate(getDefaultMonitoredPlateAuthorityValidUntil())
  }, [open])

  const reserved = new Set(reservedAuthorityIds)
  const availableAuthorities = institutionAuthorities.filter(
    (item) => !reserved.has(item.id),
  )

  const notificationChannelOptions = useMemo(
    () =>
      notificationChannels.map((item) => ({
        label: item.title || item.id,
        value: item.id,
      })),
    [notificationChannels],
  )

  async function handleSubmit() {
    const ref = reference.trim()
    if (!authorityId || !ref || !requestedAt) {
      toast.error('Selecione o requisitante e preencha os campos obrigatórios.')
      return
    }
    if (isMonitoredPlateAuthorityValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }

    const requestedAtIso = requestedAt.toISOString()
    const validUntilIso = validUntilDate?.toISOString()
    if (
      validUntilIso &&
      new Date(validUntilIso).getTime() <= new Date(requestedAtIso).getTime()
    ) {
      toast.error('A validade deve ser posterior à solicitação.')
      return
    }

    await onCreate({
      institutionAuthorityId: authorityId,
      referenceNumber: ref,
      requestedAt: requestedAtIso,
      validUntil: validUntilIso,
      active,
      monitorAllCollectionPoints: collectionPointIds.length === 0,
      notificationChannelIds:
        notificationChannelIds.length > 0 ? notificationChannelIds : undefined,
      collectionPointIds:
        collectionPointIds.length > 0 ? collectionPointIds : undefined,
    })
    toast.success(successMessage)
    onOpenChange(false)
  }

  const plateLine = plateDescription.trim() || plate || '(defina a placa acima)'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Novo vínculo com requisitante</DialogTitle>
          <DialogDescription>
            Placa <strong>{plateLine}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-6 py-2">
          <div className="flex min-w-0 flex-col gap-3 lg:max-w-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <Label>Requisitante</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs font-normal"
                  disabled={disabled || isSubmitting}
                  onClick={() => {
                    setDialogInitialData(null)
                    formDialogDisclosure.onOpen()
                  }}
                >
                  Novo requisitante
                </Button>
              </div>
              <SelectWithSearch
                value={authorityTitle}
                onSelect={(item) => {
                  setAuthorityTitle(item.label)
                  setAuthorityId(item.value)
                }}
                options={availableAuthorities.map((item) => ({
                  label: item.requestingInstitution
                    ? `${item.name} — ${item.requestingInstitution.name}`
                    : item.name,
                  value: item.id,
                }))}
                disabled={disabled || isSubmitting}
                placeholder="Selecione"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="create-link-ref">Nº de referência</Label>
              <Input
                id="create-link-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={50}
                disabled={disabled || isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="create-link-requested">Solicitado em</Label>
              <DatePicker
                value={requestedAt}
                onChange={setRequestedAt}
                type="datetime-local"
                timePickerDisableFuture={false}
                disabled={disabled || isSubmitting}
              />
            </div>
            <MonitoredPlateAuthorityValidUntilPicker
              label="Validade (opcional)"
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
                disabled={disabled || isSubmitting}
                placeholder="Selecione um ou mais canais"
                emptyIndicator={<p>Nenhum resultado encontrado.</p>}
              />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-sm">Vínculo ativo</span>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                disabled={disabled || isSubmitting}
                aria-label="Vínculo ativo"
              />
            </label>
          </div>

          <div className="min-w-0">
            <MonitoredPlateAuthorityCollectionPointMultiSelect
              value={collectionPointIds}
              onChange={setCollectionPointIds}
              disabled={disabled || isSubmitting}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full min-w-0 flex-col gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full shrink-0 font-normal"
            disabled={disabled || isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-10 w-full shrink-0 font-normal"
            disabled={disabled || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? <Spinner /> : submitLabel}
          </Button>
        </div>
      </DialogContent>
      <InstitutionAuthorityFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
    </Dialog>
  )
}
