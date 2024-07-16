'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Spinner } from '@/components/ui/spinner'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { isNotFoundError } from '@/utils/error-handlers'

const filterFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: '' })
    .toUpperCase()
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido'),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function MonitoredPlatesFilter() {
  const searchParams = useSearchParams()
  const { formDialogDisclosure, setDialogInitialData } = useMonitoredPlates()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })

  const { mutateAsync: getMonitoredPlateMutation } = useMutation({
    mutationFn: getMonitoredPlate,
  })

  async function onSubmit(props: FilterForm) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('plate', props.plate)
    // router.push(`${pathName}?${params.toString()}`)

    setIsLoading(true)
    try {
      await getMonitoredPlateMutation({ plate: props.plate })

      setDialogInitialData({ plate: props.plate })
      formDialogDisclosure.onOpen()
    } catch (error) {
      if (isNotFoundError(error)) {
        toast.warning('Placa não encontrada!')
      }
    }
    setIsLoading(false)
  }

  return (
    <form
      className="flex items-center space-x-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* <Label htmlFor="plate">Placa</Label> */}
      <Input
        className="h-9 w-40"
        id="plate"
        type="text"
        placeholder="Pesquisar placa"
        {...register('plate')}
        onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
      />
      <InputError message={errors.plate?.message} />
      <Button size="sm" variant="outline" type="submit">
        {isLoading ? <Spinner /> : <Search className="h-4 w-4" />}
      </Button>
    </form>
  )
}
