import { PlacasCorrelatasEmCCsTabs } from '../components/search-tabs/placas-correlatas-em-ccs-tab'
// import { CorrelatedPlatesInCaseSetsForm } from './components/correlated-plates-in-case-sets-form'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[calc(100%)] w-full flex-col items-center gap-2 overflow-y-scroll p-2">
      <PlacasCorrelatasEmCCsTabs />
      {/* <CorrelatedPlatesInCaseSetsForm /> */}
      {children}
    </div>
  )
}
