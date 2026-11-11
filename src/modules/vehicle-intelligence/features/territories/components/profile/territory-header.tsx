import { ArrowLeft } from 'lucide-react'

import { factionColor } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import type { TerritoryProfileData } from '@/modules/vehicle-intelligence/features/territories/types'
import { ITEMS } from '@/modules/vehicle-intelligence/features/territories/vocabulary'

/** O cabeçalho do perfil: voltar, o complexo e, com o perfil pronto, a facção e se ele fica na região do recorte. */
export function TerritoryHeader({
  complex,
  data,
  regionName,
  onBack,
}: {
  complex: string
  data: TerritoryProfileData | null
  regionName: string
  onBack: () => void
}) {
  return (
    <section className="group-profile-head territory-head">
      <button type="button" className="group-back" onClick={onBack}>
        <ArrowLeft size={15} />
        Territórios
      </button>
      <h2>{complex}</h2>
      {data?.ready && (
        <div className="territory-subtitle">
          <span>
            <i
              style={{ background: factionColor(data.faction) }}
              aria-hidden="true"
            />
            {data.faction ?? 'facção não informada'}
          </span>
          <span>
            {data.in_region
              ? `Na ${regionName}: tende a ser moradia de ${ITEMS} locais`
              : `Fora da ${regionName} (${data.region ?? 'fora do município'}): base de origem`}
          </span>
        </div>
      )}
    </section>
  )
}
