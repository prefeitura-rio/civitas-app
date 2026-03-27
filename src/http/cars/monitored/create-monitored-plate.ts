import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

export interface MonitoredPlateDemandantLinkInput {
  demandantId: string
  referenceNumber: string
  validUntil?: string
  notes?: string
  additionalInfo?: JSON
  lprEquipmentIds?: string[]
}

export interface CreateMonitoredPlateRequest {
  plate: string
  numeroControle: string
  notes?: string
  notificationChannels: string[]
  demandantLinks?: MonitoredPlateDemandantLinkInput[]
}

export function createMonitoredPlate({
  plate,
  numeroControle,
  notes,
  notificationChannels,
  demandantLinks,
}: CreateMonitoredPlateRequest) {
  const body: Record<string, unknown> = {
    plate,
    numero_controle: numeroControle,
    notes: notes ?? undefined,
    notification_channels:
      notificationChannels.length > 0 ? notificationChannels : undefined,
  }

  if (demandantLinks && demandantLinks.length > 0) {
    body.demandant_links = demandantLinks.map((link) => ({
      demandant_id: link.demandantId,
      reference_number: link.referenceNumber,
      valid_until: link.validUntil ?? undefined,
      notes: link.notes ?? undefined,
      additional_info: link.additionalInfo ?? undefined,
      lpr_equipment_ids:
        link.lprEquipmentIds && link.lprEquipmentIds.length > 0
          ? link.lprEquipmentIds
          : undefined,
    }))
  }

  return api.post<BackendMonitoredPlate>('/cars/monitored', body)
}
