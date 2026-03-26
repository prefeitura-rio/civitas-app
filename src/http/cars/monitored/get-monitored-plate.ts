import { api } from '@/lib/api'
import type {
  BackendMonitoredPlate,
  MonitoredPlate,
  Operation,
} from '@/models/entities'

interface GetMonitoredPlateRequest {
  plate: string
}

export async function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const response = await api.get<BackendMonitoredPlate>(
    `cars/monitored/${plate}`,
  )

  function toContactInfo(demandant: {
    email: string
    phone_1: string
    phone_2: string | null
    phone_3: string | null
  }) {
    const parts = [
      demandant.email,
      demandant.phone_1,
      demandant.phone_2,
      demandant.phone_3,
    ].filter((value): value is string => Boolean(value && value.trim()))

    return parts.length ? parts.join(', ') : null
  }

  function mapBackendItemToMonitoredPlate(
    item: BackendMonitoredPlate,
  ): MonitoredPlate {
    const demandantLinks = item.demandant_links
    const notificationChannels =
      item.notification_channels as MonitoredPlate['notificationChannels']

    // Novo formato: `demandant_links` + `radars`
    if (Array.isArray(demandantLinks) && demandantLinks.length > 0) {
      const selectedDemandantLink =
        demandantLinks.find((link) => link.active) ?? demandantLinks[0]

      const plateIsActive = demandantLinks.some((link) => link.active)

      return {
        id: item.id,
        plate: item.plate,
        notes: item.notes,
        active: plateIsActive,
        contactInfo: toContactInfo(selectedDemandantLink.demandant),
        operation: {
          id: selectedDemandantLink.demandant.id,
          title: selectedDemandantLink.demandant.name,
          description: '',
        } as Operation,
        additionalInfo: selectedDemandantLink.additional_info,
        notificationChannels,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }
    }

    // Formato legado
    return {
      id: item.id,
      plate: item.plate,
      notes: item.notes,
      active: item.active ?? false,
      contactInfo: item.contact_info ?? null,
      operation: item.operation as Operation,
      additionalInfo: item.additional_info ?? ({} as JSON),
      notificationChannels,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }
  }

  const data = mapBackendItemToMonitoredPlate(response.data)

  return data
}
