import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import type {
  TicketAttachmentCompleteIn,
  TicketAttachmentServiceScopeMetadataIn,
} from '@/http/tickets/ticket-attachments'
import {
  putVideoToGcsSignedUrl,
  requestTicketVideoUploadUrl,
} from '@/http/tickets/ticket-attachments'
import type { TicketServicosOut } from '@/http/tickets/ticket-servicos'
import type { TicketServicesUpsertIn } from '@/http/tickets/ticket-servicos-types'

import {
  isZipFile,
  resolveGcsUploadContentType,
  usesGcsSignedUrlUpload,
} from './components/ticket-gcs-upload'
import {
  pendingAttachmentAsUploadFile,
  type PendingServiceAttachment,
} from './components/ticket-pending-attachment'
import { ticketServicosToReplacePayload } from './ticket-servicos-mapper'

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
  fileName: string
  uploadKind: 'ZIP' | 'vídeo'
  phase: 'preparing' | 'uploading' | 'finalizing'
  percent: number
}

export type BuildTicketServicosSaveOptions = {
  onGcsProgress?: (progress: GcsUploadProgress) => void
}

export type TicketServicosSaveRequest = {
  payload: TicketServicesUpsertIn
  files: File[]
  attachmentMetadata: TicketAttachmentServiceScopeMetadataIn[]
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
): TicketAttachmentServiceScopeMetadataIn {
  return {
    service_type: kind,
    service_index: index + 1,
  }
}

async function uploadPendingGcsAttachment(
  ticketId: string,
  file: File,
  scope: TicketAttachmentServiceScopeMetadataIn,
  options?: BuildTicketServicosSaveOptions,
): Promise<TicketAttachmentCompleteIn> {
  const contentType = resolveGcsUploadContentType(file)
  const uploadKind = isZipFile(file) ? 'ZIP' : 'vídeo'

  options?.onGcsProgress?.({
    fileName: file.name,
    uploadKind,
    phase: 'preparing',
    percent: 0,
  })

  const uploadMeta = await requestTicketVideoUploadUrl(ticketId, {
    filename: file.name,
    content_type: contentType,
    file_size: file.size,
    resumable: true,
    service_type: scope.service_type,
    service_index: scope.service_index,
    service_id: scope.service_id,
  })

  options?.onGcsProgress?.({
    fileName: file.name,
    uploadKind,
    phase: 'uploading',
    percent: 0,
  })

  await putVideoToGcsSignedUrl(uploadMeta.signed_url, file, contentType, {
    onProgress: ({ loaded, total }) => {
      const t = total > 0 ? total : file.size
      const pct = t > 0 ? Math.min(100, Math.round((loaded / t) * 100)) : 0
      options?.onGcsProgress?.({
        fileName: file.name,
        uploadKind,
        phase: 'uploading',
        percent: pct,
      })
    },
  })

  options?.onGcsProgress?.({
    fileName: file.name,
    uploadKind,
    phase: 'finalizing',
    percent: 100,
  })

  return {
    storage_key: uploadMeta.storage_key,
    filename: file.name,
    content_type: contentType,
    size_bytes: file.size,
    service_type: scope.service_type,
    service_index: scope.service_index,
    service_id: scope.service_id,
  }
}

/** Monta payload multipart e faz pré-upload GCS de vídeos/ZIP pendentes. */
export async function buildTicketServicosSaveRequest(
  ticketId: string,
  draft: TicketServicosOut,
  pendingByRowId: PendingServiceFilesByRowId,
  options?: BuildTicketServicosSaveOptions,
): Promise<TicketServicosSaveRequest> {
  const rowRefById = buildRowRefById(draft)
  const attachmentCompletes: TicketAttachmentCompleteIn[] = []
  const files: File[] = []
  const attachmentMetadata: TicketAttachmentServiceScopeMetadataIn[] = []

  for (const [rowId, pendingItems] of Object.entries(pendingByRowId)) {
    if (!pendingItems.length) continue

    const rowRef = rowRefById.get(rowId)
    if (!rowRef) continue

    const scope = serviceScopeMetadata(rowRef.kind, rowRef.index)

    for (const item of pendingItems) {
      const file = pendingAttachmentAsUploadFile(item)

      if (usesGcsSignedUrlUpload(file)) {
        const complete = await uploadPendingGcsAttachment(
          ticketId,
          file,
          scope,
          options,
        )
        attachmentCompletes.push(complete)
        continue
      }

      files.push(file)
      attachmentMetadata.push(scope)
    }
  }

  const basePayload = ticketServicosToReplacePayload(draft)
  const payload: TicketServicesUpsertIn = {
    ...basePayload,
    ...(attachmentCompletes.length > 0
      ? { attachment_completes: attachmentCompletes }
      : {}),
  }

  return { payload, files, attachmentMetadata }
}
