type Detection = {
  plate: string
  equipmentCode: string
  timestamp: string
  parado?: boolean
  minutos_parado?: number
  total_deteccoes_parado?: number
}

export function consolidateRadarReportDetections<T extends Detection>(
  detections: readonly T[],
): (T & { possibleStayUntil?: string })[] {
  const rows: (T & { possibleStayUntil?: string })[] = []
  const starts = new Map<string, number>()
  const ordered = [...detections].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  for (const detection of ordered) {
    const key = JSON.stringify([detection.plate, detection.equipmentCode])
    const startIndex = starts.get(key)
    const start = startIndex === undefined ? undefined : rows[startIndex]
    const elapsedMinutes = start
      ? Math.floor(
          (new Date(detection.timestamp).getTime() -
            new Date(start.timestamp).getTime()) /
            60_000,
        )
      : null

    // The API returns the first and last reading of a stay. Match its duration
    // before merging, since report filters may have removed the first reading.
    if (
      detection.parado &&
      start &&
      startIndex !== undefined &&
      elapsedMinutes === detection.minutos_parado
    ) {
      rows[startIndex] = {
        ...start,
        parado: true,
        minutos_parado: detection.minutos_parado,
        total_deteccoes_parado: detection.total_deteccoes_parado,
        possibleStayUntil: detection.timestamp,
      }
      starts.delete(key)
      continue
    }

    rows.push({
      ...detection,
      possibleStayUntil: detection.parado ? detection.timestamp : undefined,
    })
    if (detection.parado) {
      starts.delete(key)
    } else {
      starts.set(key, rows.length - 1)
    }
  }

  return rows
}
