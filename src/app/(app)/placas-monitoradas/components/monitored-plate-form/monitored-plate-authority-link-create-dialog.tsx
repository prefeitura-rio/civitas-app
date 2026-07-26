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
  const [requestingInstitutionTitle, setRequestingInstitutionTitle] =
    useState('')
  const [requestingInstitutionId, setRequestingInstitutionId] = useState('')
  const [authorityTitle, setAuthorityTitle] = useState('')
  const [authorityId, setAuthorityId] = useState('')
  const [reference, setReference] = useState('')
  const [requestedAt, setRequestedAt] = useState<Date | undefined>()
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [active, setActive] = useState(true)
  const [notificationChannelIds, setNotificationChannelIds] = useState<
    string[]
  >([])
  const [monitorAll, setMonitorAll] = useState(true)
  const [collectionPointIds, setCollectionPointIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setRequestingInstitutionTitle('')
      setRequestingInstitutionId('')
      setAuthorityTitle('')
      setAuthorityId('')
      setReference('')
      setRequestedAt(undefined)
      setValidUntilDate(undefined)
      setActive(true)
      setNotificationChannelIds([])
      setMonitorAll(true)
      setCollectionPointIds([])
      return
    }

    setRequestedAt(new Date())
    setValidUntilDate(getDefaultMonitoredPlateAuthorityValidUntil())
  }, [open])

  const availableAuthorities = useMemo(() => {
    const reserved = new Set(reservedAuthorityIds)

    return institutionAuthorities.filter((item) => !reserved.has(item.id))
  }, [institutionAuthorities, reservedAuthorityIds])
  const requestingInstitutionOptions = useMemo(() => {
    const institutions = new Map<string, string>()

    availableAuthorities.forEach((item) => {
      const institutionId =
        item.requestingInstitution?.id || item.requestingInstitutionId
      const institutionName = item.requestingInstitution?.name

      if (!institutionId || !institutionName) return

      institutions.set(institutionId, institutionName)
    })

    return Array.from(institutions.entries())
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [availableAuthorities])
  const filteredAuthorities = requestingInstitutionId
    ? availableAuthorities.filter(
        (item) =>
          (item.requestingInstitution?.id || item.requestingInstitutionId) ===
          requestingInstitutionId,
      )
    : availableAuthorities

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
      monitorAllCollectionPoints: monitorAll,
      notificationChannelIds:
        notificationChannelIds.length > 0 ? notificationChannelIds : undefined,
      collectionPointIds: monitorAll ? undefined : collectionPointIds,
    })
    toast.success(successMessage)
    onOpenChange(false)
  }

  const plateLine = plateDescription.trim() || plate || '(defina a placa acima)'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-none overflow-y-auto overflow-x-hidden p-4 sm:w-full sm:max-w-3xl sm:p-6 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="leading-tight">
            Novo vínculo com requisitante
          </DialogTitle>
          <DialogDescription className="break-words">
            Placa <strong>{plateLine}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-6 py-2">
          <div className="flex w-full min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Demandante</Label>
                {requestingInstitutionId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs font-normal"
                    disabled={disabled || isSubmitting}
                    onClick={() => {
                      setRequestingInstitutionTitle('')
                      setRequestingInstitutionId('')
                      setAuthorityTitle('')
                      setAuthorityId('')
                    }}
                  >
                    Limpar filtro
                  </Button>
                ) : null}
              </div>
              <SelectWithSearch
                value={requestingInstitutionTitle}
                onSelect={(item) => {
                  setRequestingInstitutionTitle(item.label)
                  setRequestingInstitutionId(item.value)
                  setAuthorityTitle('')
                  setAuthorityId('')
                }}
                options={requestingInstitutionOptions}
                disabled={
                  disabled ||
                  isSubmitting ||
                  requestingInstitutionOptions.length === 0
                }
                placeholder="Filtrar por demandante"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                options={filteredAuthorities.map((item) => ({
                  label: item.requestingInstitution
                    ? `${item.name} — ${item.requestingInstitution.name}`
                    : item.name,
                  value: item.id,
                }))}
                disabled={disabled || isSubmitting}
                placeholder={
                  requestingInstitutionId
                    ? 'Selecione o requisitante'
                    : 'Selecione ou filtre por demandante'
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
              monitorAll={monitorAll}
              onMonitorAllChange={setMonitorAll}
              defaultSelectAll={true}
            />
          </div>
        </div>
        <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex w-auto min-w-0 flex-col gap-2 border-t border-border bg-background px-4 pb-1 pt-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full shrink-0 font-normal sm:w-auto sm:min-w-32"
            disabled={disabled || isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-10 w-full shrink-0 font-normal sm:w-auto sm:min-w-32"
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
