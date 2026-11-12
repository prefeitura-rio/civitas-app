/**
 * A rota `/occurrence/<chave>`: um RO abre o perfil; uma placa vítima lista os ROs dela (com um só, o perfil abre
 * direto).
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-profile.css'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { occurrenceSearchPath } from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { OccurrenceHeader } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-header'
import { OccurrenceProfile } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-profile'
import { OccurrenceResults } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-results'
import { keyKind } from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrenceSearchData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

type Props = {
  occurrenceKey: string
  onBack: () => void
  onOpenOccurrence: (ro: string) => void
  onOpenPlate: (plate: string) => void
}

function VictimPlateOccurrences({
  occurrenceKey: plate,
  onBack,
  onOpenOccurrence,
  onOpenPlate,
}: Props) {
  const path = occurrenceSearchPath(plate)
  const search = useApi<OccurrenceSearchData>(path, {
    fallbackError: 'Falha na busca dos ROs da placa',
  })
  const data = search.dataPath === path ? search.data : null
  const results =
    data?.results.filter((item) => item.matched_by === 'victim_plate') ?? []
  if (results.length === 1)
    return (
      <OccurrenceProfile
        ro={results[0].ro}
        backLabel="Voltar"
        onBack={onBack}
        onOpenPlate={onOpenPlate}
      />
    )
  return (
    <div className="groups-page group-profile occurrence-page">
      <OccurrenceHeader
        title={`Placa vítima ${plate}`}
        data={null}
        backLabel="Voltar"
        onBack={onBack}
      />
      {search.error && <ErrorBanner message={search.error} />}
      <section className="groups-panel">
        <div className="panel-head">
          <div>
            <h2>
              {data
                ? `Placa vítima ${plate} em ${formatNumber(results.length)} ${results.length === 1 ? 'RO' : 'ROs'}`
                : `Buscando os ROs da placa ${plate}…`}
            </h2>
            <p>
              Escolha o RO para ver quem passou junto da vítima e perto do
              local.
            </p>
          </div>
        </div>
        {data &&
          (results.length ? (
            <OccurrenceResults results={results} onOpen={onOpenOccurrence} />
          ) : (
            <p className="list-empty">
              A placa {plate} não é vítima de nenhum RO do município do Rio
              neste recorte.
            </p>
          ))}
      </section>
    </div>
  )
}

export function OccurrencePage(props: Props) {
  if (keyKind(props.occurrenceKey) === 'plate')
    return <VictimPlateOccurrences {...props} />
  return (
    <OccurrenceProfile
      key={props.occurrenceKey}
      ro={props.occurrenceKey}
      backLabel="Voltar"
      onBack={props.onBack}
      onOpenPlate={props.onOpenPlate}
    />
  )
}
