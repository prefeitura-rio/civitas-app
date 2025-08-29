'use client'
import { getErrorMessage } from '@/app/(app)/pessoas/components/get-error-message'
import { Spinner } from '@/components/custom/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useCortexRemainingCredits } from '@/hooks/useQueries/useCortexRemainingCredits'
import { useEnhancedRadarsSearch } from '@/hooks/useQueries/useEnhancedRadarsSearch'
import { useRadarsSearch } from '@/hooks/useQueries/useRadarsSearch'
import { useVehiclesCreditsRequired } from '@/hooks/useQueries/useVehiclesCreditsRequired'
import { useSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/useSearchByRadarEnhancedResultDynamicFilter'
import { cortexRequestLimit } from '@/utils/cortex-limit'

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
  const {
    data: enhancedDetections,
    isPending,
    error,
  } = useEnhancedRadarsSearch()
  const filters = useSearchByRadarEnhancedResultDynamicFilter({
    data: enhancedDetections,
  })
  console.log(error)
  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesCreditsRequired(
    detections?.map((item) => item.plate) || [],
  )

  const { filteredData } = filters

  if (
    (detections && detections.length > cortexRequestLimit) ||
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
          {error && (
            <div className="flex justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
              <span className="pl-6 -indent-6 text-sm text-muted-foreground">
                {`⚠️ Não foi possível retornar informações a respeito desse veículo. ${getErrorMessage(error)}`}
              </span>
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
