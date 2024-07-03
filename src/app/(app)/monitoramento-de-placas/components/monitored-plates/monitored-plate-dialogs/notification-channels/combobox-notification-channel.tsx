import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getOperations } from '@/http/operations/getOperations'
import { cn } from '@/lib/utils'

import type { NewPlateForm } from '../../create-monitored-plate-dialog'

interface ComboboxOperationProps {
  setOperationId: Dispatch<SetStateAction<string>>
}

export function OperationCombobox({ setOperationId }: ComboboxOperationProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<NewPlateForm>()

  const { data: operationsResponse, isLoading: isOperationsLoading } = useQuery(
    {
      queryKey: ['operations'],
      queryFn: () => getOperations({}),
    },
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Label htmlFor="operation">Operação</Label>
          <InputError message={errors.operation?.message} />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" type="button" className="h-1 p-0 text-xs">
              Criar operação
            </Button>
          </DialogTrigger>
          <OperationDialog />
        </Dialog>
      </div>
      <Controller
        control={control}
        name="operation"
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  'w-full justify-between',
                  !field.value && 'text-muted-foreground',
                )}
              >
                {field.value
                  ? operationsResponse?.data.items.find(
                      (operation) => operation.title === field.value,
                    )?.title
                  : 'Selecione uma operação'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[29rem] p-0">
              <Command>
                <CommandInput placeholder="Pesquise" className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {isOperationsLoading ? (
                      <span>Loading...</span>
                    ) : (
                      operationsResponse &&
                      operationsResponse.data.items.map((operation) => (
                        <CommandItem
                          value={operation.title}
                          key={operation.id}
                          onSelect={() => {
                            setValue('operation', operation.title)
                            setOperationId(operation.id)
                          }}
                        >
                          {operation.title}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              operation.title === field.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  )
}
