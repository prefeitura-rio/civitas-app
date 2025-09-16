'use client'
import '@/utils/date-extensions'

import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search, Trash } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DatePickerWithRange } from '@/components/custom/date-range-picker'
import { MultiselectCheckbox } from '@/components/custom/multiselect-checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReportsSearchParams } from '@/hooks/useParams/useReportsSearchParams'
import { useReportFilterOptions } from '@/hooks/useQueries/reports/useReportFilterOptions'
import { cn } from '@/lib/utils'
import type { GetReportsRequest } from '@/models/interfaces'

interface SidePanelProps {
  className?: string
}

const filterFormSchema = z.object({
  // semanticallySimilar: z.string().optional(),
  keywords: z.array(
    z.object({ word: z.string().min(1, { message: 'Campo obrigatório' }) }),
  ),
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

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<FilterFormType>({
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

  const { fields, append, remove } = useFieldArray({
    name: 'keywords',
    control,
  })

  function onSubmit(props: FilterFormType) {
    const params = new URLSearchParams()

    const searchParams: GetReportsRequest = {
      // semanticallySimilar: props.semanticallySimilar,
      minDate: props.dateRange?.from.toISOString(),
      maxDate: props.dateRange?.to?.toISOString(),
      categoryContains: props.categoryContains,
      sourceIdContains: props.sourceIdContains,
      keywords: props.keywords.map((item) => item.word),
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
    <div
      className={cn(
        className,
        'h-[calc(100%-2.25rem)] shrink-0 space-y-4 overflow-y-scroll pb-2 pl-2',
      )}
    >
      <h4>Filtros:</h4>
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* <div className="space-y-0.5">
            <Label>Busca semântica</Label>
            <Input {...register('semanticallySimilar')} />
          </div> */}

          <div className="flex flex-col space-y-2">
            <Label>Palavras-chave:</Label>
            <div>
              {fields.map((keyword, index) => (
                <div key={index} className="mb-2 flex items-center space-x-2">
                  <Input
                    type="text"
                    {...register(`keywords.${index}.word`)}
                    className="block w-full p-2"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="shrink-0"
                    onClick={() => remove(index)}
                  >
                    <Trash className="size-4 shrink-0" />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ word: '' })}
              >
                Adicionar palavra-chave
              </Button>
            </div>
            {errors.keywords && (
              <p className="text-sm text-red-500">{errors.keywords.message}</p>
            )}
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
            name="sourceIdContains"
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
