import { authorCitationNote } from '@/modules/vehicle-intelligence/components/plate/author-citations'
import { CercoBadge } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { PlateOriginBadge } from '@/modules/vehicle-intelligence/components/plate/plate-origin-badge'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import {
  isMotorcycleType,
  vehicleDetailsLabel,
  vehicleTypeLabel,
  vehicleTypeSourceLabel,
} from '@/modules/vehicle-intelligence/lib/vehicles'
import type { CorrelationRankingRow } from '@/modules/vehicle-intelligence/types/domain'

/** Os campos de placa que as etiquetas leem (ranking, inspetor do grafo e busca). */
export type SignalFields = Pick<
  CorrelationRankingRow,
  | 'plate'
  | 'is_clone_suspect'
  | 'is_clone_confirmed'
  | 'clone_days'
  | 'clone_temperature_score'
  | 'clone_temperature'
  | 'is_active_taxi'
> &
  Partial<
    Pick<
      CorrelationRankingRow,
      | 'is_bus'
      | 'is_new_plate'
      | 'author_citations'
      | 'vehicle_type'
      | 'vehicle_type_share'
      | 'vehicle_type_source'
      | 'vehicle_color'
      | 'vehicle_model'
      | 'manufacture_year'
      | 'model_year'
      | 'dd_reports'
      | 'dd_last_report'
      | 'dd_last_subject'
    >
  >

/** Etiquetas da placa (ranking e inspetor do grafo): aparecem conforme os campos que o registro traz. A UF de origem
 * vem como etiqueta onde não há a coluna "Modelo e origem" (`origem`; o ranking a desliga). */
export function PlateSignals({
  row,
  citationNote,
  origem = true,
}: {
  row: SignalFields
  citationNote?: string
  origem?: boolean
}) {
  const cited = citationNote ?? authorCitationNote(row.author_citations)
  const vehicle = vehicleTypeLabel(row.vehicle_type, row.vehicle_type_share)
  return (
    <div className="plate-signals">
      {origem && <PlateOriginBadge plate={row.plate} />}
      {cited && (
        <span className="signal-chip signal-cited" title={cited}>
          <i aria-hidden="true" />
          CITADA NA DINÂMICA
        </span>
      )}
      {row.is_new_plate === false && (
        <span className="signal-chip signal-known">
          <i aria-hidden="true" />
          Também vítima
        </span>
      )}
      {row.is_clone_suspect && (
        <span
          className={`signal-chip ${row.is_clone_confirmed ? 'signal-clone-confirmed' : 'signal-clone-suspect'}`}
          title={`Busca de Clones Reais · ${row.is_clone_confirmed ? 'clone confirmado' : 'suspeita'} · ${row.clone_days ?? 0} dias · temperatura ${row.clone_temperature_score ?? 0}`}
        >
          <i aria-hidden="true" />
          {row.is_clone_confirmed ? 'Clone confirmado' : 'Suspeita de clone'}
          {row.clone_temperature ? ` · ${row.clone_temperature}` : ''}
        </span>
      )}
      <CercoBadge plate={row.plate} className="signal-chip signal-cerco">
        <i aria-hidden="true" />
        CERCO
      </CercoBadge>
      {row.dd_reports ? (
        <span
          className="signal-chip signal-dd"
          title={`Citada ${row.dd_reports === 1 ? 'numa denúncia' : `em ${row.dd_reports} denúncias`} do Disque Denúncia${row.dd_last_report ? `, a última em ${formatDate(row.dd_last_report)}` : ''}${row.dd_last_subject ? ` (${titleCase(row.dd_last_subject.toLowerCase())})` : ''}. Denúncia anônima, não verificada.`}
        >
          <i aria-hidden="true" />
          DISQUE DENÚNCIA{row.dd_reports > 1 ? ` · ${row.dd_reports}` : ''}
        </span>
      ) : null}
      {row.is_active_taxi && (
        <span className="signal-chip signal-taxi">
          <i aria-hidden="true" />
          Táxi ativo
        </span>
      )}
      {row.is_bus && (
        <span
          className="signal-chip signal-bus"
          title="Ônibus pelo cadastro PRF, pela lista das câmeras ou pelo tipo mais lido; não é da frota municipal, que fica fora das correlatas."
        >
          <i aria-hidden="true" />
          Ônibus
        </span>
      )}
      {vehicle && (
        <span
          className={`signal-chip ${isMotorcycleType(row.vehicle_type) ? 'signal-moto' : 'signal-vehicle'}`}
          title={[
            vehicleTypeSourceLabel(row.vehicle_type_source),
            vehicleDetailsLabel(row),
          ]
            .filter(Boolean)
            .join(' · ')}
        >
          {isMotorcycleType(row.vehicle_type) && <i aria-hidden="true" />}
          {vehicle}
        </span>
      )}
    </div>
  )
}
