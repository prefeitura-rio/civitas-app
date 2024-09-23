'use client'
import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import {
  type EnhancedDetectionDTO,
  useEnhancedRadarsSearch,
} from '@/hooks/use-queries/use-enhanced-radars-search'
import { useRadarsSearch } from '@/hooks/use-queries/use-radars-search'
import { useVehiclesNecessaryCredits } from '@/hooks/use-queries/use-vehicles-necessary-credits'

import { ActionBar } from './components/action-bar'
import { EnhancedDetectionsTable } from './components/enhanced-detections-table'
import { Filter } from './components/filter'
import { Header } from './components/header'
import { InvalidParamsAlert } from './components/invalid-params-alert'
import { TooManyPlates } from './components/too-many-plates-alert'

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

  const [filteredData, setFilteredData] = useState<
    EnhancedDetectionDTO[] | undefined
  >(undefined)
  const { data: detections } = useRadarsSearch()
  const { data: enhancedDetections, isPending } = useEnhancedRadarsSearch()
  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesNecessaryCredits(
    detections?.map((item) => item.plate) || [],
  )

  if (
    (detections && detections.length > 100) ||
    (remainingCredits &&
      creditsRequired &&
      remainingCredits.remaining_credit < creditsRequired.credits)
  ) {
    return <TooManyPlates />
  }

  console.log({ filteredData })
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ActionBar data={filteredData} isLoading={isPending} />
      <Card className="w-full">
        <Header />
        <CardContent className="">
          {isPending && (
            <div className="flex w-full justify-center p-6">
              <Spinner className="size-10" />
            </div>
          )}
          {enhancedDetections && (
            <Filter
              data={enhancedDetections}
              setFilteredData={setFilteredData}
            />
          )}
          {filteredData && (
            <div className="flex w-full">
              <EnhancedDetectionsTable
                data={filteredData}
                isLoading={isPending}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
