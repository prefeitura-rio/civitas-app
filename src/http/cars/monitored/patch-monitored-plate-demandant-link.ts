import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

import { mapBackendMonitoredPlateToMonitoredPlate } from './map-backend-monitored-plate'

export interface PatchMonitoredPlateDemandantLinkInput {
  plate: string
  linkId: string
  referenceNumber?: string
  /** ISO string; `null` envia `null` no JSON para limpar validade (se a API aceitar). */
  validUntil?: string | null
  active?: boolean
  notes?: string
  additionalInfo?: JSON
  /** Se presente, substitui a lista de LPR do víncio por completo. */
  lprEquipmentIds?: string[]
}

export async function patchMonitoredPlateDemandantLink({
  plate,
  linkId,
  referenceNumber,
  validUntil,
  active,
  notes,
  additionalInfo,
  lprEquipmentIds,
}: PatchMonitoredPlateDemandantLinkInput) {
  const body: Record<string, unknown> = {}

  if (typeof referenceNumber !== 'undefined')
    body.reference_number = referenceNumber
  if (typeof validUntil !== 'undefined') body.valid_until = validUntil
  if (typeof active !== 'undefined') body.active = active
  if (typeof notes !== 'undefined') body.notes = notes
  if (typeof additionalInfo !== 'undefined')
    body.additional_info = additionalInfo
  if (typeof lprEquipmentIds !== 'undefined')
    body.lpr_equipment_ids = lprEquipmentIds

  const response = await api.patch<BackendMonitoredPlate>(
    `cars/monitored/${plate}/demandant-links/${linkId}`,
    body,
  )

  return mapBackendMonitoredPlateToMonitoredPlate(response.data)
}
