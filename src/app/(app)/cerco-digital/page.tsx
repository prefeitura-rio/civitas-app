'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { Filter, type FilterForm, filterFormSchema } from './components/filter'
import { Map } from './components/map'
import { SideList } from './components/sideList'

export default function CercoDigital() {
  const filterFormMethods = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })
  return (
    <FormProvider {...filterFormMethods}>
      <div className="page-content flex flex-col gap-8 pt-8">
        <Filter />
        <div className="flex">
          <Map />
          <SideList />
        </div>
      </div>
    </FormProvider>
  )
}
