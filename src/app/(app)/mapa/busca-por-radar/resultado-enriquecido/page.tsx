'use client'
import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import { useEnhancedRadarsSearch } from '@/hooks/use-queries/use-enhanced-radars-search'
import { useRadarsSearch } from '@/hooks/use-queries/use-radars-search'
import { useVehiclesNecessaryCredits } from '@/hooks/use-queries/use-vehicles-necessary-credits'
import { useSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/use-search-by-radar-enhanced-result-dynamic-filter'

import { ActionBar } from './components/action-bar'
import { EnhancedDetectionsTable } from './components/enhanced-detections-table'
import { Filter } from './components/filter'
import { Header } from './components/header'
import { InvalidParamsAlert } from './components/invalid-params-alert'
import { TooManyPlates } from './components/too-many-plates-alert'

export default function RadarDetections() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  if (!formattedSearchParams) return <InvalidParamsAlert />

  const { data: detections } = useRadarsSearch()
  const { data: enhancedDetections, isPending } = useEnhancedRadarsSearch()
  const filters = useSearchByRadarEnhancedResultDynamicFilter({
    data: enhancedDetections,
  })
  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesNecessaryCredits(
    detections?.map((item) => item.plate) || [],
  )

  const { filteredData } = filters

  if (
    (detections && detections.length > 100) ||
    (remainingCredits &&
      creditsRequired &&
      remainingCredits.remaining_credit < creditsRequired.credits)
  ) {
    return <TooManyPlates />
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ActionBar
        data={enhancedDetections}
        filters={filters}
        isLoading={isPending}
      />
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
              radarIds={formattedSearchParams.radarIds}
              filters={filters}
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
