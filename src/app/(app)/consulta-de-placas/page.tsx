'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { CarPathContextProvider } from '@/contexts/car-path-context'

import { Filter, type FilterForm, filterFormSchema } from './components/filter'
import { Map } from './components/map'
import { SideList } from './components/side-list'

export default function ConsultaDePlacas() {
  const filterFormMethods = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })
  return (
    <CarPathContextProvider>
      <FormProvider {...filterFormMethods}>
        <div className="page-content flex flex-col gap-8 pt-8">
          <Filter />
          <div className="flex h-[calc(100%-9rem)] max-h-[50rem] gap-4">
            <SideList />
            <Map />
          </div>
        </div>
      </FormProvider>
    </CarPathContextProvider>
  )
}
