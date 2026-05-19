import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

/**
 * `PUT /cars/monitored/{plate}` — apenas campos da entidade placa e canais
 * (sem `demandant_links`, conforme documentação da API).
 */
export interface UpdateMonitoredPlateRequest {
  plate: string
  newPlate?: string
  internalReferenceNumber?: string
  demandantTemp?: string
  notes?: string
  notificationChannels?: string[]
}

export function updateMonitoredPlate({
  plate,
  newPlate,
  internalReferenceNumber,
  demandantTemp,
  notes,
  notificationChannels,
}: UpdateMonitoredPlateRequest) {
  const body: Record<string, unknown> = {}
  if (typeof newPlate !== 'undefined') body.plate = newPlate
  if (typeof internalReferenceNumber !== 'undefined')
    body.internal_reference_number = internalReferenceNumber
  if (typeof demandantTemp !== 'undefined') body.demandant_temp = demandantTemp
  if (typeof notes !== 'undefined') body.notes = notes
  if (typeof notificationChannels !== 'undefined')
    body.notification_channels = notificationChannels

  return api.put<BackendMonitoredPlate>(`/cars/monitored/${plate}`, body)
}
