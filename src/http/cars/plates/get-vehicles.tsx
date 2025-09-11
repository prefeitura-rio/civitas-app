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
//     mesFabricacaoVeiculo: 'JUNHO',
//     municipioPlaca: 'SAO GONCALO',
//     nomeArrendatario: '',
//     nomePossuidor: 'ALLAN RIBEIRO DO NASCIMENTO',
//     nomeProprietario: 'ALLAN RIBEIRO DO NASCIMENTO',

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
