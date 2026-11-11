import { PointKindSymbol } from '@/modules/vehicle-intelligence/components/groups/pole-map/point-kind-symbol'
import {
  POINT_KINDS,
  type Pole,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'

/** A lista ao lado do mapa: os polos visíveis, do com mais leituras para o com menos; o clique abre o polo. */
export function PoleList({
  poles,
  onSelect,
}: {
  poles: Pole[]
  onSelect: (id: string) => void
}) {
  const maximum = Math.max(1, ...poles.map((p) => p.count))
  return (
    <>
      <div className="group-poles-top">
        <strong>
          {poles.length} {poles.length === 1 ? 'polo' : 'polos'}
        </strong>
        <span>leituras</span>
      </div>
      <p className="group-poles-tip">
        Clique num polo, aqui ou no mapa, para ver as placas, os horários e os
        ROs ligados a ele.
      </p>
      <div className="group-poles-list">
        {poles.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item.id)}>
            <PointKindSymbol kind={item.kind} size={12} />
            <span>
              <strong>{item.location}</strong>
              <small>
                {POINT_KINDS[item.kind].name} ·{' '}
                {item.complex
                  ? `perto de ${item.complex}`
                  : 'fora de território'}
              </small>
            </span>
            <b>{item.count}</b>
            <i className="group-bar" aria-hidden="true">
              <i
                style={{
                  width: `${(100 * item.count) / maximum}%`,
                  background: POINT_KINDS[item.kind].textColor,
                }}
              />
            </i>
          </button>
        ))}
        {!poles.length && (
          <p className="group-poles-empty">
            Nenhum polo com 2+ leituras neste recorte. Ligue "Polos com 1
            leitura" para ver todos.
          </p>
        )}
      </div>
    </>
  )
}
