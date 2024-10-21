export type Point = {
  index: number
  from: [longitude: number, latitude: number]
  startTime: string
  to?: [longitude: number, latitude: number]
  endTime?: string
  cameraNumber: string
  district: string | null
  location: string | null
  direction: string | null
  lane: string | null
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
  createdAt: string
  updatedAt: string
}

export type BackendMonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additional_info: JSON
  notification_channels: NotificationChannel[]
  created_at: string
  updated_at: string
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
  lane: string | null
  streetNumber: string
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
  latitude: number
  longitude: number
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

export type Vehicle = {
  anoFabricacao: string
  anoModelo: string
  anoUltimoLicenciamnento: number
  arrendatario: {
    enderecoArrendatario: string
    id: number
    nomeArrendatario: string
    numeroDocumentoArrendatario: string
    placa: string
    tipoDocumentoArrendatario: string
  }
  capacidadeMaximaCarga: string
  capacidadeMaximaTracao: string
  carroceria: string
  categoria: string
  chassi: string
  cilindrada: number
  codigoCarroceira: number
  codigoCategoria: number
  codigoCor: number
  codigoEspecie: number
  codigoMarcaModelo: number
  codigoMunicipioEmplacamento: string
  codigoOrgaoSRF: string
  codigoSegurancaCRV: string
  codigoTipoVeiculo: number
  combustivel: string
  cor: string
  dataAtualizacaoAlarme: string
  dataAtualizacaoRouboFurto: string
  dataAtualizacaoVeiculo: string
  dataDeclaracaoImportacao: string
  dataEmissaoCRLV: string
  dataEmissaoUltimoCRV: string
  dataEmplacamento: string
  dataHoraAtualizacaoVeiculo: string
  dataLimiteRestricaoTributaria: string
  dataPreCadastro: string
  dataReplicacao: string
  descricaoOrgaoRegiaoFiscal: string
  especie: string
  flagAtivo: true
  grupoVeiculo: string
  id: number
  identificadorUnicoVeiculo: string
  indicadorRemarcacaoChassi: true
  indicadorVeiculoLicenciadoCirculacao: string
  indicadorVeiculoNacional: true
  indiceNacionalVeiculos: {
    id: number
    metodo: string
    qtd: number
  }[]
  lotacao: string
  marcaModelo: string
  mesAnoValidadeLicenciamento: number
  mesFabricacaoVeiculo: string
  municipioPlaca: string
  nomeArrendatario: string
  nomePossuidor: string
  nomeProprietario: string
  numeroCRV: string
  numeroCaixaCambio: string
  numeroCarroceria: string
  numeroDeclaracaoImportacao: string
  numeroEixoAuxiliar: string
  numeroEixoTraseiro: string
  numeroIdentificacaoFaturado: string
  numeroIdentificacaoImportador: string
  numeroLicencaUsoConfiguracaoVeiculosMotor: string
  numeroMotor: string
  numeroProcessoImportacao: string
  numeroSequenciaCRV: string
  numeroTipoCRLV: string
  numeroViaCRLV: number
  numeroViaCRV: number
  origemPossuidor: string
  paisTransferenciaVeiculo: string
  pesoBrutoTotal: string
  placa: string
  placaPreMercosul: string
  possuidor: {
    enderecoPossuidor: string
    id: number
    nomePossuidor: string
    numeroDocumentoPossuidor: string
    placa: string
    tipoDocumentoPossuidor: string
  }
  potencia: number
  proprietario: {
    enderecoProprietario: string
    id: number
    nomeProprietario: string
    numeroDocumentoProprietario: string
    placa: string
    tipoDocumentoProprietario: string
  }
  quantidadeEixo: string
  quantidadeRestricoesBaseEmplacamento: string
  registroAduaneiro: string
  renavam: string
  restricao: {
    anoBO: string
    dataOcorrencia: string
    dddContato: string
    historico: string
    id: number
    municipioBO: string
    naturezaOcorrencia: string
    nomeDeclarante: string
    numeroBO: string
    placa: string
    ramalContato: string
    sistema: string
    telefoneContato: string
    ufBO: string
    unidadePolicial: string
  }[]
  restricaoVeiculo1: string
  restricaoVeiculo2: string
  restricaoVeiculo3: string
  restricaoVeiculo4: string
  situacaoVeiculo: string
  tipoDocumentoFaturado: string
  tipoDocumentoProprietario: string
  tipoMontagem: string
  tipoVeiculo: string
  ufDestinoVeiculoFaturado: string
  ufEmplacamento: string
  ufFatura: string
  ufJurisdicaoVeiculo: string
  valorIPVA: number
}

export type People = {
  anoExercicioOcupacao: string
  anoObito: string
  bairro: string
  cep: string
  complementoLogradouro: string
  dataAtualizacao: string
  dataNascimento: string
  ddd: string
  id: number
  identificadorResidenteExterior: string
  indicadorEstrangeiro: string
  indicadorMoradorEstrangeiro: true
  indiceNacionalPessoas: [
    {
      id: number
      metodo: string
      qtd: number
    },
  ]
  latitudeAproximadaLocal: number
  logradouro: string
  longitudeAproximadaLocal: number
  municipio: string
  municipioNaturalidade: string
  naturezaOcupacao: string
  nomeCompleto: string
  nomeMae: string
  nomeSocial: string
  numeroCPF: string
  numeroLogradouro: string
  ocupacaoPrincipal: string
  paisNascimento: string
  paisResidencia: string
  regiaoFiscal: string
  sexo: string
  situacaoCadastral: string
  telefone: string
  tipoLogradouro: string
  tituloEleitor: string
  uf: string
  ufNaturalidade: string
}

export type Company = {
  bairro: string
  capitalSocialEmpresa: string
  cep: string
  cnaeFiscal: string
  cnaeSecundario: string
  cnpj: string
  cnpjContador: {
    classificacaoCRCContadorPF: string
    classificacaoCRCEmpresaContabil: string
    cnpjEmpresaContabil: string
    crcEmpresaContabil: string
    nomeContador: string
    numeroCPFContador: string
    numeroRegistroContadorPF: string
    tipoCRCContadorPF: string
    tipoCRCEmpresaContabil: string
    ufCRCContador: string
    ufCRCEmpresaContabil: string
  }[]
  cnpjSocio: {
    cpfRepresentanteLegal: string
    dataEntradaSociedade: string
    identificadorSocio: string
    nomeRepresentanteLegal: string
    nomeSocio: string
    numeroCPF: string
    paisSocioEstrangeiro: string
    percentualCapitalSocial: number
    qualificacaoRepresentanteLegal: string
    qualificacaoSocio: string
  }[]
  codigoCnaeFiscal: string
  codigoCnaeSecundario: string
  complementoLogradouro: string
  cpfResponsavel: string
  dataExclusaoSimples: string
  dataInicioAtividade: string
  dataOpcaoSimples: string
  dataSituacaoCadastral: string
  email: string
  fax: string
  indicadorMatrizFilial: string
  logradouro: string
  motivoSituacaoCadastral: string
  municipio: string
  naturezaJuridica: string
  nomeCidadeExterior: string
  nomeFantasia: string
  nomePais: string
  nomeResponsavel: string
  numeroLogradouro: string
  opcaoSimples: string
  porteEmpresa: string
  qualificacaoPessoaJuridicaResponsavelEmpresa: string
  razaoSocial: string
  situacaoCadastral: string
  sucessao: {
    cnpjSucedida: string
    cnpjSucessora: string
    dataOperacaoSucessora: string
    operacaoRealizadaSucessora: string
    razaoSocialSucedida: string
    razaoSocialSucessora: string
  }[]
  telefone1: string
  telefone2: string
  tipoLogradouro: string
  uf: string
}

export type DetectionGroup = {
  radars: string[]
  monitored_plate_timestamp: string
  start_time: string
  end_time: string
  location: string
  latitude: number
  longitude: number
  total_detections: number
  detections: {
    timestamp: string
    plate: string
    camera_numero: string
    lane: string
    speed: number
    count: number
  }[]
}
