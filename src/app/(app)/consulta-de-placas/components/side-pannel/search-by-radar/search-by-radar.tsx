import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { SearchByRadarHeader } from './components/header'
import { RadarList } from './components/radar-list'
import { SearchByRadarFilterForm } from './components/search-by-radar-filter-form'
import {
  type SearchByRadarForm,
  searchByRadarFormSchema,
} from './components/search-by-radar-form-schema'

export function SearchByRadar() {
  const form = useForm<SearchByRadarForm>({
    resolver: zodResolver(searchByRadarFormSchema),
    defaultValues: {
      duration: [-5, 5],
    },
  })

  const { handleSubmit } = form

  function onSubmit() {
    // ...
  }

  return (
    <FormProvider {...form}>
      <form className="h-full w-full" onSubmit={handleSubmit(onSubmit)}>
        <SearchByRadarHeader />
        <RadarList />
        <SearchByRadarFilterForm />
      </form>
    </FormProvider>
  )
}
