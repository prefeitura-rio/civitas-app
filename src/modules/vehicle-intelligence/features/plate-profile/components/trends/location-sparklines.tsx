import { useMemo } from 'react'

import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileLocation } from '@/modules/vehicle-intelligence/types/domain'

function Sparkline({
  values,
  markers,
}: {
  values: number[]
  markers: number[]
}) {
  const width = 480
  const height = 96
  const max = Math.max(1, ...values)
  const n = values.length
  const xAt = (index: number) => (n <= 1 ? 0 : (index / (n - 1)) * width)
  const yAt = (value: number) => height - 3 - (value / max) * (height - 8)
  const line = values
    .map(
      (value, index) =>
        `${index ? 'L' : 'M'}${xAt(index).toFixed(1)},${yAt(value).toFixed(1)}`,
    )
    .join(' ')
  const area = n
    ? `${line} L${xAt(n - 1).toFixed(1)},${height} L0,${height} Z`
    : ''
  return (
    <svg
      className="spark-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {markers.map((index) => (
        <line
          key={index}
          className="spark-marker"
          x1={xAt(index)}
          x2={xAt(index)}
          y1={0}
          y2={height}
        />
      ))}
      {area && <path className="spark-area" d={area} />}
      {line && <path className="spark-line" d={line} />}
    </svg>
  )
}

export function LocationSparklines({
  locations,
  periodDays,
  occurrenceIndices,
}: {
  locations: PlateProfileLocation[]
  periodDays: string[]
  occurrenceIndices: number[]
}) {
  const dayIndex = useMemo(
    () => new Map(periodDays.map((day, index) => [day, index])),
    [periodDays],
  )
  return (
    <div className="profile-spark-grid">
      {locations.slice(0, 6).map((item, index) => {
        const values = new Array(periodDays.length).fill(0)
        let total = 0
        for (const point of item.daily || []) {
          const position = dayIndex.get(point.day)
          if (position !== undefined) {
            values[position] = point.count
            total += point.count
          }
        }
        return (
          <div className="profile-spark-card" key={`${item.point_id}-${index}`}>
            <header>
              <strong>{item.location || item.point_id}</strong>
              <span>{formatNumber(total || item.detections)}</span>
            </header>
            <Sparkline values={values} markers={occurrenceIndices} />
            <small className="profile-spark-note">
              {formatNumber(item.daily?.length || 0)} dias com passagem
            </small>
          </div>
        )
      })}
    </div>
  )
}
