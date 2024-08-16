import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { MultiselectCheckbox } from '@/components/custom/multiselect-checkbox'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReportsSearchParams } from '@/hooks/use-params/use-reports-search-params'
import { useReportFilterOptions } from '@/hooks/use-queries/use-report-filter-options'
import type { GetReportsRequest } from '@/http/reports/get-reports'
import { cn } from '@/lib/utils'

interface SidePanelProps {
  className?: string
}

const filterFormSchema = z.object({
  semanticallySimilar: z.string().optional(),
  dateRange: z
    .object({
      from: z.date({ message: 'Campo obrigatório' }),
      to: z.date({ message: 'Selecione uma data de término' }).optional(),
    })
    .optional(),
  sourceIdContains: z.array(z.string()).optional(),
  categoryContains: z.array(z.string()).optional(),
})

type FilterFormType = z.infer<typeof filterFormSchema>

export function SidePanel({ className }: SidePanelProps) {
  const router = useRouter()
  const pathName = usePathname()

  const { formattedSearchParams } = useReportsSearchParams()
  const {
    categories,
    sources,
    states: { categoriesIsLoading, sourcesIsLoading },
  } = useReportFilterOptions()

  console.log({ categories })

  const { control, handleSubmit, reset, register } = useForm<FilterFormType>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      dateRange: {
        from: formattedSearchParams.minDate
          ? new Date(formattedSearchParams.minDate)
          : undefined,
        to: formattedSearchParams.maxDate
          ? new Date(formattedSearchParams.maxDate)
          : undefined,
      },
    },
  })

  function onSubmit(props: FilterFormType) {
    const params = new URLSearchParams()

    const searchParams: GetReportsRequest = {
      semanticallySimilar: props.semanticallySimilar,
      minDate: props.dateRange?.from.toISOString(),
      maxDate: props.dateRange?.to?.toISOString(),
      categoryContains: props.categoryContains,
      sourceIdContains: props.sourceIdContains,
    }

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params.append(key, item)
          })
        } else {
          params.set(key, value)
        }
      }
    })

    router.push(`${pathName}?${params.toString()}`)
  }

  function clearFilter() {
    reset()
    router.replace(pathName)
  }

  return (
    <div className={cn(className, 'space-y-4 pl-2')}>
      <h4>Filtros:</h4>
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="space-y-0.5">
            <Label>Busca semântica</Label>
            <Input {...register('semanticallySimilar')} />
          </div>

          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <div className="space-y-0.5">
                <Label>Data</Label>
                <DatePickerWithRange
                  placeholder="Selecione uma data"
                  onChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                  defaultMonth={new Date().getMonth() - 1}
                  timePicker={false}
                  toDate={new Date()}
                />
              </div>
            )}
          />

          <Controller
            name="categoryContains"
            control={control}
            render={({ field }) => (
              <div className="space-y-0.5">
                <Label>Categorias</Label>
                <MultiselectCheckbox
                  options={categories}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={categoriesIsLoading}
                />
              </div>
            )}
          />

          <Controller
            name="categoryContains"
            control={control}
            render={({ field }) => (
              <div className="space-y-0.5">
                <Label>Fontes</Label>
                <MultiselectCheckbox
                  options={sources}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={sourcesIsLoading}
                />
              </div>
            )}
          />

          <Button type="submit" className="mt-4 w-full gap-2">
            <Search className="h-4 w-4" />
            Pesquisar
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full gap-2"
            onClick={clearFilter}
          >
            <FilterX className="h-4 w-4" />
            Limpar Filtro
          </Button>
        </form>
      </div>
    </div>
  )
}
