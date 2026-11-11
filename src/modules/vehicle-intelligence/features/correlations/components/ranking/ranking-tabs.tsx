import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/modules/vehicle-intelligence/components/ui/tabs'
import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import type { CorrelationRankingView } from '@/modules/vehicle-intelligence/types/domain'

/** As vistas do ranking; passar o mouse ou focar uma aba já pré-carrega a consulta dela. */
export function RankingTabs({
  view,
  onChange,
  onPrepare,
}: {
  view: CorrelationRankingView
  onChange: (view: CorrelationRankingView) => void
  onPrepare: (view: CorrelationRankingView) => void
}) {
  return (
    <Tabs
      value={view}
      onValueChange={(next) => onChange(next as CorrelationRankingView)}
    >
      <TabsList
        className="ranking-tabs"
        aria-label="Tipo de ranking de placas correlatas"
      >
        {RANKING.tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onPointerEnter={() => onPrepare(tab.id)}
            onFocus={() => onPrepare(tab.id)}
          >
            <strong>{tab.label}</strong>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
