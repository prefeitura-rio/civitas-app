import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import type {
  TicketAttachmentCompleteIn,
  TicketAttachmentServiceScopeMetadataIn,
} from '@/http/tickets/ticket-attachments'
import {
  requestTicketVideoUploadUrl,
  resolveGcsSessionUri,
} from '@/http/tickets/ticket-attachments'
import { gcsResumableChunkedUpload } from '@/http/tickets/ticket-gcs-resumable'
import type { TicketServicosOut } from '@/http/tickets/ticket-servicos'
import type { TicketServicesUpsertIn } from '@/http/tickets/ticket-servicos-types'
import {
  createUploadSession,
  deleteUploadSession,
  getUploadSessionByPendingId,
  isUploadSessionExpired,
  updateUploadSession,
} from '@/lib/gcs-upload-idb'

import {
  isVideoFile,
  isZipFile,
  resolveGcsUploadContentType,
} from './components/ticket-gcs-upload'
import {
  pendingAttachmentAsUploadFile,
  type PendingServiceAttachment,
} from './components/ticket-pending-attachment'
import {
  isLocalDraftServiceId,
  ticketServicosToReplacePayload,
} from './ticket-servicos-mapper'

const SERVICE_KINDS = [
  'plate_search',
  'radar_search',
  'electronic_fence',
  'image_search',
  'correlated_plates',
  'joint_plates',
  'image_reservation',
  'image_analysis',
  'other',
  'atlas_civitas',
] as const satisfies readonly OpenServiceKey[]

type TicketServiceRowKind = Exclude<OpenServiceKey, null>

type ServiceRowRef = {
  kind: TicketServiceRowKind
  index: number
}

export type PendingServiceFilesByRowId = Record<
  string,
  PendingServiceAttachment[]
>

export type GcsUploadProgress = {
  pendingAttachmentId: string
  fileName: string
  uploadKind: 'ZIP' | 'vídeo' | 'anexo'
  phase: 'preparing' | 'uploading' | 'finalizing'
  percent: number
  uploadedBytes?: number
  totalBytes?: number
}

export type BuildTicketServicosSaveOptions = {
  onGcsProgress?: (progress: GcsUploadProgress) => void
  signal?: AbortSignal
}

export type TicketServicosSaveRequest = {
  payload: TicketServicesUpsertIn
}

function buildRowRefById(draft: TicketServicosOut): Map<string, ServiceRowRef> {
  const out = new Map<string, ServiceRowRef>()
  for (const kind of SERVICE_KINDS) {
    const list = draft[kind] ?? []
    list.forEach((item, index) => {
      if (item?.id) {
        out.set(item.id, { kind, index })
      }
    })
  }
  return out
}

function serviceScopeMetadata(
  kind: TicketServiceRowKind,
  index: number,
  rowId: string,
): TicketAttachmentServiceScopeMetadataIn {
  if (!isLocalDraftServiceId(rowId)) {
    return {
      service_type: kind,
      service_id: rowId,
    }
  }
  return {
    service_type: kind,
    service_index: index + 1,
  }
}

function reportGcsProgress(
  options: BuildTicketServicosSaveOptions | undefined,
  progress: GcsUploadProgress,
) {
  options?.onGcsProgress?.(progress)
}

async function uploadPendingGcsAttachment(
  ticketId: string,
  rowId: string,
  item: PendingServiceAttachment,
  file: File,
  scope: TicketAttachmentServiceScopeMetadataIn,
  options?: BuildTicketServicosSaveOptions,
): Promise<TicketAttachmentCompleteIn> {
  const contentType = resolveGcsUploadContentType(file)
  const uploadKind = isZipFile(file)
    ? 'ZIP'
    : isVideoFile(file)
      ? 'vídeo'
      : 'anexo'

  reportGcsProgress(options, {
    pendingAttachmentId: item.id,
    fileName: file.name,
    uploadKind,
    phase: 'preparing',
    percent: 0,
    uploadedBytes: 0,
    totalBytes: file.size,
  })

  let session = await getUploadSessionByPendingId(item.id)
  let storageKey: string

  if (session && isUploadSessionExpired(session)) {
    await deleteUploadSession(session.id)
    session = undefined
  }

  if (session) {
    storageKey = session.storageKey
  } else {
    const uploadMeta = await requestTicketVideoUploadUrl(ticketId, {
      filename: file.name,
      content_type: contentType,
      file_size: file.size,
      resumable: true,
      service_type: scope.service_type,
      service_index: scope.service_index,
      service_id: scope.service_id,
    })

    const sessionUri = resolveGcsSessionUri(uploadMeta)
    storageKey = uploadMeta.storage_key

    session = await createUploadSession({
      ticketId,
      rowId,
      pendingAttachmentId: item.id,
      filename: file.name,
      storageKey,
      sessionUri,
      totalBytes: file.size,
      uploadedBytes: 0,
      contentType,
      expiresAt: Date.now() + uploadMeta.expires_in_minutes * 60_000,
    })
  }

  reportGcsProgress(options, {
    pendingAttachmentId: item.id,
    fileName: file.name,
    uploadKind,
    phase: 'uploading',
    percent:
      session.totalBytes > 0
        ? Math.min(
            100,
            Math.round((session.uploadedBytes / session.totalBytes) * 100),
          )
        : 0,
    uploadedBytes: session.uploadedBytes,
    totalBytes: session.totalBytes,
  })

  await gcsResumableChunkedUpload(session.sessionUri, file, contentType, {
    startByte: session.uploadedBytes,
    signal: options?.signal,
    onProgress: ({ uploaded, total }) => {
      const pct =
        total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0
      reportGcsProgress(options, {
        pendingAttachmentId: item.id,
        fileName: file.name,
        uploadKind,
        phase: 'uploading',
        percent: pct,
        uploadedBytes: uploaded,
        totalBytes: total,
      })
    },
    onChunkComplete: async (uploadedBytes) => {
      await updateUploadSession(session!.id, { uploadedBytes })
    },
  })

  reportGcsProgress(options, {
    pendingAttachmentId: item.id,
    fileName: file.name,
    uploadKind,
    phase: 'finalizing',
    percent: 100,
    uploadedBytes: file.size,
    totalBytes: file.size,
  })

  await deleteUploadSession(session.id)

  return {
    storage_key: storageKey,
    filename: file.name,
    content_type: contentType,
    size_bytes: file.size,
    service_type: scope.service_type,
    service_index: scope.service_index,
    service_id: scope.service_id,
  }
}

/** Faz pré-upload GCS de todos os anexos pendentes e monta o payload JSON. */
export async function buildTicketServicosSaveRequest(
  ticketId: string,
  draft: TicketServicosOut,
  pendingByRowId: PendingServiceFilesByRowId,
  options?: BuildTicketServicosSaveOptions,
): Promise<TicketServicosSaveRequest> {
  const rowRefById = buildRowRefById(draft)
  const attachmentCompletes: TicketAttachmentCompleteIn[] = []

  for (const [rowId, pendingItems] of Object.entries(pendingByRowId)) {
    if (!pendingItems.length) continue

    const rowRef = rowRefById.get(rowId)
    if (!rowRef) continue

    const scope = serviceScopeMetadata(rowRef.kind, rowRef.index, rowId)

    for (const item of pendingItems) {
      const file = pendingAttachmentAsUploadFile(item)
      const complete = await uploadPendingGcsAttachment(
        ticketId,
        rowId,
        item,
        file,
        scope,
        options,
      )
      attachmentCompletes.push(complete)
    }
  }

  const basePayload = ticketServicosToReplacePayload(draft)
  const payload: TicketServicesUpsertIn = {
    ...basePayload,
    ...(attachmentCompletes.length > 0
      ? { attachment_completes: attachmentCompletes }
      : {}),
  }

  return { payload }
}
