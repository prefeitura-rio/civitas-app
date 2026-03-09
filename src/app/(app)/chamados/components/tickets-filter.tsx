'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const filterSchema = z.object({
  requisitante: z.string().optional(),
  procedureNumber: z.string().optional(),
})

type FilterForm = z.infer<typeof filterSchema>

export function TicketsFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const { register, handleSubmit, setValue, reset } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {},
  })

  useEffect(() => {
    const requisitante = searchParams.get('requisitante')
    const procedureNumber = searchParams.get('procedureNumber')

    if (requisitante) setValue('requisitante', requisitante)
    if (procedureNumber) setValue('procedureNumber', procedureNumber)
  }, [searchParams, setValue])

  function handleClearFilters() {
    reset()
    // mantém page/page_size se quiser; aqui limpamos tudo
    router.replace(pathName)
  }

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1') // sempre volta para página 1 ao filtrar

    // ainda não existe no backend, mas já fica pronto:
    if (props.requisitante) params.set('requisitante', props.requisitante)
    else params.delete('requisitante')

    if (props.procedureNumber)
      params.set('procedureNumber', props.procedureNumber)
    else params.delete('procedureNumber')

    router.replace(`${pathName}?${params.toString()}`)
  }

  return (
    <form
      className="flex items-end space-x-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <Label className="text-xs text-muted-foreground" htmlFor="requisitante">
          Requisitante
        </Label>
        <Input
          id="requisitante"
          className="h-9 w-56"
          {...register('requisitante')}
        />
      </div>

      <div>
        <Label
          className="text-xs text-muted-foreground"
          htmlFor="procedureNumber"
        >
          Nº de procedimento
        </Label>
        <Input
          id="procedureNumber"
          className="h-9 w-56"
          {...register('procedureNumber')}
        />
      </div>

      <Button size="sm" variant="outline" type="submit" className="space-x-1">
        <Search className="h-4 w-4" />
        <span>Filtrar</span>
      </Button>

      <Tooltip text="Limpar filtro" asChild>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={handleClearFilters}
        >
          <FilterX className="h-4 w-4" />
          <span className="sr-only">Limpar filtro</span>
        </Button>
      </Tooltip>
    </form>
  )
}
