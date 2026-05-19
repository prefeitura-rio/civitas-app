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

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function extractDemandantTempText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }

  const obj = toRecord(value)
  if (!obj) return null

  const contactInfo = obj.contact_info
  const contactInfoText =
    typeof contactInfo === 'string' && contactInfo.trim()
      ? contactInfo.trim()
      : null

  const contactInfoCamel = obj.contactInfo
  const contactInfoCamelText =
    typeof contactInfoCamel === 'string' && contactInfoCamel.trim()
      ? contactInfoCamel.trim()
      : null

  const operation = toRecord(obj.operation)
  const operationTitle = operation?.title
  const operationTitleText =
    typeof operationTitle === 'string' && operationTitle.trim()
      ? operationTitle.trim()
      : null

  if (operationTitleText && (contactInfoText || contactInfoCamelText)) {
    return `${operationTitleText} ---- ${contactInfoText ?? contactInfoCamelText}`
  }

  if (operationTitleText) return operationTitleText
  if (contactInfoText) return contactInfoText
  if (contactInfoCamelText) return contactInfoCamelText

  return null
}

function extractInternalReferenceNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

/**
 * Compat com variações de payload observadas entre ambientes:
 * - demandant_temp (snake_case)
 * - demandantTemp (camelCase)
 * - dentro de additional_info / additionalInfo
 */
function getDemandantTemp(item: BackendMonitoredPlate): string | null {
  const directSnake = (item as unknown as Record<string, unknown>)
    .demandant_temp
  const fromDirectSnake = extractDemandantTempText(directSnake)
  if (fromDirectSnake) return fromDirectSnake

  const directCamel = (item as unknown as Record<string, unknown>).demandantTemp
  const fromDirectCamel = extractDemandantTempText(directCamel)
  if (fromDirectCamel) return fromDirectCamel

  const additionalInfo = toRecord(item.additional_info)
  if (additionalInfo) {
    const nestedSnake = extractDemandantTempText(additionalInfo.demandant_temp)
    if (nestedSnake) return nestedSnake
    const nestedCamel = extractDemandantTempText(additionalInfo.demandantTemp)
    if (nestedCamel) return nestedCamel
  }

  return null
}

function getInternalReferenceNumber(
  item: BackendMonitoredPlate,
): string | null {
  const root = item as unknown as Record<string, unknown>
  const directSnake = extractInternalReferenceNumber(
    root.internal_reference_number,
  )
  if (directSnake) return directSnake

  const directCamel = extractInternalReferenceNumber(
    root.internalReferenceNumber,
  )
  if (directCamel) return directCamel

  const ptSnake = extractInternalReferenceNumber(
    root.numero_referencia_interno_chamado,
  )
  if (ptSnake) return ptSnake

  const additionalInfo = toRecord(item.additional_info)
  if (additionalInfo) {
    const nestedSnake = extractInternalReferenceNumber(
      additionalInfo.internal_reference_number,
    )
    if (nestedSnake) return nestedSnake
    const nestedCamel = extractInternalReferenceNumber(
      additionalInfo.internalReferenceNumber,
    )
    if (nestedCamel) return nestedCamel
  }

  return null
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
      internalReferenceNumber: getInternalReferenceNumber(item),
      demandantTemp: getDemandantTemp(item),
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
    internalReferenceNumber: getInternalReferenceNumber(item),
    demandantTemp: getDemandantTemp(item),
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
