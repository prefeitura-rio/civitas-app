import { X } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { DestinationPoleDetail } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/destination-pole-detail'
import { OriginPoleDetail } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/origin-pole-detail'
import { PoleList } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/pole-list'
import type {
  DestinationPole,
  OriginPole,
  PoleConnection,
  PostEventData,
} from '@/modules/vehicle-intelligence/features/post-event/types'

/** A coluna ao lado do mapa: o polo aberto ou, sem polo aberto, a lista dos polos. */
export function ExplorerSide({
  data,
  selection,
  origin,
  destination,
  connections,
  onOpenPlate,
  onSelect,
  onClose,
}: {
  data: PostEventData
  selection: string | null
  origin: OriginPole | null
  destination: DestinationPole | null
  connections: PoleConnection[]
  onOpenPlate: (plate: string) => void
  onSelect: (key: string) => void
  onClose: () => void
}) {
  return (
    <aside
      className="explorer-side"
      aria-label={selection ? 'Detalhes do polo selecionado' : 'Lista de polos'}
    >
      {selection && (origin || destination) ? (
        <>
          <header className="explorer-side-header">
            <span>DETALHES DO POLO</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar detalhes do polo (Esc)"
              title="Fechar (Esc)"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </header>
          <div className="explorer-side-body" key={selection}>
            {origin && (
              <OriginPoleDetail
                pole={origin}
                connections={connections}
                onOpenPlate={onOpenPlate}
                onSelect={onSelect}
              />
            )}
            {destination && (
              <DestinationPoleDetail
                pole={destination}
                connections={connections}
                onOpenPlate={onOpenPlate}
                onSelect={onSelect}
              />
            )}
          </div>
        </>
      ) : (
        <PoleList data={data} onSelect={onSelect} />
      )}
    </aside>
  )
}
