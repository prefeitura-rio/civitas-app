export type Operation = {
  id: string
  title: string
  description: string
}

export type MonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additionalInfo: JSON
  notificationChannels: string[]
}

export type AdditionalInfo = {
  Operação?: string
}
