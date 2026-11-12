import {
  Network as NetworkIcon,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import type { RefObject } from 'react'
import type { Network } from 'vis-network'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/vehicle-intelligence/components/ui/select'
import { VISIBLE_RO_OPTIONS } from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import { GRAPH } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import type { SelectMode } from '@/modules/vehicle-intelligence/features/correlations/selection'

/** Limite de âncoras no desenho, Centralizar, Reorganizar, movimento, limpar a seleção e o estado da rede. */
export function GraphControls({
  roLimit,
  setRoLimit,
  networkRef,
  redrawGraph,
  physicsEnabled,
  prefersReducedMotion,
  togglePhysics,
  selectedId,
  selectedPlates,
  onSelect,
  status,
}: {
  roLimit: number
  setRoLimit: (limit: number) => void
  networkRef: RefObject<Network>
  redrawGraph: () => void
  physicsEnabled: boolean
  prefersReducedMotion: boolean
  togglePhysics: () => void
  selectedId: string | null
  selectedPlates: string[]
  onSelect: (plate: string | null, mode?: SelectMode) => void
  status: string
}) {
  const anchors = GRAPH.anchor.plural
  return (
    <div className="force-graph-controls">
      <div className="graph-ro-limit">
        <label htmlFor="graph-ro-limit">
          {anchors.charAt(0).toUpperCase() + anchors.slice(1)} no desenho
        </label>
        <Select
          value={String(roLimit)}
          onValueChange={(value) => setRoLimit(Number(value))}
        >
          <SelectTrigger id="graph-ro-limit" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBLE_RO_OPTIONS.map((limit) => (
              <SelectItem key={limit} value={String(limit)}>
                Até {limit} {anchors}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className="graph-command-group"
        role="group"
        aria-label="Comandos do grafo"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="graph-command"
          onClick={() => networkRef.current?.fit()}
        >
          <RotateCcw size={16} />
          Centralizar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="graph-command"
          onClick={redrawGraph}
        >
          <RefreshCw size={16} />
          Reorganizar grafo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`graph-command ${physicsEnabled ? 'active' : ''}`}
          aria-pressed={physicsEnabled}
          disabled={prefersReducedMotion}
          onClick={togglePhysics}
        >
          {physicsEnabled ? <Pause size={16} /> : <Play size={16} />}
          <span>
            {prefersReducedMotion
              ? 'Movimento reduzido'
              : physicsEnabled
                ? 'Pausar movimento'
                : 'Ativar movimento'}
          </span>
        </Button>
        {selectedId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(null)}
          >
            {selectedPlates.length > 1
              ? `Limpar seleção (${selectedPlates.length})`
              : 'Limpar seleção'}
          </Button>
        )}
      </div>
      <span className="network-status">
        <NetworkIcon size={15} />
        {status}
      </span>
    </div>
  )
}
