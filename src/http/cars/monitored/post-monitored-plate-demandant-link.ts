import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

import type { MonitoredPlateDemandantLinkInput } from './create-monitored-plate'
import { mapBackendMonitoredPlateToMonitoredPlate } from './map-backend-monitored-plate'

export async function postMonitoredPlateDemandantLink({
  plate,
  demandantId,
  referenceNumber,
  validUntil,
  notes,
  additionalInfo,
  lprEquipmentIds,
}: { plate: string } & MonitoredPlateDemandantLinkInput) {
  const body: Record<string, unknown> = {
    demandant_id: demandantId,
    reference_number: referenceNumber,
  }

  if (typeof validUntil !== 'undefined') body.valid_until = validUntil
  if (typeof notes !== 'undefined') body.notes = notes
  if (typeof additionalInfo !== 'undefined')
    body.additional_info = additionalInfo
  if (lprEquipmentIds && lprEquipmentIds.length > 0)
    body.lpr_equipment_ids = lprEquipmentIds

  const response = await api.post<BackendMonitoredPlate>(
    `cars/monitored/${plate}/demandant-links`,
    body,
  )

  return mapBackendMonitoredPlateToMonitoredPlate(response.data)
}
