'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { format } from 'date-fns'
import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  GitMerge,
  MapPin,
  Phone,
  User,
  Users,
} from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { config } from '@/config'
import { useCompany } from '@/hooks/use-queries/use-company'
import { searchAddress } from '@/http/mapbox/search-address'

import { getErrorMessage } from '../../components/get-error-message'

interface PessoaProps {
  params: {
    cnpj: string
  }
}

const InfoItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | null
}) => (
  <div className="flex items-center justify-between border-b py-2 last:border-b-0">
    <span className="font-medium">{label}:</span>
    <span>{value || 'N/A'}</span>
  </div>
)

const ListItem = ({ items }: { items: Record<string, string | number>[] }) => (
  <ul className="space-y-2">
    {items.map((item, index) =>
      Object.entries(item).map(([key, value]) => (
        <li key={index} className="mb-2 flex justify-between">
          <span className="font-medium">{key}: </span>
          <span>{value}</span>
        </li>
      )),
    )}
  </ul>
)

export default function Pessoa({ params: { cnpj } }: PessoaProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useCompany({ cnpj })

  // console.log(cnpj)
  // const error = null
  // const isLoading = false
  // const data = {
  //   bairro: 'Centro',
  //   capitalSocialEmpresa: '1000000',
  //   cep: '12345-678',
  //   cnaeFiscal: '6201-5/00',
  //   cnaeSecundario: '6202-3/00',
  //   cnpj: '12.345.678/0001-99',
  //   cnpjContador: [
  //     {
  //       classificacaoCRCContadorPF: 'Principal',
  //       classificacaoCRCEmpresaContabil: 'Principal',
  //       cnpjEmpresaContabil: '12.345.678/0001-99',
  //       crcEmpresaContabil: '123456/O-0',
  //       nomeContador: 'João da Silva',
  //       numeroCPFContador: '123.456.789-00',
  //       numeroRegistroContadorPF: '123456/O-0',
  //       tipoCRCContadorPF: 'Principal',
  //       tipoCRCEmpresaContabil: 'Principal',
  //       ufCRCContador: 'SP',
  //       ufCRCEmpresaContabil: 'SP',
  //     },
  //   ],
  //   cnpjSocio: [
  //     {
  //       cpfRepresentanteLegal: '123.456.789-00',
  //       dataEntradaSociedade: '2020-01-01',
  //       identificadorSocio: '1',
  //       nomeRepresentanteLegal: 'Maria da Silva',
  //       nomeSocio: 'Empresa X',
  //       numeroCPF: '123.456.789-00',
  //       paisSocioEstrangeiro: 'Brasil',
  //       percentualCapitalSocial: 50,
  //       qualificacaoRepresentanteLegal: 'Administrador',
  //       qualificacaoSocio: 'Sócio',
  //     },
  //   ],
  //   codigoCnaeFiscal: '6201-5/00',
  //   codigoCnaeSecundario: '6202-3/00',
  //   complementoLogradouro: 'Apto 101',
  //   cpfResponsavel: '123.456.789-00',
  //   dataExclusaoSimples: '2021-01-01',
  //   dataInicioAtividade: '2010-01-01',
  //   dataOpcaoSimples: '2010-01-01',
  //   dataSituacaoCadastral: '2022-01-01',
  //   email: 'empresa@example.com',
  //   fax: '11 1234-5678',
  //   indicadorMatrizFilial: 'Matriz',
  //   logradouro: 'Rua Mariz e Barros',
  //   motivoSituacaoCadastral: 'Ativa',
  //   municipio: 'São Paulo',
  //   naturezaJuridica: 'Sociedade Limitada',
  //   nomeCidadeExterior: 'N/A',
  //   nomeFantasia: 'Empresa X',
  //   nomePais: 'Brasil',
  //   nomeResponsavel: 'João da Silva',
  //   numeroLogradouro: '821',
  //   opcaoSimples: 'Sim',
  //   porteEmpresa: 'Pequena',
  //   qualificacaoPessoaJuridicaResponsavelEmpresa: 'Administrador',
  //   razaoSocial: 'Empresa X Ltda',
  //   situacaoCadastral: 'Ativa',
  //   sucessao: [
  //     {
  //       cnpjSucedida: '12.345.678/0001-99',
  //       cnpjSucessora: '98.765.432/0001-99',
  //       dataOperacaoSucessora: '2021-01-01',
  //       operacaoRealizadaSucessora: 'Fusão',
  //       razaoSocialSucedida: 'Empresa Y Ltda',
  //       razaoSocialSucessora: 'Empresa Z Ltda',
  //     },
  //   ],
  //   telefone1: '11 1234-5678',
  //   telefone2: '11 8765-4321',
  //   tipoLogradouro: 'Rua',
  //   uf: 'SP',
  // }

  useEffect(() => {
    async function initializeMap() {
      if (!mapContainerRef.current || !data) return

      const address = await searchAddress(
        `${data.logradouro} ${data.numeroLogradouro} ${data.bairro}`,
      )

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: address.features.at(0)?.geometry.coordinates,
        zoom: 12,
      })

      mapRef.current.addControl(new mapboxgl.NavigationControl())

      if (!address.features.at(0)) return

      new mapboxgl.Marker()
        .setLngLat(address.features[0].geometry.coordinates)
        .addTo(mapRef.current)
    }

    if (!mapContainerRef.current) return

    mapboxgl.accessToken = config.mapboxAccessToken

    initializeMap()
  }, [mapContainerRef.current, data])

  return (
    <div className="page-content mx-auto space-y-6 overflow-y-scroll p-4">
      <h1 className="mb-6 text-center text-3xl font-bold">Pessoa Jurídica</h1>

      {isLoading && (
        <div className="flex justify-center">
          <Spinner className="size-10" />
        </div>
      )}
      {error && (
        <div className="mx-auto flex w-96 justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
          <span className="pl-6 -indent-6 text-sm text-muted-foreground">
            {`⚠️ Não foi possível retornar informações a respeito desse CNPJ. ${getErrorMessage(error)}`}
          </span>
        </div>
      )}
      {data && (
        <div className="grid grid-cols-2 gap-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2" /> Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem label="Razão Social" value={data.razaoSocial} />
                <InfoItem label="Nome Fantasia" value={data.nomeFantasia} />
                <InfoItem label="CNPJ" value={data.cnpj} />
                <InfoItem
                  label="Natureza Jurídica"
                  value={data.naturezaJuridica}
                />
                <InfoItem label="Porte da Empresa" value={data.porteEmpresa} />
                <InfoItem
                  label="Situação Cadastral"
                  value={data.situacaoCadastral}
                />
                <InfoItem
                  label="Data da Situação Cadastral"
                  value={format(
                    new Date(data.dataSituacaoCadastral),
                    'dd/MM/yyyy',
                  )}
                />
                <InfoItem
                  label="Motivo da Situação Cadastral"
                  value={data.motivoSituacaoCadastral}
                />
                <InfoItem
                  label="Data de Início da Atividade"
                  value={format(
                    new Date(data.dataInicioAtividade),
                    'dd/MM/yyyy',
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2" /> Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem label="Telefone 1" value={data.telefone1} />
                <InfoItem label="Telefone 2" value={data.telefone2} />
                <InfoItem label="Fax" value={data.fax} />
                <InfoItem label="Email" value={data.email} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2" /> Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="Logradouro"
                value={`${data.tipoLogradouro} ${data.logradouro}, ${data.numeroLogradouro}`}
              />
              <InfoItem
                label="Complemento"
                value={data.complementoLogradouro}
              />
              <InfoItem label="Bairro" value={data.bairro} />
              <InfoItem label="Município" value={data.municipio} />
              <InfoItem label="UF" value={data.uf} />
              <InfoItem label="CEP" value={data.cep} />
              <InfoItem label="País" value={data.nomePais} />
              <div
                className="relative mt-6 aspect-video w-full rounded-lg"
                ref={mapContainerRef}
              ></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2" /> Atividade Econômica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="CNAE Fiscal"
                value={`${data.codigoCnaeFiscal} - ${data.cnaeFiscal}`}
              />
              <InfoItem
                label="CNAE Secundário"
                value={`${data.codigoCnaeSecundario} - ${data.cnaeSecundario}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2" /> Datas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="Data de Início da Atividade"
                value={format(new Date(data.dataInicioAtividade), 'dd/MM/yyyy')}
              />
              <InfoItem
                label="Data de Opção pelo Simples"
                value={format(new Date(data.dataOpcaoSimples), 'dd/MM/yyyy')}
              />
              <InfoItem
                label="Data de Exclusão do Simples"
                value={format(new Date(data.dataExclusaoSimples), 'dd/MM/yyyy')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2" /> Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="Capital Social"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(data.capitalSocialEmpresa))}
              />
              <InfoItem label="Opção pelo Simples" value={data.opcaoSimples} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" /> Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="Nome do Responsável"
                value={data.nomeResponsavel}
              />
              <InfoItem
                label="CPF do Responsável"
                value={data.cpfResponsavel}
              />
              <InfoItem
                label="Qualificação"
                value={data.qualificacaoPessoaJuridicaResponsavelEmpresa}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" /> Sócios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListItem items={data.cnpjSocio} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" /> Contador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListItem items={data.cnpjContador} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitMerge className="mr-2" /> Sucessão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ListItem items={data.sucessao} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
