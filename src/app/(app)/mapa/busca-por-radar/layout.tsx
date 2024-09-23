import { RadarSearchForm } from './components/radar-search-form'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[calc(100%-4rem)] w-full flex-col items-center gap-4 overflow-y-scroll p-2">
      <RadarSearchForm />
      {children}
    </div>
  )
}
