// import { config } from '@/config'
import { api } from '@/lib/api'
import type { Vehicle } from '@/models/entities'

// function getDummyVehicle(plate: string) {
//   const dummyVehicle = {
//     anoFabricacao: '2020',
//     anoModelo: '2021',
//     anoUltimoLicenciamnento: 2023,
//     arrendatario: {
//       enderecoArrendatario: '   -  - ,  -  -  - CEP:        0',
//       id: 108242960,
//       nomeArrendatario: '',
//       numeroDocumentoArrendatario: '',
//       placa: plate,
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
export async function getVehicle(plate: string) {

  const response = await api.get<Vehicle>(`/cars/plate/${plate}`)
  return response.data
}
