'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { FilterIcon } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
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
        <div className="page-content relative flex pt-8">
          <Sheet>
            <SheetTrigger asChild className="absolute right-2 top-10 z-10">
              <Button variant="secondary" className="">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <Filter />
          </Sheet>
          <SideList />
          {/* <div className="flex h-[calc(100%-9rem)] max-h-[50rem] gap-4"> */}
          <Map />
          {/* </div> */}
        </div>
      </FormProvider>
    </CarPathContextProvider>
  )
}
