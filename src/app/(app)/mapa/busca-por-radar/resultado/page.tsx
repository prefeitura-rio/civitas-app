'use client'

import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useRadarsSearch } from '@/hooks/use-queries/use-radars-search'
import { useSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'

import { ActionBar } from './components/action-bar'
import { DetectionsTable } from './components/detections-table'
import { Filter } from './components/filter'
import { Header } from './components/header'
import { InvalidParamsAlert } from './components/invalid-params-alert'

// function groupDetectionsByLocation(detections: Detection[]) {
//   const groupedData = detections.reduce(
//     (acc, item) => {
//       const location = item.location?.replace(/- FX \d+/, '') || 'N/A'
//       if (!acc[location]) {
//         acc[location] = {
//           location,
//           radars: [],
//           detections: [],
//         }
//       }
//       acc[location].radars.push(item.)
//       acc[location].detections.push(
//         ...item.detections.map((detection) => ({
//           ...detection,
//           lane: detection.lane || 'N/A',
//         })),
//       )
//       return acc
//     },
//     {} as {
//       [key: string]: {
//         location: string
//         radars: Radar[]
//         detections: (RadarDetection &
//           Vehicle & {
//             cameraNumber: string
//             lane: string
//           })[]
//       }
//     },
//   )

//   Object.values(groupedData).forEach((group) => {
//     group.detections.sort(
//       (a, b) =>
//         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
//     )
//   })

//   return Object.values(groupedData) as DetectionGroup[]
// }

export default function RadarDetections() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  if (!formattedSearchParams) return <InvalidParamsAlert />

  // const [filteredData, setFilteredData] = useState<DetectionDTO[] | undefined>(
  //   undefined,
  // )

  const { data, isPending } = useRadarsSearch()
  const filters = useSearchByRadarResultDynamicFilter({ data })
  const { filteredData } = filters

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ActionBar isLoading={isPending} filters={filters} />
      <Card className="w-full">
        <Header />
        <CardContent className="">
          {isPending && (
            <div className="flex w-full justify-center p-6">
              <Spinner className="size-10" />
            </div>
          )}
          {data && (
            <Filter
              data={data}
              // setFilteredData={setFilteredData}
              filters={filters}
              radarIds={formattedSearchParams.radarIds}
            />
          )}
          {filteredData && (
            <div className="flex w-full">
              <DetectionsTable data={filteredData} isLoading={isPending} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
