import { X } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { DestinationClusterPopup } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/destination-cluster-popup'
import { OriginClusterPopup } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/origin-cluster-popup'
import { RadarPopup } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/radar-popup'
import type {
  ClusterConnection,
  DestinationCluster,
  LocationHotspot,
  OriginCluster,
} from '@/modules/vehicle-intelligence/features/post-event/types'

/** O painel à direita do mapa com o polo aberto. */
export function PoleDetailPanel({
  origin,
  destination,
  terminal,
  connections,
  cispLimit,
  onClose,
}: {
  origin: OriginCluster | null
  destination: DestinationCluster | null
  terminal: LocationHotspot | null
  connections: ClusterConnection[]
  cispLimit: number
  onClose: () => void
}) {
  return (
    <aside
      className="pole-detail-panel"
      aria-label="Detalhes do polo selecionado"
    >
      <header className="pole-detail-panel-header">
        <span>DETALHES DO POLO</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="pole-detail-close"
          aria-label="Fechar detalhes do polo"
          onClick={onClose}
        >
          <X size={19} />
        </Button>
      </header>
      <div className="pole-detail-panel-body">
        {origin && (
          <OriginClusterPopup
            cluster={origin}
            cispLimit={cispLimit}
            connections={connections}
          />
        )}
        {destination && (
          <DestinationClusterPopup
            cluster={destination}
            cispLimit={cispLimit}
            connections={connections}
          />
        )}
        {terminal && (
          <RadarPopup
            radar={terminal}
            cispLimit={cispLimit}
            connections={connections}
          />
        )}
      </div>
    </aside>
  )
}
