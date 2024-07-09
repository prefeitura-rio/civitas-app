'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'

const filterFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: '' })
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido')
    .transform((item) => item.toUpperCase()),
})

type FilterForm = z.infer<typeof filterFormSchema>

export function MonitoredPlatesFilter() {
  const searchParams = useSearchParams()
  // const router = useRouter()
  // const pathName = usePathname()
  const { formDialogDisclosure, setDialogInitialData } = useMonitoredPlates()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
  })

  function onSubmit(props: FilterForm) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('plate', props.plate)

    // router.push(`${pathName}?${params.toString()}`)
    setDialogInitialData({ plate: props.plate })
    formDialogDisclosure.onOpen()
  }

  console.log(errors)

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
      />
      <InputError message={errors.plate?.message} />
      <Button size="sm" variant="outline" type="submit">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
