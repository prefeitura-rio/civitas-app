import { WideSearchForm } from './components/wide-search-form'

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen w-full flex-col items-center gap-2 overflow-y-scroll p-2">
      <WideSearchForm />
      {children}
    </div>
  )
}
