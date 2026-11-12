import { useMemo, useState } from 'react'

import { modalityLabel } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { formatElapsedHours } from '@/modules/vehicle-intelligence/features/post-event/components/shared/elapsed-hours'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

export function PoleList({
  data,
  onSelect,
}: {
  data: PostEventData
  onSelect: (key: string) => void
}) {
  const [tab, setTab] = useState<'destination' | 'origin'>('destination')
  const origins = useMemo(
    () => data.origin_poles.filter((pole) => pole.tracked_occurrences > 0),
    [data.origin_poles],
  )
  const destinationMax = Math.max(
    ...data.destination_poles.map((pole) => pole.occurrences),
    1,
  )
  const originMax = Math.max(
    ...origins.map((pole) => pole.tracked_occurrences),
    1,
  )
  return (
    <div className="pole-list">
      <div
        className="pole-list-tabs"
        role="tablist"
        aria-label="Lista de polos"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'destination'}
          onClick={() => setTab('destination')}
        >
          Desconexão <b>{data.destination_poles.length}</b>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'origin'}
          onClick={() => setTab('origin')}
        >
          Roubo e furto <b>{origins.length}</b>
        </button>
      </div>
      <p className="pole-list-hint">
        {tab === 'destination'
          ? 'Onde as placas citadas são lidas pela última vez antes de sumir por mais de 8h.'
          : 'Polos com ocorrências em que uma placa citada foi acompanhada.'}
      </p>
      <div className="pole-list-items" role="tabpanel">
        {tab === 'destination'
          ? data.destination_poles.map((pole) => (
              <button
                type="button"
                key={pole.id}
                onClick={() => onSelect(`destination:${pole.id}`)}
              >
                <i
                  className={`dot destination${pole.kind === 'concentration' ? ' concentrated' : ''}`}
                />
                <span>
                  <strong>{pole.name}</strong>
                  <small>
                    {pluralize(pole.vehicles, 'placa', 'placas')} ·{' '}
                    {pluralize(pole.radar_count, 'radar', 'radares')} ·{' '}
                    {formatElapsedHours(pole.median_elapsed_hours, 1)}
                  </small>
                  <em
                    style={{
                      width: `${(100 * pole.occurrences) / destinationMax}%`,
                    }}
                  />
                </span>
                <b>{formatNumber(pole.occurrences)}</b>
              </button>
            ))
          : origins.map((pole) => (
              <button
                type="button"
                key={pole.id}
                onClick={() => onSelect(`origin:${pole.id}`)}
              >
                <i
                  className={`dot origin ${pole.modality === 'ROUBO' ? 'robbery' : 'theft'}${pole.kind === 'concentration' ? ' concentrated' : ''}`}
                />
                <span>
                  <strong>{pole.name}</strong>
                  <small>
                    {modalityLabel(pole.modality)} ·{' '}
                    {pluralize(pole.occurrences, 'fato', 'fatos')} ·{' '}
                    {pluralize(pole.vehicles, 'placa', 'placas')}
                  </small>
                  <em
                    style={{
                      width: `${(100 * pole.tracked_occurrences) / originMax}%`,
                    }}
                  />
                </span>
                <b>{formatNumber(pole.tracked_occurrences)}</b>
              </button>
            ))}
      </div>
    </div>
  )
}
