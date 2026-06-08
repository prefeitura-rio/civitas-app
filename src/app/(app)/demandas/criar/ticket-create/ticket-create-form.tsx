'use client'

import {
  ChevronDown,
  Mail,
  Phone,
  Plus,
  SquareCheck,
  Trash,
  Upload,
} from 'lucide-react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getFirstFormErrorMessage } from '@/utils/form-errors'
import {
  maskDigitsOnly,
  maskNumeroOficio,
  maskPhoneBR,
  normalizeNumeroOficio,
  padDigitsLeft,
} from '@/utils/string-formatters'

import { CorrelataListForm } from '../components/services/correlata-list-form'
import { ServiceAddCard } from '../components/services/service-add-card'
import { ServiceList } from '../components/services/service-list'
import { ServiceModal } from '../components/services/service-modal'
import { DataBaseDatePicker } from '../components/shared/data-base-date-picker'
import { PriorityButton } from '../components/shared/priority-button'
import { Section } from '../components/shared/section'
import { useTicketCreateController } from '../hooks/use-create-controller'
import { TICKET_CREATE_STRING_LIMITS as L } from './ticket-create.constant'
import styles from './ticket-create-form.module.css'

function FieldStringError({
  value,
  max,
  message,
}: {
  value: string | null | undefined
  max: number
  message?: string
}) {
  if ((value ?? '').length > max) {
    return (
      <p className="text-xs text-destructive">Máximo de {max} caracteres</p>
    )
  }
  if (message) {
    return <p className="text-xs text-destructive">{message}</p>
  }
  return null
}

function nullIfEmpty(value?: string | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function TicketCreateForm() {
  const vm = useTicketCreateController()
  const associarChamadoId = vm.watch('linked_ticket_id')
  const isAssociarConvertMode = Boolean(nullIfEmpty(associarChamadoId))
  const fieldDisabled = isAssociarConvertMode || vm.isLoading
  const attachmentDisabled =
    vm.isConvertingToConventional ||
    vm.isApplyingAssociatedTicket ||
    (!isAssociarConvertMode && vm.isLoading)

  const initialBuscaPorPlaca =
    vm.serviceModalOpen === 'plate_search' && vm.serviceModalEditIndex !== null
      ? vm.getValues().plate_search?.[vm.serviceModalEditIndex]
      : undefined

  const initialBuscaPorRadar =
    vm.serviceModalOpen === 'radar_search' && vm.serviceModalEditIndex !== null
      ? vm.getValues().radar_search?.[vm.serviceModalEditIndex]
      : undefined

  const initialCerco =
    vm.serviceModalOpen === 'electronic_fence' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().electronic_fence?.[vm.serviceModalEditIndex]
      : undefined

  const initialBuscaPorImagem =
    vm.serviceModalOpen === 'image_search' && vm.serviceModalEditIndex !== null
      ? vm.getValues().image_search?.[vm.serviceModalEditIndex]
      : undefined

  const initialPlacasCorrelatas =
    vm.serviceModalOpen === 'correlated_plates' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().correlated_plates?.[vm.serviceModalEditIndex]
      : undefined

  const initialPlacasConjuntas =
    vm.serviceModalOpen === 'joint_plates' && vm.serviceModalEditIndex !== null
      ? vm.getValues().joint_plates?.[vm.serviceModalEditIndex]
      : undefined

  const initialReservaImagem =
    vm.serviceModalOpen === 'image_reservation' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().image_reservation?.[vm.serviceModalEditIndex]
      : undefined

  const initialAnaliseImagem =
    vm.serviceModalOpen === 'image_analysis' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().image_analysis?.[vm.serviceModalEditIndex]
      : undefined

  const initialOutros =
    vm.serviceModalOpen === 'other' && vm.serviceModalEditIndex !== null
      ? vm.getValues().other?.[vm.serviceModalEditIndex]
      : undefined

  const initialAtlasCivitas =
    vm.serviceModalOpen === 'atlas_civitas' && vm.serviceModalEditIndex !== null
      ? vm.getValues().atlas_civitas?.[vm.serviceModalEditIndex]
      : undefined

  return (
    <div className={styles.root}>
      <div className="w-full space-y-8">
        <h1
          className="font-semibold leading-10 text-[var(--tc-heading,#f9fafa)]"
          style={{ fontSize: '20px' }}
        >
          Cadastro Manual de Demanda
        </h1>
        <p className="mt-0 text-[length:12px] leading-4 text-[var(--tc-muted,#97a2ab)]">
          Preencha as informações abaixo para criar uma nova demanda.
        </p>
      </div>

      <form
        className="w-full space-y-8"
        onSubmit={vm.handleSubmit(vm.onSubmit, (errors) => {
          toast.error(
            getFirstFormErrorMessage(errors) ??
              'Existem campos com pendências. Verifique os avisos abaixo de cada campo.',
          )
        })}
      >
        <div className={`${styles.sectionCard} ${styles.sectionCardFirst}`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Associar demanda</Label>

              <Controller
                control={vm.control}
                name="linked_ticket_id"
                render={({ field }) => (
                  <Popover
                    open={vm.ticketPopoverOpen}
                    onOpenChange={vm.setTicketPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={vm.isLoading}
                        className={`h-11 w-full justify-between ${styles.inputBg} font-normal`}
                      >
                        <span className="truncate">
                          {vm.selectedTicketLabel ||
                            'Selecione ou busque uma demanda'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className={`w-[var(--radix-popover-trigger-width)] p-0 ${styles.associarChamadoPopover}`}
                    >
                      <Command
                        shouldFilter={false}
                        className={styles.associarChamadoCommand}
                      >
                        <CommandInput
                          placeholder="Buscar demanda..."
                          value={vm.ticketSearch}
                          onValueChange={vm.setTicketSearch}
                        />

                        <CommandList>
                          {vm.isTicketsLoading && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Buscando demandas...
                            </div>
                          )}

                          {!vm.isTicketsLoading && vm.tickets.length === 0 && (
                            <CommandEmpty>
                              Nenhuma demanda encontrada.
                            </CommandEmpty>
                          )}

                          <CommandGroup>
                            {vm.tickets.map((ticket) => (
                              <CommandItem
                                key={ticket.id}
                                value={`${ticket.id} ${ticket.title}`}
                                onSelect={() => {
                                  vm.applyAssociatedTicketFromSearch(
                                    ticket.id,
                                    ticket.title,
                                  ).catch(() => {})
                                  vm.setTicketPopoverOpen(false)
                                }}
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  <span className="truncate">
                                    {ticket.title}
                                  </span>
                                  {field.value === ticket.id && (
                                    <span className="text-xs text-muted-foreground">
                                      Selecionado
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          {field.value && (
                            <div className="border-t p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                  field.onChange(null)
                                  vm.setSelectedTicketLabel('')
                                  vm.setTicketSearch('')
                                  vm.setTicketPopoverOpen(false)
                                }}
                              >
                                Limpar seleção
                              </Button>
                            </div>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Tipo de demanda</Label>
              <Controller
                control={vm.control}
                name="ticket_type_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={fieldDisabled || vm.isTicketTypesLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {vm.ticketTypes.map((ticketType) => (
                        <SelectItem
                          key={ticketType.id}
                          value={ticketType.id}
                          className={styles.selectItemForm}
                        >
                          {ticketType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {vm.errors.ticket_type_id?.message && (
                <p className="text-xs text-destructive">
                  {vm.errors.ticket_type_id.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Section
          title="Informações da demanda"
          isOpen={vm.openSections.info}
          onToggle={() => vm.toggleSection('info')}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Nº de procedimento</Label>
              <Controller
                control={vm.control}
                name="procedure_number"
                render={({ field }) => (
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    inputMode="numeric"
                    autoComplete="off"
                    value={field.value ?? ''}
                    onBlur={() => {
                      field.onBlur()
                      const raw = (field.value ?? '').trim()
                      if (raw === '') return
                      const padded = padDigitsLeft(raw, L.procedure_number)
                      if (padded && padded !== field.value) {
                        field.onChange(padded)
                      }
                    }}
                    ref={field.ref}
                    onChange={(e) =>
                      field.onChange(
                        maskDigitsOnly(e.target.value, L.procedure_number),
                      )
                    }
                  />
                )}
              />
              <FieldStringError
                value={vm.watch('procedure_number')}
                max={L.procedure_number}
                message={vm.errors.procedure_number?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Nº do ofício</Label>
              <Controller
                control={vm.control}
                name="official_letter_number"
                render={({ field }) => (
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    autoComplete="off"
                    value={field.value ?? ''}
                    onBlur={() => {
                      field.onBlur()
                      const raw = (field.value ?? '').trim()
                      if (raw === '') return
                      const normalized = normalizeNumeroOficio(raw)
                      if (normalized !== field.value) {
                        field.onChange(normalized || null)
                      }
                    }}
                    ref={field.ref}
                    onChange={(e) =>
                      field.onChange(maskNumeroOficio(e.target.value) || null)
                    }
                  />
                )}
              />
              <FieldStringError
                value={vm.watch('official_letter_number')}
                max={L.official_letter_number}
                message={vm.errors.official_letter_number?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Data base do fato</Label>
              <Controller
                control={vm.control}
                name="base_date"
                render={({ field }) => (
                  <DataBaseDatePicker
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={fieldDisabled}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Natureza</Label>
              <Controller
                control={vm.control}
                name="nature_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={fieldDisabled || vm.isTicketNaturesLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {vm.ticketNatures.map((nature) => (
                        <SelectItem
                          key={nature.id}
                          value={nature.id}
                          className={styles.selectItemForm}
                        >
                          {nature.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {vm.errors.nature_id?.message && (
                <p className="text-xs text-destructive">
                  {vm.errors.nature_id.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:col-span-2">
              <Label className={styles.fieldLabel}>
                Possui apelido pela imprensa?
              </Label>

              <Controller
                control={vm.control}
                name="has_press_alias"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="has_press_alias"
                      size="sm"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={fieldDisabled}
                      className={styles.apelidoToggle}
                    />
                    <span className={styles.toggleLabel}>
                      {field.value ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
              />
            </div>

            {vm.possuiApelido && (
              <>
                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>
                    Apelido pela imprensa
                  </Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    {...vm.register('press_alias')}
                  />
                  <FieldStringError
                    value={vm.watch('press_alias')}
                    max={L.press_alias}
                    message={vm.errors.press_alias?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Link da matéria</Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    placeholder="https://..."
                    {...vm.register('article_link')}
                  />
                  <FieldStringError
                    value={vm.watch('article_link')}
                    max={L.article_link}
                    message={vm.errors.article_link?.message}
                  />
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 md:col-span-2">
              <Label className={styles.fieldLabel}>
                Possui endereço de correspondência?
              </Label>

              <Controller
                control={vm.control}
                name="has_correspondence_address"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="has_correspondence_address"
                      size="sm"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={fieldDisabled}
                      className={styles.apelidoToggle}
                    />
                    <span className={styles.toggleLabel}>
                      {field.value ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
              />
            </div>

            {vm.possuiEnderecoCorrespondencia && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(4.5rem,6rem)] md:col-span-2">
                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Bairro</Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    {...vm.register('correspondence_neighborhood')}
                  />
                  <FieldStringError
                    value={vm.watch('correspondence_neighborhood')}
                    max={L.correspondence_neighborhood}
                    message={vm.errors.correspondence_neighborhood?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Rua</Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    {...vm.register('correspondence_street')}
                  />
                  <FieldStringError
                    value={vm.watch('correspondence_street')}
                    max={L.correspondence_street}
                    message={vm.errors.correspondence_street?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Número</Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={fieldDisabled}
                    {...vm.register('correspondence_number')}
                  />
                  <FieldStringError
                    value={vm.watch('correspondence_number')}
                    max={L.correspondence_number}
                    message={vm.errors.correspondence_number?.message}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Requisitante"
          isOpen={vm.openSections.requester}
          onToggle={() => vm.toggleSection('requester')}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Requisitante</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={fieldDisabled}
                  {...vm.register('requester.name')}
                />
                <FieldStringError
                  value={vm.watch('requester.name')}
                  max={L.requester_name}
                  message={vm.errors.requester?.name?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Telefone</Label>
                <Controller
                  control={vm.control}
                  name="requester.phone"
                  render={({ field }) => (
                    <div className={styles.inputWithIconRight}>
                      <Input
                        className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={fieldDisabled}
                        inputMode="tel"
                        autoComplete="tel"
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(e) =>
                          field.onChange(maskPhoneBR(e.target.value))
                        }
                      />
                      <Phone
                        className="h-4 w-4 shrink-0 opacity-50"
                        aria-hidden
                      />
                    </div>
                  )}
                />
                <FieldStringError
                  value={vm.watch('requester.phone')}
                  max={L.requester_phone}
                  message={vm.errors.requester?.phone?.message}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Email</Label>
                <div className={styles.inputWithIconRight}>
                  <Input
                    className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    type="email"
                    disabled={fieldDisabled}
                    autoComplete="email"
                    {...vm.register('requester.email')}
                  />
                  <Mail className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                </div>
                <FieldStringError
                  value={vm.watch('requester.email')}
                  max={L.requester_email}
                  message={vm.errors.requester?.email?.message}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Demandante</Label>
              <Controller
                control={vm.control}
                name="operation_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={fieldDisabled || vm.isOperationsLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {vm.operations.map((op) => (
                        <SelectItem
                          key={op.id}
                          value={op.id}
                          className={styles.selectItemForm}
                        >
                          {op.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {vm.errors.operation_id?.message && (
                <p className="text-xs text-destructive">
                  {vm.errors.operation_id.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {vm.focalPoints.fields.map((fp, idx) => (
                <div
                  key={fp.id}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Ponto focal</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={fieldDisabled}
                      {...vm.register(`focal_points.${idx}.name`)}
                    />
                    <FieldStringError
                      value={vm.watch(`focal_points.${idx}.name`)}
                      max={L.requester_name}
                      message={vm.errors.focal_points?.[idx]?.name?.message}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Telefone</Label>
                    <Controller
                      control={vm.control}
                      name={`focal_points.${idx}.phone`}
                      render={({ field }) => (
                        <div className={styles.inputWithIconRight}>
                          <Input
                            className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={fieldDisabled}
                            inputMode="tel"
                            autoComplete="tel"
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            onChange={(e) =>
                              field.onChange(maskPhoneBR(e.target.value))
                            }
                          />
                          <Phone
                            className="h-4 w-4 shrink-0 opacity-50"
                            aria-hidden
                          />
                        </div>
                      )}
                    />
                    <FieldStringError
                      value={vm.watch(`focal_points.${idx}.phone`)}
                      max={L.requester_phone}
                      message={vm.errors.focal_points?.[idx]?.phone?.message}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Email</Label>
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className={styles.inputWithIconRight}>
                          <Input
                            className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            type="email"
                            disabled={fieldDisabled}
                            autoComplete="email"
                            {...vm.register(`focal_points.${idx}.email`)}
                          />
                          <Mail
                            className="h-4 w-4 shrink-0 opacity-50"
                            aria-hidden
                          />
                        </div>
                        <FieldStringError
                          value={vm.watch(`focal_points.${idx}.email`)}
                          max={L.requester_email}
                          message={
                            vm.errors.focal_points?.[idx]?.email?.message
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-11 shrink-0 p-0"
                        disabled={fieldDisabled}
                        onClick={() => vm.focalPoints.remove(idx)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end gap-4">
              <button
                type="button"
                disabled={fieldDisabled || vm.focalPoints.fields.length >= 20}
                onClick={() =>
                  vm.focalPoints.append({
                    name: '',
                    phone: '',
                    email: null,
                  })
                }
                className={styles.addPointFocalButton}
              >
                <Plus className="h-5 w-5 shrink-0" aria-hidden />
                Adicionar Ponto Focal
              </button>
            </div>
          </div>
        </Section>

        <Section
          title="Serviços"
          isOpen={vm.openSections.services}
          onToggle={() => vm.toggleSection('services')}
        >
          <div className={styles.serviceGrid}>
            <ServiceAddCard
              title="Busca por placa"
              onAdd={() => vm.handleOpenService('plate_search')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Busca por radar"
              onAdd={() => vm.handleOpenService('radar_search')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Cerco"
              onAdd={() => vm.handleOpenService('electronic_fence')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Imagem"
              onAdd={() => vm.handleOpenService('image_search')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Placas correlatas"
              onAdd={() => vm.handleOpenService('correlated_plates')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Placas conjuntas"
              onAdd={() => vm.handleOpenService('joint_plates')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Reserva de imagem"
              onAdd={() => vm.handleOpenService('image_reservation')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Análise de imagem"
              onAdd={() => vm.handleOpenService('image_analysis')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Outros"
              onAdd={() => vm.handleOpenService('other')}
              disabled={fieldDisabled}
            />
            <ServiceAddCard
              title="Atlas Civitas"
              onAdd={() => vm.handleOpenService('atlas_civitas')}
              disabled={fieldDisabled}
            />
          </div>

          <div className="mt-4 space-y-4">
            <ServiceList
              label="Busca por placa"
              fields={vm.buscaPorPlaca.fields}
              onRemove={vm.buscaPorPlaca.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('plate_search', idx)}
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Busca por radar"
              fields={vm.buscaPorRadar.fields}
              onRemove={vm.buscaPorRadar.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('radar_search', idx)}
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Cerco eletrônico"
              fields={vm.cercoEletronico.fields}
              onRemove={vm.cercoEletronico.remove}
              onEdit={(idx) =>
                vm.openServiceModalForEdit('electronic_fence', idx)
              }
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Busca por imagem"
              fields={vm.buscaPorImagem.fields}
              onRemove={vm.buscaPorImagem.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('image_search', idx)}
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Placas correlatas"
              fields={vm.placasCorrelatas.fields}
              onRemove={vm.placasCorrelatas.remove}
              onEdit={(idx) =>
                vm.openServiceModalForEdit('correlated_plates', idx)
              }
              renderRow={(idx) => (
                <CorrelataListForm
                  control={vm.control}
                  setValue={vm.setValue}
                  index={idx}
                  name="correlated_plates"
                  disabled={fieldDisabled}
                />
              )}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Placas conjuntas"
              fields={vm.placasConjuntas.fields}
              onRemove={vm.placasConjuntas.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('joint_plates', idx)}
              renderRow={(idx) => (
                <CorrelataListForm
                  control={vm.control}
                  setValue={vm.setValue}
                  index={idx}
                  name="joint_plates"
                  disabled={fieldDisabled}
                />
              )}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Reserva de imagem"
              fields={vm.reservaDeImagem.fields}
              onRemove={vm.reservaDeImagem.remove}
              onEdit={(idx) =>
                vm.openServiceModalForEdit('image_reservation', idx)
              }
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Análise de imagem"
              fields={vm.analiseDeImagem.fields}
              onRemove={vm.analiseDeImagem.remove}
              onEdit={(idx) =>
                vm.openServiceModalForEdit('image_analysis', idx)
              }
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Outros"
              fields={vm.other.fields}
              onRemove={vm.other.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('other', idx)}
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />

            <ServiceList
              label="Atlas Civitas"
              fields={vm.atlasCivitas.fields}
              onRemove={vm.atlasCivitas.remove}
              onEdit={(idx) => vm.openServiceModalForEdit('atlas_civitas', idx)}
              renderRow={() => null}
              disabled={fieldDisabled}
              openModalDisabled={vm.isLoading}
            />
          </div>
        </Section>

        <Section
          title="Locação interna"
          isOpen={vm.openSections.internal}
          onToggle={() => vm.toggleSection('internal')}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Equipe</Label>
              <Controller
                control={vm.control}
                name="team_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={fieldDisabled}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {vm.teams.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className={styles.selectItemForm}
                        >
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {vm.errors.team_id?.message && (
                <p className="text-xs text-destructive">
                  {vm.errors.team_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={styles.fieldLabel}>Prioridade</Label>
              <div className="grid grid-cols-3 gap-3">
                <PriorityButton
                  active={vm.watch('priority') === 'URGENTE'}
                  label="Urgente"
                  onClick={() => {
                    const current = vm.getValues('priority')
                    vm.setValue(
                      'priority',
                      current === 'URGENTE' ? null : 'URGENTE',
                    )
                  }}
                  disabled={fieldDisabled}
                />
                <PriorityButton
                  active={vm.watch('priority') === 'ALTA'}
                  label="Alta"
                  onClick={() => {
                    const current = vm.getValues('priority')
                    vm.setValue('priority', current === 'ALTA' ? null : 'ALTA')
                  }}
                  disabled={fieldDisabled}
                />
                <PriorityButton
                  active={vm.watch('priority') === 'ROTINA'}
                  label="Rotina"
                  onClick={() => {
                    const current = vm.getValues('priority')
                    vm.setValue(
                      'priority',
                      current === 'ROTINA' ? null : 'ROTINA',
                    )
                  }}
                  disabled={fieldDisabled}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Adicionar comentário"
          isOpen={vm.openSections.comment}
          onToggle={() => vm.toggleSection('comment')}
        >
          <Textarea
            placeholder="Escreva um comentário"
            disabled={fieldDisabled}
            className={`${styles.fakeEditor} ${styles.inputBg}`}
            {...vm.register('initial_comment')}
          />
          <FieldStringError
            value={vm.watch('initial_comment')}
            max={L.initial_comment}
            message={vm.errors.initial_comment?.message}
          />
        </Section>

        <Section
          title="Anexar documentos"
          isOpen={vm.openSections.attachments}
          onToggle={() => vm.toggleSection('attachments')}
        >
          <div className={styles.attachmentsLayout}>
            <div className={styles.attachmentsDocumentList}>
              {vm.files.length === 0 ? (
                <p className={styles.uploadBoxHint}>Nenhum arquivo anexado.</p>
              ) : (
                <div className={styles.fileList}>
                  {vm.files.map((f, idx) => (
                    <div key={`${f.name}-${idx}`} className={styles.fileRow}>
                      <SquareCheck
                        className={`${styles.fileRowCheckIcon} shrink-0`}
                        aria-hidden
                      />
                      <p className={styles.fileRowFileName} title={f.name}>
                        {f.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        className={`${styles.fileRowDeleteBtn} h-8 w-8 shrink-0 p-0`}
                        onClick={() => vm.removeFile(idx)}
                        disabled={attachmentDisabled}
                        title="Excluir anexo"
                      >
                        <Trash className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.uploadColumn}>
              <label className={styles.uploadBox}>
                <input
                  className="hidden"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    vm.onDropFiles(e.target.files)
                    e.target.value = ''
                  }}
                  disabled={attachmentDisabled}
                />
                <Upload className="h-6 w-6 shrink-0 text-[var(--tc-icon-subtle)]" />
                <span className={styles.uploadBoxText}>
                  Clique para fazer upload ou arraste o arquivo
                </span>
                <span className={styles.uploadBoxHint}>
                  PDF, DOC, DOCX (máx. 10MB)
                </span>
              </label>
            </div>
          </div>
        </Section>

        <div className={styles.footerBar}>
          <div className={styles.footerInner}>
            <Button
              type="button"
              variant="secondary"
              className={styles.cancelButton}
              disabled={vm.isLoading}
              onClick={() => vm.resetFormToDefaults()}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={vm.isLoading}
              className={styles.saveButton}
            >
              {vm.isLoading
                ? vm.isConvertingToConventional
                  ? 'Convertendo...'
                  : 'Salvando...'
                : isAssociarConvertMode
                  ? 'Atualizar Demanda'
                  : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>

      <ServiceModal
        serviceModalOpen={vm.serviceModalOpen}
        editIndex={vm.serviceModalEditIndex}
        closeServiceModal={vm.closeServiceModal}
        readOnly={isAssociarConvertMode}
        initialBuscaPorPlaca={initialBuscaPorPlaca}
        initialBuscaPorRadar={initialBuscaPorRadar}
        initialCerco={initialCerco}
        initialBuscaPorImagem={initialBuscaPorImagem}
        initialPlacasCorrelatas={initialPlacasCorrelatas}
        initialPlacasConjuntas={initialPlacasConjuntas}
        initialReservaImagem={initialReservaImagem}
        initialAnaliseImagem={initialAnaliseImagem}
        initialOutros={initialOutros}
        initialAtlasCivitas={initialAtlasCivitas}
        onSaveBuscaPorPlaca={(value, editIndex) => {
          const normalized = {
            plates: (value.plates ?? [])
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
          }

          if (editIndex !== null) {
            vm.buscaPorPlaca.update(editIndex, normalized)
          } else {
            vm.buscaPorPlaca.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveBuscaPorRadar={(value, editIndex) => {
          const normalized = {
            plates: (value.plates ?? [])
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
          }

          if (editIndex !== null) {
            vm.buscaPorRadar.update(editIndex, normalized)
          } else {
            vm.buscaPorRadar.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveCerco={(value, editIndex) => {
          const normalized = {
            plates: value.plates ?? [],
            vehicle_observations: nullIfEmpty(value.vehicle_observations),
          }

          if (editIndex !== null) {
            vm.cercoEletronico.update(editIndex, normalized)
          } else {
            vm.cercoEletronico.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveBuscaPorImagem={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            addresses: value.addresses ?? [],
            description: nullIfEmpty(value.description),
            cameras: value.cameras ?? [],
          }

          if (editIndex !== null) {
            vm.buscaPorImagem.update(editIndex, normalized)
          } else {
            vm.buscaPorImagem.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSavePlacasCorrelatas={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            interest_interval_minutes: value.interest_interval_minutes,
            detection_count: value.detection_count,
            detection: value.detection,
            plates: value.plates.map((item) => ({
              plate: item.plate,
            })),
          }

          if (editIndex !== null) {
            vm.placasCorrelatas.update(editIndex, normalized)
          } else {
            vm.placasCorrelatas.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSavePlacasConjuntas={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            interest_interval_minutes: value.interest_interval_minutes,
            detection_count: value.detection_count,
            detection: value.detection,
            plates: value.plates.map((item) => ({
              plate: item.plate,
            })),
          }

          if (editIndex !== null) {
            vm.placasConjuntas.update(editIndex, normalized)
          } else {
            vm.placasConjuntas.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveReservaImagem={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
            addresses: value.addresses ?? [],
            cameras: value.cameras ?? [],
          }

          if (editIndex !== null) {
            vm.reservaDeImagem.update(editIndex, normalized)
          } else {
            vm.reservaDeImagem.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveAnaliseImagem={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
            addresses: value.addresses ?? [],
            cameras: value.cameras ?? [],
          }

          if (editIndex !== null) {
            vm.analiseDeImagem.update(editIndex, normalized)
          } else {
            vm.analiseDeImagem.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveOutros={(value, editIndex) => {
          const normalized = {
            orientation: nullIfEmpty(value.orientation),
          }

          if (editIndex !== null) {
            vm.other.update(editIndex, normalized)
          } else {
            vm.other.append(normalized)
          }

          vm.closeServiceModal()
        }}
        onSaveAtlasCivitas={(value, editIndex) => {
          const normalized = {
            name: value.name.trim(),
            email: value.email.trim(),
            cpf: value.cpf,
            registration: value.registration.trim(),
          }

          if (editIndex !== null) {
            vm.atlasCivitas.update(editIndex, normalized)
          } else {
            vm.atlasCivitas.append(normalized)
          }

          vm.closeServiceModal()
        }}
      />
    </div>
  )
}
