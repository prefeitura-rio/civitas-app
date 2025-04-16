import { SearchByPlateForm } from './components/search-by-plate-form'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[calc(100%)] w-full flex-col items-center gap-2 overflow-y-scroll p-2">
      <SearchByPlateForm />
      {children}
    </div>
  )
}
