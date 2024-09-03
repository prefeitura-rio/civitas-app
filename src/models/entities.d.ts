export type Point = {
  index: number
  from: [longitude: number, latitude: number]
  startTime: string
  to?: [longitude: number, latitude: number]
  endTime?: string
  cameraNumber: string
  district: string
  location: string
  direction: string
  lane: string
  speed: number
  secondsToNextPoint: number | null
  cloneAlert: boolean
}

export type Trip = {
  index: number
  cloneAlert: boolean
  points: Point[]
}

export type Operation = {
  id: string
  title: string
  description: string
}

export type NotificationChannel = {
  id: string
  title: string
  channelType: string
  parameters: JSON
  active: boolean
}

export type BackendNotificationChannel = {
  id: string
  title: string
  channel_type: string
  parameters: JSON
  active: boolean
}

export type MonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additionalInfo: JSON
  notificationChannels: NotificationChannel[]
}

export type BackendMonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additional_info: JSON
  notification_channels: NotificationChannel[]
}

export type AdditionalInfo = {
  Operação?: string
}

export type BackendProfile = {
  id: string
  username: string
  full_name: string
  cpf: string
  registration: string
  agency: string
  sector: string
  email: string
  is_admin: boolean
}

export type Profile = {
  id: string
  username: string
  fullName: string
  cpf: string
  registration: string
  agency: string
  sector: string
  email: string
  isAdmin: boolean
}

export type BackendCameraCOR = {
  CameraCode: string
  CameraName: string
  CameraZone: string
  Latitude: string
  Longitude: string
  Streamming: string
}

export type CameraCOR = {
  code: string
  location: string
  zone: string
  latitude: number
  longitude: number
  streamingUrl: string
}

export type BackendRadar = {
  codcet: string | null
  camera_numero: string
  latitude: number
  longitude: number
  locequip: string | null
  bairro: string | null
  logradouro: string | null
  has_data: string
  empresa: string | null
  active_in_last_24_hours: string | null
  last_detection_time: string | null
  sentido: string | null
}

export type Radar = {
  cetRioCode: string | null
  cameraNumber: string
  latitude: number
  longitude: number
  location: string | null
  district: string | null
  streetName: string | null
  hasData: boolean
  activeInLast24Hours: boolean
  company: string | null
  lastDetectionTime: string | null
  direction: string | null
}

export type BackendWazeAlert = {
  timestamp: string
  street?: string
  type: string
  subtype: string
  reliability: number
  confidence: number
  number_thumbs_up?: number
  latitude: number
  longitude: number
}

export type WazeAlert = {
  timestamp: string
  street?: string
  type: string
  subtype: string
  reliability: number
  confidence: number
  numberThumbsUp?: number
  latitude: number
  longitude: number
}

export interface RadarDetection {
  plate: string
  timestamp: string
  speed: number
}

export type BackendAgent = {
  name: string
  contact_info: string
  operation: string
  latitude: number
  longitude: number
  last_update: string
}

export type Agent = {
  name: string
  contactInfo: string
  operation: string
  latitude: number
  longitude: number
  lastUpdate: string
}

export type Report = {
  reportId: string
  sourceId: string
  originalReportId: string
  date: string
  entities: string[]
  category: string
  typeAndSubtype: {
    type: string
    subtype: string[]
  }[]
  description: string
  latitude: number | null
  longitude: number | null
  location: string | null
  locationNumber: string | null
  additionalInfo:
    | {
        certainty: number
      }
    | undefined
}

export type BackendReport = {
  id_report: string
  id_source: string
  id_report_original: string
  data_report: string
  orgaos: string[]
  categoria: string
  tipo_subtipo: {
    tipo: string
    subtipo: string[]
  }[]
  descricao: string
  logradouro: string
  numero_logradouro: string
  latitude: 0
  longitude: 0
  additional_info:
    | {
        certainty: number
      }
    | undefined
}

export type FogoCruzadoIncident = {
  id: string
  documentNumber: number
  address: string
  state: {
    id: string
    name: string
  }
  region: {
    id: string
    region: string
    state: string
    enabled: boolean
  }
  city: {
    id: string
    name: string
  }
  neighborhood: {
    id: string
    name: string
  }
  subNeighborhood: string | null
  locality: {
    id: string
    name: string
  } | null
  latitude: number
  longitude: number
  date: string
  policeAction: boolean
  agentPresence: boolean
  relatedRecord: string
  contextInfo: {
    mainReason: {
      id: string
      name: string
    }
    complementaryReasons: {
      id: string
      name: string
    }[]
    clippings: {
      id: string
      name: string
    }[]
    massacre: boolean
    policeUnit: string
  }
  transports: {
    id: string
    occurenceId: string
    transport: string
    interruptedTransport: boolean
    dateInterruption: string
    releaseDate: string
    transportDescription: string
  }[]
  victims: {
    id: string
    occurrenceId: string
    type: 'People'
    situation: string
    circumstances: {
      id: string
      name: string
      type: string
    }[]
    deathDate: string
    personType: string
    age: number
    ageGroup: {
      id: string
      name: string
    }
    genre: {
      id: string
      name: string
    }
    race: string | null
    place: {
      id: string
      name: string
    }
    serviceStatus: {
      id: string
      name: string
      type: string
    }
    qualifications: {
      id: string
      name: string
      type: string
    }[]
    politicalPosition: {
      id: string
      name: string
      type: string
    } | null
    politicalStatus: {
      id: string
      name: string
      type: string
    } | null
    partie: {
      id: string
      name: string
      type: string
    } | null
    coorporation: {
      id: string
      name: string
    } | null
    agentPosition: {
      id: string
      name: string
      type: string
    } | null
    agentStatus: {
      id: string
      name: string
      type: string
    } | null
    unit: string
  }[]
  animalVictims: {
    id: string
    occurenceId: string
    name: string
    type: 'Animal'
    animalType: string
    situation: string
    circumstances: {
      id: string
      name: string
      type: string
    }[]
    deathDate: string | null
  }[]
}
