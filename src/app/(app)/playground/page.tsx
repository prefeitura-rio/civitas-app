'use client'

import { PlaygroundMapContextProvider } from '@/contexts/playground-map-context'

import { GenerateReportButton } from '../ocorrencias/components/content/components/common/pdf-report/generate-report-button'
import { PlaygroundMap } from './components/map'

export default function Home() {
  return (
    <PlaygroundMapContextProvider>
      <div className="page-content flex">
        <div className="h-full w-full bg-slate-600">
          <PlaygroundMap />
          <GenerateReportButton />
        </div>
      </div>
    </PlaygroundMapContextProvider>
  )
}
