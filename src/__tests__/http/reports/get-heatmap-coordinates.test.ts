import { getHeatmapReports } from '@/http/reports/dashboard/get-heatmap'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({ api: { get: jest.fn() } }))
jest.mock('@/utils/format-reports-request', () => ({
  formatReportsRequest: () => ({}),
}))

it('rejects invalid coordinates before applying duplicate-point offsets', async () => {
  jest.mocked(api.get).mockResolvedValueOnce({
    data: [
      { id_report: 'zero', longitude: 0, latitude: 0 },
      { id_report: 'missing-a', longitude: null, latitude: null },
      { id_report: 'missing-b', longitude: null, latitude: null },
      { id_report: 'outside', longitude: 181, latitude: 1 },
      { id_report: 'edge-a', longitude: 180, latitude: -90 },
      { id_report: 'edge-b', longitude: 180, latitude: -90 },
    ],
  })
  const result = await getHeatmapReports(
    {} as Parameters<typeof getHeatmapReports>[0],
  )
  expect(result).toEqual([
    { reportId: 'zero', longitude: 0, latitude: 0 },
    { reportId: 'edge-a', longitude: 180, latitude: -90 },
    { reportId: 'edge-b', longitude: 180, latitude: -90 },
  ])
})
