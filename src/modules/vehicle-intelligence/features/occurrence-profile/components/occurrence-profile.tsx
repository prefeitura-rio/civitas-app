/**
 * Perfil do RO, na ordem do que o analista confere: as placas com sinal (citada, compatível com um trecho citado,
 * Cerco, clone) das duas listas, o fato e a dinâmica, as placas citadas nela, o mapa e as listas completas de quem
 * passou junto da vítima (copassagem) e perto do local. As janelas da tela pedem o perfil de novo; o anterior fica na
 * tela enquanto o novo chega.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-profile.css'

import { useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import {
  occurrenceProfilePath,
  type WindowChoice,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { CitedPlates } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/cited-plates'
import { OccurrenceFacts } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-facts'
import { OccurrenceHeader } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-header'
import { OccurrenceMap } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-map'
import { PlateLists } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plate-lists'
import { SignalPlates } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/signal-plates'
import {
  distanceLabel,
  SIGNAL_ORDER,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrenceProfileData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'

type Found = Extract<OccurrenceProfileData, { found: true }>

export function OccurrenceProfile({
  ro,
  backLabel,
  onBack,
  onOpenPlate,
}: {
  ro: string
  backLabel: string
  onBack: () => void
  onOpenPlate: (plate: string) => void
}) {
  const [windows, setWindows] = useState<WindowChoice>({})
  const profile = useApi<OccurrenceProfileData>(
    occurrenceProfilePath(ro, windows),
    {
      delayMs: 120,
      fallbackError: 'Falha na consulta do RO',
    },
  )
  const { data, error, loading } = profile
  const choose = (field: keyof WindowChoice) => (value: number) =>
    setWindows((current) => ({ ...current, [field]: value }))

  return (
    <div className="groups-page group-profile occurrence-page">
      <OccurrenceHeader
        title={`RO ${ro}`}
        data={data?.found ? data : null}
        backLabel={backLabel}
        onBack={onBack}
      />
      {error && <ErrorBanner message={error} />}
      {!data && !error && (
        <p role="status" className="groups-status">
          Carregando o RO e as placas que passaram junto e perto…
        </p>
      )}
      {data && !data.found && (
        <section className="groups-panel">
          <p className="list-empty">{data.reason}</p>
        </section>
      )}
      {data?.found && (
        <FoundProfile
          data={data}
          loading={loading}
          choose={choose}
          onOpenPlate={onOpenPlate}
        />
      )}
    </div>
  )
}

function FoundProfile({
  data,
  loading,
  choose,
  onOpenPlate,
}: {
  data: Found
  loading: boolean
  choose: (field: keyof WindowChoice) => (value: number) => void
  onOpenPlate: (plate: string) => void
}) {
  const { parameters } = data
  const copassagem = data.strategy === 'copassagem'
  return (
    <>
      <SignalPlates data={data} loading={loading} onOpenPlate={onOpenPlate} />
      <OccurrenceFacts data={data} onOpenPlate={onOpenPlate} />
      <CitedPlates data={data} onOpenPlate={onOpenPlate} />
      <section className="groups-panel">
        <div className="panel-head">
          <div>
            <h2>Onde passaram</h2>
            <p>
              O local do fato e o raio de{' '}
              {distanceLabel(parameters.radius_meters)}, os pontos de coleta
              onde as placas das listas foram lidas
              {copassagem ? ', as passagens da vítima perto do horário' : ''} e
              a leitura mais próxima de cada placa citada neste RO. Clique num
              ponto para ver as placas.
            </p>
          </div>
        </div>
        <OccurrenceMap data={data} onOpenPlate={onOpenPlate} />
      </section>
      <PlateLists
        data={data}
        loading={loading}
        choose={choose}
        onOpenPlate={onOpenPlate}
      />
      <section className="groups-method">
        <div>
          <h2>Critérios</h2>
          <p>
            Detecções de {formatDate(data.detection_period.start)} a{' '}
            {formatDate(data.detection_period.end)}.
          </p>
        </div>
        <dl>
          <div>
            <dt>Sinal</dt>
            <dd>{data.methodology.signal}</dd>
          </div>
          <div>
            <dt>Ordem</dt>
            <dd>
              Com sinal primeiro, na ordem: {SIGNAL_ORDER}; depois, pela força.
              Cada lista mostra até 300 placas, então as com sinal entram todas.
              O título de uma coluna reordena a lista por ela.
            </dd>
          </div>
          <div>
            <dt>Força</dt>
            <dd>{data.methodology.strength}</dd>
          </div>
          <div>
            <dt>Perto do local</dt>
            <dd>{data.methodology.nearby_note}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}
