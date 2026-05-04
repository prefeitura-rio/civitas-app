/** Vínculo placa–demandante ainda não persistido (incluído no POST `/cars/monitored`). */
export type MonitoredPlateDraftDemandantLink = {
  clientId: string
  demandantId: string
  referenceNumber: string
  validUntil?: string
  notes?: string
  /** IDs de equipamento LPR (ex.: código CET), conforme `lpr_equipment_ids` na API. */
  lprEquipmentIds?: string[]
}
