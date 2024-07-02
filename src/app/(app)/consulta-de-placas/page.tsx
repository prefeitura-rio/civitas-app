'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { FormProvider, useForm } from 'react-hook-form'

import { CarPathContextProvider } from '@/contexts/car-path-context'

import {
  type FilterForm,
  filterFormSchema,
} from './components/side-pannel/filter-form'

const Map = dynamic(() => import('./components/map').then((mod) => mod.Map), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
    </div>
  ),
  ssr: false, // Disable server-side rendering
})

const SidePanel = dynamic(
  () => import('./components/side-panel').then((mod) => mod.SidePanel),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function ConsultaDePlacas() {
  const filterFormMethods = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })
  return (
    <CarPathContextProvider>
      <FormProvider {...filterFormMethods}>
        <div className="relative flex h-screen w-full pt-0">
          <Map />
          <SidePanel />
        </div>
      </FormProvider>
    </CarPathContextProvider>
  )
}
