import { type CSSProperties, Fragment } from 'react'

import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { COLORS } from '@/modules/vehicle-intelligence/components/timeline/group/style'
import { hourMinute } from '@/modules/vehicle-intelligence/components/timeline/group/time'
import { formatTime } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'

/** O popup da passagem junta: as placas, o equipamento e o horário de cada leitura. */
export function TogetherPopup({
  item,
  colors,
}: {
  item: GroupEvent
  colors: Map<string, string>
}) {
  const first = item.detections[0]
  return (
    <div className="analysis-map-popup gt-popup-joint">
      <div className="analysis-popup-top">
        <span
          className="analysis-popup-role member"
          style={{ '--popup-role': COLORS.passage } as CSSProperties}
        >
          PASSAGEM JUNTA
        </span>
        <span className="analysis-popup-status">
          {item.inFact ? `no ${item.inFact}` : 'fora do fato'}
        </span>
      </div>
      <div className="analysis-popup-identity">
        <strong className="analysis-popup-plate analysis-popup-plate-primary">
          {item.detections
            .map((detection) => detection.plate)
            .filter((p, i, ps) => ps.indexOf(p) === i)
            .join(' + ')}
        </strong>
      </div>
      <b className="analysis-popup-time">{hourMinute(item.at)}</b>
      <span className="analysis-popup-place">
        {first.location || 'Local não informado'}
      </span>
      <dl className="analysis-popup-grid">
        <dt>Equipamento</dt>
        <dd>{first.camera || '—'}</dd>
        {item.detections.map((detection) => (
          <Fragment key={detection.key}>
            <dt>
              <i
                className="gt-point"
                style={{ background: colors.get(detection.plate) }}
              />
              {detection.plate}
            </dt>
            <dd>{formatTime(detection.detected_at)}</dd>
          </Fragment>
        ))}
      </dl>
      <span className="analysis-crime-popup-note">
        {item.inFact
          ? `As placas estão no RO e passaram a até 1 h dele: conta como "juntas no fato" na ligação forte.`
          : 'Mesmo equipamento, até 3 min, fora da hora dos fatos ou com uma das placas fora do RO.'}
      </span>
    </div>
  )
}
