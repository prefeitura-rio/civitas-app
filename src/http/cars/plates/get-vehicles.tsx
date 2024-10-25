// import { config } from '@/config'
import { api } from '@/lib/api'
import type { Vehicle } from '@/models/entities'

// function getDummyVehicles(plates: string[]) {
//   const dummyVehicle = {
//     anoFabricacao: '2020',
//     anoModelo: '2021',
//     anoUltimoLicenciamnento: 2023,
//     arrendatario: {
//       enderecoArrendatario: '   -  - ,  -  -  - CEP:        0',
//       id: 108242960,
//       nomeArrendatario: '',
//       numeroDocumentoArrendatario: '',
//       placa: 'RJX1A61',
//       tipoDocumentoArrendatario: '',
//     },
//     capacidadeMaximaCarga: '0.0',
//     capacidadeMaximaTracao: '1.6',
//     carroceria: 'NAO APLICAVEL',
//     categoria: 'PARTICULAR',
//     chassi: '9BGEP76B0MB111405',
//     cilindrada: 1199,
//     codigoCarroceira: 999,
//     codigoCategoria: 1,
//     codigoCor: 11,
//     codigoEspecie: 1,
//     codigoMarcaModelo: 149037,
//     codigoMunicipioEmplacamento: '5897',
//     codigoOrgaoSRF: '0      ',
//     codigoSegurancaCRV: '24731883568',
//     codigoTipoVeiculo: 6,
//     combustivel: 'ALCOOL/GASOLINA',
//     cor: 'PRETA',
//     dataAtualizacaoAlarme: '2024-09-06',
//     dataAtualizacaoRouboFurto: '2023-08-30',
//     dataAtualizacaoVeiculo: '2023-06-15',
//     dataDeclaracaoImportacao: '1900-01-01',
//     dataEmissaoCRLV: '2023-06-15T15:02:00',
//     dataEmissaoUltimoCRV: '1900-01-01',
//     dataEmplacamento: '2020-08-20T00:00:00',
//     dataHoraAtualizacaoVeiculo: '2023-06-15T15:02:00',
//     dataLimiteRestricaoTributaria: '1900-01-01',
//     dataPreCadastro: '2020-07-01',
//     dataReplicacao: '2023-06-15T15:02:00',
//     descricaoOrgaoRegiaoFiscal: 'REGIAO FISCAL NAO INFORMADA',
//     especie: 'PASSAGEIRO',
//     flagAtivo: true,
//     grupoVeiculo: 'AUTOS',
//     id: 108242960,
//     identificadorUnicoVeiculo: '2018301142889BG1849',
//     indicadorRemarcacaoChassi: true,
//     indicadorVeiculoLicenciadoCirculacao: '',
//     indicadorVeiculoNacional: true,
//     indiceNacionalVeiculos: [
//       {
//         id: 1,
//         metodo: 'BIN ROUBO/FURTO',
//         qtd: 0,
//       },
//       {
//         id: 2,
//         metodo: 'BOPC',
//         qtd: 0,
//       },
//       {
//         id: 3,
//         metodo: 'HISTORICO DE TRANSFERENCIA DE MUNICIPIO',
//         qtd: 0,
//       },
//       {
//         id: 4,
//         metodo: 'HISTORICO DE TRANSFERENCIA DE PROPRIETARIO',
//         qtd: 2,
//       },
//       {
//         id: 5,
//         metodo: 'MOVIMENTOS',
//         qtd: 3798,
//       },
//       {
//         id: 6,
//         metodo: 'OCORRENCIAS',
//         qtd: 0,
//       },
//       {
//         id: 7,
//         metodo: 'RENAJUD',
//         qtd: 0,
//       },
//       {
//         id: 8,
//         metodo: 'RESTRICOES ADMINISTRATIVAS',
//         qtd: 18,
//       },
//     ],
//     lotacao: '5',
//     marcaModelo: 'CHEV/TRACKER 12T A PR',
//     mesAnoValidadeLicenciamento: 92023,
//     mesFabricacaoVeiculo: 'JUNHO',
//     municipioPlaca: 'SAO GONCALO',
//     nomeArrendatario: '',
//     nomePossuidor: 'ALLAN RIBEIRO DO NASCIMENTO',
//     nomeProprietario: 'ALLAN RIBEIRO DO NASCIMENTO',
//     numeroCRV: '233745810724',
//     numeroCaixaCambio: 'R9352B8136',
//     numeroCarroceria: '',
//     numeroDeclaracaoImportacao: '0',
//     numeroEixoAuxiliar: '',
//     numeroEixoTraseiro: '',
//     numeroIdentificacaoFaturado: '30006027000152',
//     numeroIdentificacaoImportador: '',
//     numeroLicencaUsoConfiguracaoVeiculosMotor: '68892',
//     numeroMotor: 'L4K*200804865*',
//     numeroProcessoImportacao: '0',
//     numeroSequenciaCRV: '374581072',
//     numeroTipoCRLV: '000000000000',
//     numeroViaCRLV: 1,
//     numeroViaCRV: 1,
//     origemPossuidor: '',
//     paisTransferenciaVeiculo: '',
//     pesoBrutoTotal: '1.6',
//     placa: 'RJX1A61',
//     placaPreMercosul: '',
//     possuidor: {
//       enderecoPossuidor:
//         'RJ - SAO GONCALO - RUA LUCIO T FETEIRA, 151 -  -  - CEP: 24415001',
//       id: 108242960,
//       nomePossuidor: 'ALLAN RIBEIRO DO NASCIMENTO',
//       numeroDocumentoPossuidor: '05488665706',
//       placa: 'RJX1A61',
//       tipoDocumentoPossuidor: 'CPF',
//     },
//     potencia: 133,
//     proprietario: {
//       enderecoProprietario:
//         'RJ - SAO GONCALO - RUA LUCIO T FETEIRA, 151 -  -  - CEP: 24415001',
//       id: 108242960,
//       nomeProprietario: 'ALLAN RIBEIRO DO NASCIMENTO',
//       numeroDocumentoProprietario: '05488665706',
//       placa: 'RJX1A61',
//       tipoDocumentoProprietario: 'CPF',
//     },
//     quantidadeEixo: '0',
//     quantidadeRestricoesBaseEmplacamento: '18',
//     registroAduaneiro: '0',
//     renavam: '01235880289',
//     restricao: [],
//     restricaoVeiculo1: 'ALIENACAO FIDUCIARIA',
//     restricaoVeiculo2: '',
//     restricaoVeiculo3: '',
//     restricaoVeiculo4: '',
//     situacaoVeiculo: '',
//     tipoDocumentoFaturado: 'CNPJ',
//     tipoDocumentoProprietario: 'CPF',
//     tipoMontagem: 'MONTAGEM ACABADA',
//     tipoVeiculo: 'AUTOMOVEL',
//     ufDestinoVeiculoFaturado: 'RJ',
//     ufEmplacamento: 'RJ',
//     ufFatura: 'RJ',
//     ufJurisdicaoVeiculo: 'RJ',
//     valorIPVA: 0,
//   } as Vehicle

//   const variants = [
//     { cor: 'PRETA', anoModelo: '2021', marcaModelo: 'CHEV/TRACKER 12T A PR' },
//     { cor: 'AZUL', anoModelo: '2021', marcaModelo: 'CHEV/TRACKER 12T A PR' },
//     {
//       cor: 'BRANCA',
//       anoModelo: '2021',
//       marcaModelo: 'CHEV/TRACKER 12T A PR',
//     },

//     { cor: 'PRETA', anoModelo: '2022', marcaModelo: 'FORD/ECOSPORT' },
//     { cor: 'AZUL', anoModelo: '2022', marcaModelo: 'FORD/ECOSPORT' },
//     { cor: 'BRANCA', anoModelo: '2022', marcaModelo: 'FORD/ECOSPORT' },

//     { cor: 'PRETA', anoModelo: '2023', marcaModelo: 'HONDA/HR-V' },
//     { cor: 'AZUL', anoModelo: '2023', marcaModelo: 'HONDA/HR-V' },
//     { cor: 'BRANCA', anoModelo: '2023', marcaModelo: 'HONDA/HR-V' },
//   ]

//   const dummyVehicles: Vehicle[] = plates.map((plate, index) => {
//     const variant = variants[index % variants.length]
//     return {
//       ...dummyVehicle,
//       placa: plate,
//       cor: variant.cor,
//       anoModelo: variant.anoModelo,
//       marcaModelo: variant.marcaModelo,
//     }
//   })

//   return dummyVehicles
// }

export async function getVehicles(plates: string[]) {
  // Não utiliza a api do córtex em ambiente de staging
  // if (config.apiUrl.includes('staging')) {
  //   const dummyData = getDummyVehicles(plates)
  //   return dummyData
  // }

  const response = await api.post<Vehicle[]>('/cars/plates', {
    plates,
    raise_for_errors: false,
  })

  return response.data.filter((v) => !!v)
}
