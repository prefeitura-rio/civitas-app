'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { CarPathContextProvider } from '@/contexts/car-path-context'

import { Map } from './components/map'
import { SidePanel } from './components/side-panel'
import {
  type FilterForm,
  filterFormSchema,
} from './components/side-pannel/filter-form'

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
