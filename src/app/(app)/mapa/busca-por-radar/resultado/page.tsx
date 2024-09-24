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

export default function RadarDetections() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  if (!formattedSearchParams) return <InvalidParamsAlert />

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
