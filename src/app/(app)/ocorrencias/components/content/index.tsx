'use client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ReportsMapContextProvider } from '@/contexts/reports-map-context'
import { cn } from '@/lib/utils'

import { GenerateReportButton } from './components/common/pdf-report/generate-report-button'
import { Views } from './components/common/views'
import { Dashboard } from './components/dashboard'
import { Map } from './components/map'
import { SidePanel } from './components/side-panel'
import { Timeline } from './components/timeline'

export function Content() {
  const [view, setView] = useState<Views>(Views.TIMELINE)

  return (
    <ReportsMapContextProvider>
      <div className="flex h-[calc(100%-2.75rem)] w-full">
        <div className="w-full space-y-2">
          <div className="flex w-full gap-2">
            {Object.entries(Views).map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={() => setView(item[1])}
                className={cn(
                  'w-40 shrink-0 border-b-2',
                  item[1] === view
                    ? 'border-b-2 border-primary'
                    : 'border-opacity-0',
                )}
              >
                {item[1]}
              </Button>
            ))}
            <div className="flex w-full justify-end px-2">
              <GenerateReportButton />
            </div>
          </div>

          <div className="h-[calc(100%-3rem)] overflow-y-scroll">
            {view === Views.MAP && <Map />}
            {view === Views.TIMELINE && (
              <Timeline className="min-w-screen-lg" />
            )}
            {view === Views.DASHBOARD && (
              <Dashboard className="h-full w-full min-w-screen-md" />
            )}
          </div>
        </div>
        <SidePanel className="w-96 border-l-2" />
      </div>
    </ReportsMapContextProvider>
  )
}
