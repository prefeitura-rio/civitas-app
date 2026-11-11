import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { Badge } from '@/modules/vehicle-intelligence/components/ui/badge'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { cispParts } from '@/modules/vehicle-intelligence/lib/labels'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

/** CISPs com mais ocorrências: o nome da área em destaque, o código ao lado. */
export function CispRanking({ data }: { data: DashboardData }) {
  const rows = data.ranking.slice(0, 8)
  const max = rows[0]?.ocorrencias || 1
  return (
    <Panel className="ranking-panel">
      <PanelHeader
        compact
        eyebrow="Concentração"
        title="CISPs em destaque"
        action={
          <Badge variant="outline" className="rank-count">
            TOP {rows.length}
          </Badge>
        }
      />
      <ol className="ranking-list">
        {rows.map((item, index) => {
          const { locality, unit } = cispParts(item.cisp, item.area)
          return (
            <li className="rank-row" key={item.cisp}>
              <span className="rank-position">{index + 1}</span>
              <div className="rank-copy">
                <div>
                  <strong title={`${locality ?? 'Área sem nome'} · ${unit}`}>
                    {locality ?? `CISP ${item.cisp}`}
                  </strong>
                  <span>CISP {item.cisp}</span>
                  <em>{formatNumber(item.ocorrencias)}</em>
                </div>
                <i>
                  <b
                    style={{ width: `${(item.ocorrencias / max) * 100}%` }}
                  ></b>
                </i>
              </div>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
