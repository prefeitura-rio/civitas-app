import type {
  BackendMonitoredPlate,
  MonitoredPlate,
  Operation,
} from '@/models/entities'

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

export function mapBackendMonitoredPlateToMonitoredPlate(
  item: BackendMonitoredPlate,
): MonitoredPlate {
  const demandantLinks = item.demandant_links
  const notificationChannels = (item.notification_channels ??
    []) as MonitoredPlate['notificationChannels']

  if (Array.isArray(demandantLinks) && demandantLinks.length > 0) {
    const selectedDemandantLink =
      demandantLinks.find((link) => link.active) ?? demandantLinks[0]

    const plateIsActive = demandantLinks.some((link) => link.active)

    return {
      id: item.id,
      plate: item.plate,
      ...(item.numero_controle ? { numeroControle: item.numero_controle } : {}),
      notes: item.notes,
      active: plateIsActive,
      contactInfo: toContactInfo(selectedDemandantLink.demandant),
      demandantLinks,
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

  return {
    id: item.id,
    plate: item.plate,
    ...(item.numero_controle ? { numeroControle: item.numero_controle } : {}),
    notes: item.notes,
    active: item.active ?? false,
    contactInfo: item.contact_info ?? null,
    demandantLinks: undefined,
    operation: item.operation as Operation,
    additionalInfo: item.additional_info ?? ({} as JSON),
    notificationChannels,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}
