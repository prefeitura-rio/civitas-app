import { consolidateRadarReportDetections } from '@/utils/consolidate-radar-report-detections'

const start = {
  plate: 'ABC1D23',
  equipmentCode: '0000001',
  timestamp: '2026-11-18T09:08:04',
  speed: 0,
}
const end = {
  ...start,
  timestamp: '2026-11-18T10:49:59',
  parado: true,
  minutos_parado: 101,
  total_deteccoes_parado: 4,
}

it('keeps the first timestamp and moves the stay information onto that row', () => {
  const rows = consolidateRadarReportDetections([end, start])

  expect(rows).toEqual([
    {
      ...start,
      parado: true,
      minutos_parado: 101,
      total_deteccoes_parado: 4,
      possibleStayUntil: end.timestamp,
    },
  ])
  expect(start).not.toHaveProperty('parado')
})

it('keeps unrelated vehicles and equipment readings', () => {
  const otherPlate = { ...start, plate: 'EFG4H56' }
  const otherEquipment = { ...start, equipmentCode: '0000002' }
  const rows = consolidateRadarReportDetections([
    start,
    otherPlate,
    otherEquipment,
    end,
  ])

  expect(rows).toHaveLength(3)
  expect(rows[1]).toMatchObject(otherPlate)
  expect(rows[2]).toMatchObject(otherEquipment)
  expect(rows[1].possibleStayUntil).toBeUndefined()
  expect(rows[2].possibleStayUntil).toBeUndefined()
})

it('keeps the last reading when the matching first reading is absent', () => {
  const unrelated = { ...start, timestamp: '2026-11-18T08:00:00' }
  expect(consolidateRadarReportDetections([unrelated, end])).toHaveLength(2)
  expect(consolidateRadarReportDetections([end])).toEqual([
    { ...end, possibleStayUntil: end.timestamp },
  ])
})

it('keeps successive stays separate', () => {
  const nextStart = { ...start, timestamp: '2026-11-18T11:00:00' }
  const nextEnd = {
    ...end,
    timestamp: '2026-11-18T11:15:00',
    minutos_parado: 15,
  }
  const rows = consolidateRadarReportDetections([
    start,
    end,
    nextStart,
    nextEnd,
  ])
  expect(rows).toHaveLength(2)
  expect(rows[0].timestamp).toBe(start.timestamp)
  expect(rows[0].possibleStayUntil).toBe(end.timestamp)
  expect(rows[1].timestamp).toBe(nextStart.timestamp)
  expect(rows[1].possibleStayUntil).toBe(nextEnd.timestamp)
})
