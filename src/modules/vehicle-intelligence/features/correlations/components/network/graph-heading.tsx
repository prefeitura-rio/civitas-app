import { GRAPH } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'

/** Título, texto e legenda da rede (cores dos nós e faixas de força das ligações). */
export function GraphHeading() {
  return (
    <div className="panel-heading">
      <div>
        <span className="eyebrow">REDE INTERATIVA</span>
        <h2>{GRAPH.heading.title}</h2>
        <p>{GRAPH.heading.text}</p>
      </div>
      <div className="graph-legend">
        {GRAPH.legend.map((item) => (
          <span key={item.label}>
            <i className={item.className || undefined} />
            {item.label}
          </span>
        ))}
        <span>
          <i className="edge-high" />
          {GRAPH.strengthLabel === 'Força da correlação'
            ? 'Força'
            : 'Proximidade'}{' '}
          alta ≥70
        </span>
        <span>
          <i className="edge-medium" />
          Intermediária 40–69
        </span>
        <span>
          <i className="edge-low" />
          Baixa &lt;40
        </span>
      </div>
    </div>
  )
}
