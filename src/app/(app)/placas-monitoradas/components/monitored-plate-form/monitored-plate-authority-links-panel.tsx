'use client'
import { useMutation, useQueries } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import {
  type Dispatch,
  forwardRef,
  type SetStateAction,
  useImperativeHandle,
  useState,
} from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  buildMonitoredPlateAuthorityActiveUpdate,
  createMonitoredPlateAuthority,
  deleteMonitoredPlateAuthority,
  getMonitoredPlateAuthority,
  updateMonitoredPlateAuthority,
} from '@/http/monitored-plate-authorities'
import type { MonitoredPlateAuthoritySummary } from '@/http/monitored-plates'
import { queryClient } from '@/lib/react-query'
import type { NotificationChannel } from '@/models/entities'
import { genericErrorMessage } from '@/utils/error-handlers'

import {
  type MonitoredPlateAuthorityDraftCreatePayload,
  MonitoredPlateAuthorityLinkCreateDialog,
} from './monitored-plate-authority-link-create-dialog'
import {
  isMonitoredPlateAuthorityValidUntilExpired,
  MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityLinkDraftEditDialog } from './monitored-plate-authority-link-draft-edit-dialog'
import { MonitoredPlateAuthorityLinkEditDialog } from './monitored-plate-authority-link-edit-dialog'
import type { MonitoredPlateDraftAuthorityLink } from './monitored-plate-draft-authority-link'

type PanelMode = 'persisted' | 'draft'

function compareValidUntilDesc(
  a: string | undefined,
  b: string | undefined,
): number {
  const timeA = a ? new Date(a).getTime() : Number.NaN
  const timeB = b ? new Date(b).getTime() : Number.NaN
  const aOk = Number.isFinite(timeA)
  const bOk = Number.isFinite(timeB)
  if (!aOk && !bOk) return 0
  if (!aOk) return 1
  if (!bOk) return -1
  return timeB - timeA
}

function sortLinksByActiveThenValidUntilDesc<
  T extends { active: boolean; validUntil?: string },
>(items: T[], isActive: (item: T) => boolean = (item) => item.active): T[] {
  return [...items].sort((a, b) => {
    const activeA = isActive(a) ? 1 : 0
    const activeB = isActive(b) ? 1 : 0
    if (activeA !== activeB) return activeB - activeA
    return compareValidUntilDesc(a.validUntil, b.validUntil)
  })
}

export type MonitoredPlateAuthorityLinksPanelHandle = {
  /** Applies deferred active toggles from the list Switch (edit plate flow). */
  flushPendingActiveChanges: () => Promise<void>
}

function getCollectionPointScopeLabel(
  monitorAllCollectionPoints: boolean,
  collectionPointIds: string[] | undefined,
) {
  const collectionPointCount = collectionPointIds?.length ?? 0

  if (monitorAllCollectionPoints) return 'Todos equipamentos de LPR do cerco'

  return collectionPointCount === 1
    ? '1 ponto monitorado'
    : String(collectionPointCount) + ' pontos monitorados'
}

interface MonitoredPlateAuthorityLinksPanelProps {
  mode: PanelMode
  plate: string
  monitoredPlateId?: string
  links?: MonitoredPlateAuthoritySummary[]
  draftLinks?: MonitoredPlateDraftAuthorityLink[]
  onDraftLinksChange?: Dispatch<
    SetStateAction<MonitoredPlateDraftAuthorityLink[]>
  >
  notificationChannels: NotificationChannel[]
  disabled?: boolean
}

export const MonitoredPlateAuthorityLinksPanel = forwardRef<
  MonitoredPlateAuthorityLinksPanelHandle,
  MonitoredPlateAuthorityLinksPanelProps
>(function MonitoredPlateAuthorityLinksPanel(
  {
    mode,
    plate,
    monitoredPlateId,
    links = [],
    draftLinks = [],
    onDraftLinksChange,
    notificationChannels,
    disabled = false,
  },
  ref,
) {
  const [editingDraft, setEditingDraft] =
    useState<MonitoredPlateDraftAuthorityLink | null>(null)
  const [editingPersisted, setEditingPersisted] =
    useState<MonitoredPlateAuthoritySummary | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingActiveByLinkId, setPendingActiveByLinkId] = useState<
    Record<string, boolean>
  >({})

  const reservedAuthorityIds =
    mode === 'persisted'
      ? links.map((link) => link.institutionAuthority.id)
      : draftLinks.map((draft) => draft.institutionAuthorityId)

  const persistedLinkDetailQueries = useQueries({
    queries:
      mode === 'persisted'
        ? links.map((link) => ({
            queryKey: ['monitored-plate-authorities', link.id],
            queryFn: () => getMonitoredPlateAuthority({ id: link.id }),
            enabled:
              !link.monitorAllCollectionPoints &&
              link.collectionPointIds.length === 0,
          }))
        : [],
  })

  function getPersistedLinkScope(link: MonitoredPlateAuthoritySummary) {
    const detailQuery = persistedLinkDetailQueries[links.indexOf(link)]
    const collectionPointIds =
      detailQuery?.data?.collectionPointIds ?? link.collectionPointIds

    return {
      label: getCollectionPointScopeLabel(
        link.monitorAllCollectionPoints,
        collectionPointIds,
      ),
      isLoading:
        !link.monitorAllCollectionPoints &&
        link.collectionPointIds.length === 0 &&
        detailQuery?.isLoading,
    }
  }

  const { mutateAsync: createPersistedLink, isPending: isCreatingPersisted } =
    useMutation({
      mutationFn: createMonitoredPlateAuthority,
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['monitored-plates'] }),
          queryClient.invalidateQueries({
            queryKey: ['monitored-plates', plate],
          }),
        ])
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const { mutateAsync: updatePersistedLink, isPending: isUpdatingPersisted } =
    useMutation({
      mutationFn: updateMonitoredPlateAuthority,
      onSuccess: async (_, variables) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['monitored-plate-authorities', variables.id],
          }),
          queryClient.invalidateQueries({ queryKey: ['monitored-plates'] }),
          queryClient.invalidateQueries({
            queryKey: ['monitored-plates', plate],
          }),
        ])
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const { mutateAsync: removePersistedLink, isPending: isRemovingPersisted } =
    useMutation({
      mutationFn: deleteMonitoredPlateAuthority,
      onSuccess: async (_, id) => {
        await Promise.all([
          queryClient.removeQueries({
            queryKey: ['monitored-plate-authorities', id],
          }),
          queryClient.invalidateQueries({ queryKey: ['monitored-plates'] }),
          queryClient.invalidateQueries({
            queryKey: ['monitored-plates', plate],
          }),
        ])
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  function updateDraft(
    clientId: string,
    data: Omit<
      MonitoredPlateDraftAuthorityLink,
      'clientId' | 'institutionAuthorityId'
    >,
  ) {
    if (!onDraftLinksChange) return
    onDraftLinksChange((prev) =>
      prev.map((draft) =>
        draft.clientId === clientId ? { ...draft, ...data } : draft,
      ),
    )
  }

  function removeDraft(clientId: string) {
    if (!onDraftLinksChange) return
    onDraftLinksChange((prev) =>
      prev.filter((draft) => draft.clientId !== clientId),
    )
  }

  function setDraftActive(clientId: string, active: boolean) {
    if (!onDraftLinksChange) return
    const draft = draftLinks.find((item) => item.clientId === clientId)
    if (
      active &&
      isMonitoredPlateAuthorityValidUntilExpired(draft?.validUntil)
    ) {
      toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
      return
    }
    onDraftLinksChange((prev) =>
      prev.map((item) =>
        item.clientId === clientId ? { ...item, active } : item,
      ),
    )
  }

  function getPersistedLinkActive(link: MonitoredPlateAuthoritySummary) {
    return pendingActiveByLinkId[link.id] ?? link.active
  }

  function omitPendingActive(
    prev: Record<string, boolean>,
    linkId: string,
  ): Record<string, boolean> {
    const next = { ...prev }
    delete next[linkId]
    return next
  }

  function setPendingPersistedActive(linkId: string, active: boolean) {
    const link = links.find((item) => item.id === linkId)
    if (
      active &&
      isMonitoredPlateAuthorityValidUntilExpired(link?.validUntil)
    ) {
      toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
      return
    }
    setPendingActiveByLinkId((prev) => {
      if (link && link.active === active) {
        return omitPendingActive(prev, linkId)
      }
      return { ...prev, [linkId]: active }
    })
  }

  useImperativeHandle(ref, () => ({
    async flushPendingActiveChanges() {
      const pendingEntries = Object.entries(pendingActiveByLinkId).filter(
        ([linkId, active]) => {
          const link = links.find((item) => item.id === linkId)
          return link != null && link.active !== active
        },
      )

      if (pendingEntries.length === 0) return

      for (const [id, active] of pendingEntries) {
        const link = links.find((item) => item.id === id)
        if (
          active &&
          isMonitoredPlateAuthorityValidUntilExpired(link?.validUntil)
        ) {
          throw new Error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
        }
      }

      await Promise.all(
        pendingEntries.map(([id, active]) => {
          const link = links.find((item) => item.id === id)
          if (!link) return Promise.resolve()

          return updatePersistedLink(
            buildMonitoredPlateAuthorityActiveUpdate(link, active),
          )
        }),
      )
      setPendingActiveByLinkId({})
    },
  }))

  async function handlePersistedCreate(
    payload: MonitoredPlateAuthorityDraftCreatePayload,
  ) {
    if (!monitoredPlateId) return

    await createPersistedLink({
      monitoredPlateId,
      institutionAuthorityId: payload.institutionAuthorityId,
      referenceNumber: payload.referenceNumber,
      requestedAt: payload.requestedAt,
      validUntil: payload.validUntil,
      active: payload.active,
      monitorAllCollectionPoints: payload.monitorAllCollectionPoints,
      notificationChannelIds: payload.notificationChannelIds ?? [],
      collectionPointIds: payload.collectionPointIds ?? [],
    })
  }

  const isMutatingPersisted =
    isCreatingPersisted || isUpdatingPersisted || isRemovingPersisted

  const sortedPersistedLinks = sortLinksByActiveThenValidUntilDesc(
    links,
    getPersistedLinkActive,
  )
  const sortedDraftLinks = sortLinksByActiveThenValidUntilDesc(draftLinks)

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Vínculos com requisitantes
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={
            disabled ||
            (mode === 'persisted' && !monitoredPlateId) ||
            isMutatingPersisted
          }
          onClick={() => setCreateOpen(true)}
        >
          Adicionar novo vínculo
        </Button>
      </div>

      {mode === 'persisted' ? (
        links.length > 0 ? (
          <ul className="flex max-h-60 flex-col gap-2 overflow-auto pr-1">
            {sortedPersistedLinks.map((link) => (
              <li key={link.id}>
                <div className="rounded-md border bg-background px-3 py-2 transition-colors hover:bg-muted/60">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      disabled={disabled || isMutatingPersisted}
                      className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditingPersisted(link)}
                    >
                      <div className="font-medium">
                        {link.institutionAuthority.name}
                      </div>
                      {link.institutionAuthority.requestingInstitution ? (
                        <div className="text-xs text-muted-foreground">
                          Demandante:{' '}
                          {link.institutionAuthority.requestingInstitution.name}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-muted-foreground">
                        Ref. {link.referenceNumber}
                        {link.validUntil
                          ? ` · até ${formatDate(new Date(link.validUntil), 'dd/MM/yyyy')}`
                          : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPersistedLinkScope(link).isLoading
                          ? 'Carregando pontos...'
                          : getPersistedLinkScope(link).label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Canais:{' '}
                        {link.notificationChannels
                          .map((item) => item.title || item.id)
                          .join(', ') || 'Nenhum'}
                      </div>
                    </button>
                    <div
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span>
                        {getPersistedLinkActive(link) ? 'Ativo' : 'Inativo'}
                      </span>
                      <Switch
                        checked={getPersistedLinkActive(link)}
                        disabled={disabled || isMutatingPersisted}
                        aria-label={`Vínculo ${getPersistedLinkActive(link) ? 'ativo' : 'inativo'}`}
                        onCheckedChange={(checked) =>
                          setPendingPersistedActive(link.id, checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum vínculo cadastrado ainda.
          </p>
        )
      ) : draftLinks.length > 0 ? (
        <ul className="flex max-h-60 flex-col gap-2 overflow-auto pr-1">
          {sortedDraftLinks.map((draft) => {
            const authorityName =
              draft.institutionAuthorityName ?? draft.institutionAuthorityId
            const requestingInstitutionName = draft.requestingInstitutionName

            return (
              <li key={draft.clientId}>
                <div className="rounded-md border bg-background px-3 py-2 transition-colors hover:bg-muted/60">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      disabled={disabled}
                      className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditingDraft(draft)}
                    >
                      <div className="font-medium">{authorityName}</div>
                      {requestingInstitutionName ? (
                        <div className="text-xs text-muted-foreground">
                          Demandante: {requestingInstitutionName}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        Ref. {draft.referenceNumber}
                        {draft.validUntil
                          ? ` · até ${formatDate(new Date(draft.validUntil), 'dd/MM/yyyy')}`
                          : ''}
                        {' · '}
                        {getCollectionPointScopeLabel(
                          draft.monitorAllCollectionPoints,
                          draft.collectionPointIds,
                        )}
                      </div>
                    </button>
                    <div
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span>{draft.active ? 'Ativo' : 'Inativo'}</span>
                      <Switch
                        checked={draft.active}
                        disabled={disabled}
                        aria-label={`Vínculo ${draft.active ? 'ativo' : 'inativo'}`}
                        onCheckedChange={(checked) =>
                          setDraftActive(draft.clientId, checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum vínculo na lista ainda.
        </p>
      )}

      {mode === 'draft' ? (
        <MonitoredPlateAuthorityLinkDraftEditDialog
          open={!!editingDraft}
          onOpenChange={(next) => {
            if (!next) setEditingDraft(null)
          }}
          draft={editingDraft}
          institutionAuthorityName={editingDraft?.institutionAuthorityName}
          requestingInstitutionName={editingDraft?.requestingInstitutionName}
          notificationChannels={notificationChannels}
          onSave={updateDraft}
          onRemove={removeDraft}
        />
      ) : (
        <MonitoredPlateAuthorityLinkEditDialog
          open={!!editingPersisted}
          onOpenChange={(next) => {
            if (!next) setEditingPersisted(null)
          }}
          link={editingPersisted}
          notificationChannels={notificationChannels}
          isSaving={isUpdatingPersisted}
          isRemoving={isRemovingPersisted}
          onSave={async (id, data) => {
            await updatePersistedLink({ id, ...data })
            setPendingActiveByLinkId((prev) => omitPendingActive(prev, id))
          }}
          onRemove={async (id) => {
            await removePersistedLink(id)
            setPendingActiveByLinkId((prev) => omitPendingActive(prev, id))
          }}
        />
      )}

      {mode === 'draft' && onDraftLinksChange ? (
        <MonitoredPlateAuthorityLinkCreateDialog
          plate={plate}
          open={createOpen}
          onOpenChange={setCreateOpen}
          notificationChannels={notificationChannels}
          reservedAuthorityIds={reservedAuthorityIds}
          plateDescription={plate}
          onCreate={(payload) => {
            onDraftLinksChange((prev) => [
              ...prev,
              {
                clientId: crypto.randomUUID(),
                institutionAuthorityId: payload.institutionAuthorityId,
                institutionAuthorityName: payload.institutionAuthorityName,
                requestingInstitutionName: payload.requestingInstitutionName,
                referenceNumber: payload.referenceNumber,
                requestedAt: payload.requestedAt,
                validUntil: payload.validUntil,
                active: payload.active,
                monitorAllCollectionPoints: payload.monitorAllCollectionPoints,
                notificationChannelIds: payload.notificationChannelIds,
                collectionPointIds: payload.collectionPointIds,
              },
            ])
          }}
        />
      ) : null}

      {mode === 'persisted' && monitoredPlateId ? (
        <MonitoredPlateAuthorityLinkCreateDialog
          plate={plate}
          open={createOpen}
          onOpenChange={setCreateOpen}
          notificationChannels={notificationChannels}
          reservedAuthorityIds={reservedAuthorityIds}
          plateDescription={plate}
          onCreate={handlePersistedCreate}
          submitLabel="Salvar vínculo"
          successMessage="Vínculo salvo com sucesso."
          disabled={disabled}
          isSubmitting={isCreatingPersisted}
        />
      ) : null}
    </div>
  )
})
