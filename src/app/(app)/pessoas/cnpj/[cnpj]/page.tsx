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
import { useCompany } from '@/hooks/useQueries/useCompany'
import { useCortexRemainingCredits } from '@/hooks/useQueries/useCortexRemainingCredits'
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

  const {
    data: cortexRemainingCredits,
    isLoading: isCortexRemainingCreditsLoading,
  } = useCortexRemainingCredits()
  const { data, isLoading: isPeopleLoading, error } = useCompany({ cnpj })

  const isLoading = isPeopleLoading || isCortexRemainingCreditsLoading
  const remainingCredits = cortexRemainingCredits?.remaining_credit
  const timeUntilReset = cortexRemainingCredits?.time_until_reset

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
      {error &&
        (remainingCredits ? (
          <div className="mx-auto flex w-96 justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
            <span className="pl-6 -indent-6 text-sm text-muted-foreground">
              {`⚠️ Não foi possível retornar informações a respeito desse CPF. ${getErrorMessage(error)}`}
            </span>
          </div>
        ) : (
          <div className="mx-auto flex w-96 justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
            <span className="pl-6 -indent-6 text-sm text-muted-foreground">
              ⚠️ Não foi possível retornar informações a respeito desse CPF.
              Você atingiu o limite de requisições à API do Córtex. Você poderá
              realizar novas requisições a partir das{' '}
              <span className="font-extrabold underline">
                {format(
                  new Date(Date.now() + (timeUntilReset || 0) * 1000),
                  'HH:mm',
                )}
              </span>
              .
            </span>
          </div>
        ))}
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
