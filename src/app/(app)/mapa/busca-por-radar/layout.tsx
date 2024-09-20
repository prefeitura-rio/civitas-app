import { RadarSearchForm } from './components/radar-search-form'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen w-full flex-col gap-2 overflow-y-scroll p-2">
      <RadarSearchForm />
      {children}
    </div>
  )
}
