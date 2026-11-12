import type { GraphDisplay } from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import { GRAPH } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** Quantas âncoras o desenho mostra, o que tem prioridade e o aviso do limite. */
export function GraphDisplaySummary({
  display,
  selectedPlates,
  candidateByPlate,
}: {
  display: GraphDisplay
  selectedPlates: string[]
  candidateByPlate: ReadonlyMap<string, unknown>
}) {
  const anchors = GRAPH.anchor.plural
  return (
    <p className="graph-display-summary" aria-live="polite">
      Exibindo {display.visibleEvents} de {formatNumber(display.totalEvents)}{' '}
      {anchors} {GRAPH.anchor.linked} às placas deste grafo.
      {selectedPlates.some((plate) => candidateByPlate.has(plate))
        ? ` As ligações ${selectedPlates.length > 1 ? 'das placas selecionadas' : 'da placa selecionada'} têm prioridade.`
        : ` ${anchors.charAt(0).toUpperCase() + anchors.slice(1)} que conectam mais placas têm prioridade.`}
      {display.hiddenEdges > 0 &&
        ' O ranking e o perfil mantêm todas as correlações; este limite vale apenas para o desenho.'}
      {' Ctrl+clique (ou Shift+clique) soma placas à seleção.'}
    </p>
  )
}
