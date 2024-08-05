import { zodResolver } from '@hookform/resolvers/zod'
import { FilterX, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
// import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SidePanelProps {
  className?: string
}

enum Origins {
  ALL = 'Todas',
  DISK_DENUNCIA = 'Disk Denúncia',
  UM_SETE_QUARTO_MEIA = '1746',
}

const filterFormSchema = z.object({
  keyWord: z.string().optional(),
  dateRange: z
    .object({
      from: z.date({ message: 'Campo obrigatório' }).nullable(),
      to: z.date({ message: 'Selecione uma data de término' }).optional(),
    })
    .optional()
    .superRefine((val, ctx) => {
      if (val && val.to && val.to > new Date()) {
        ctx.addIssue({
          code: 'invalid_date',
          message: 'A data de término deve ser menor ou igual à data atual',
        })
      }
    }),
  type: z.string().optional(),
  subtype: z.string().optional(),
  origin: z.nativeEnum(Origins),
})

type FilterFormType = z.infer<typeof filterFormSchema>

export function SidePanel({ className }: SidePanelProps) {
  const form = useForm<FilterFormType>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      origin: Origins.ALL,
    },
  })

  const { control, handleSubmit, reset } = form

  function onSubmit(props: FilterFormType) {
    // ...
    console.log('submit')
    console.log(props)
  }

  function clearFilter() {
    reset()
  }

  return (
    <div className={cn(className, 'space-y-4 pl-2')}>
      <h4>Filtros:</h4>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={control}
              name="keyWord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palavras-chave</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <div className="space-y-1">
                      <DatePickerWithRange
                        placeholder="Selecione uma data"
                        onChange={(newValue) => {
                          if (!newValue?.from && !newValue?.to) {
                            field.onChange(undefined)
                          } else {
                            field.onChange({
                              from: newValue.from || null,
                              to: newValue.to || undefined,
                            })
                          }
                        }}
                        value={field.value}
                        defaultValue={field.value}
                        defaultMonth={new Date().getMonth() - 1}
                        timePicker={false}
                        toDate={new Date()}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="subtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtipo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Origins).map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
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
            >
              <FilterX className="h-4 w-4" onClick={clearFilter} />
              Limpar Filtro
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
