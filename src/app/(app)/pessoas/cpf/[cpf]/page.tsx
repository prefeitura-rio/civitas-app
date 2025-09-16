'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { format } from 'date-fns'
import { Briefcase, Calendar, Flag, Home, Phone, User } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { config } from '@/config'
import { useCortexRemainingCredits } from '@/hooks/useQueries/useCortexRemainingCredits'
import { usePeople } from '@/hooks/useQueries/usePeople'
import { searchAddress } from '@/http/mapbox/search-address'
import { dateConfig } from '@/lib/date-config'

import { getErrorMessage } from '../../components/get-error-message'

interface PessoaProps {
  params: {
    cpf: string
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

export default function Pessoa({ params: { cpf } }: PessoaProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const {
    data: cortexRemainingCredits,
    isLoading: isCortexRemainingCreditsLoading,
  } = useCortexRemainingCredits()
  const { data, isLoading: isPeopleLoading, error } = usePeople({ cpf })

  const isLoading = isPeopleLoading || isCortexRemainingCreditsLoading
  const remainingCredits = cortexRemainingCredits?.remaining_credit
  const timeUntilReset = cortexRemainingCredits?.time_until_reset

  useEffect(() => {
    async function initializeMap() {
      if (!mapContainerRef.current || !data) return

      const address = await searchAddress(
        `${data.logradouro} ${data.numeroLogradouro} ${data.bairro} ${data.municipio} ${data.uf}`,
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
  }, [mapContainerRef.current])

  return (
    <div className="page-content mx-auto space-y-6 overflow-y-scroll p-4">
      <h1 className="mb-6 text-center text-3xl font-bold">Pessoa Física</h1>
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
                  <User className="mr-2" /> Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem label="Nome Completo" value={data.nomeCompleto} />
                <InfoItem label="Nome Social" value={data.nomeSocial} />
                <InfoItem label="CPF" value={data.numeroCPF} />
                <InfoItem
                  label="Data de Nascimento"
                  value={format(new Date(data.dataNascimento), 'dd/MM/yyyy')}
                />
                <InfoItem label="Sexo" value={data.sexo} />
                <InfoItem label="Nome da Mãe" value={data.nomeMae} />
                <InfoItem
                  label="Título de Eleitor"
                  value={data.tituloEleitor}
                />
                <InfoItem
                  label="Situação Cadastral"
                  value={data.situacaoCadastral}
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
                <InfoItem
                  label="Telefone"
                  value={`(${data.ddd}) ${data.telefone}`}
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2" /> Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-x-4 gap-y-0">
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
              <InfoItem
                label="País de Residência"
                value={data.paisResidencia}
              />
              <div
                className="relative mt-6 aspect-video w-full rounded-lg"
                ref={mapContainerRef}
              ></div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2" /> Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem
                  label="Ocupação Principal"
                  value={data.ocupacaoPrincipal}
                />
                <InfoItem
                  label="Natureza da Ocupação"
                  value={data.naturezaOcupacao}
                />
                <InfoItem
                  label="Ano de Exercício"
                  value={data.anoExercicioOcupacao}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" /> Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <InfoItem
                  label="Data de Atualização"
                  value={format(
                    new Date(data.dataAtualizacao),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: dateConfig.locale },
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="mr-2" /> Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <InfoItem
                label="País de Nascimento"
                value={data.paisNascimento}
              />
              <InfoItem
                label="Município de Naturalidade"
                value={data.municipioNaturalidade}
              />
              <InfoItem
                label="UF de Naturalidade"
                value={data.ufNaturalidade}
              />
              <InfoItem label="Região Fiscal" value={data.regiaoFiscal} />
              <InfoItem
                label="Residente no Exterior"
                value={
                  data.identificadorResidenteExterior === 'N' ? 'Não' : 'Sim'
                }
              />
              <InfoItem
                label="Estrangeiro"
                value={data.indicadorEstrangeiro === 'N' ? 'Não' : 'Sim'}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
