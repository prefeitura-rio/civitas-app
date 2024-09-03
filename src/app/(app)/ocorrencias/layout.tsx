import { ReportsMapContextProvider } from '@/contexts/reports-map-context'

import { Header } from './components/header'
import { SidePanel } from './components/side-panel'
import { ViewButtons } from './components/view-buttons'

export default function Ocorrencias({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="page-content space-y-4">
      <Header />
      <ReportsMapContextProvider>
        <div className="flex h-[calc(100%-1rem)] w-full">
          <div className="w-full space-y-2">
            <ViewButtons />

            <div className="h-[calc(100%-3rem)] overflow-y-scroll">
              {children}
            </div>
          </div>
          <SidePanel className="w-96 border-l-2" />
        </div>
      </ReportsMapContextProvider>
    </div>
  )
}
