'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTicketNature } from '@/http/get-ticket-natures/create-ticket-nature'
import {
  getTicketNatures,
  type TicketNature,
} from '@/http/get-ticket-natures/get-ticket-natures'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from './ticket-nature.module.css'

const ticketNatureFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome obrigatório')
    .max(120, 'Máximo de 120 caracteres'),
})

type TicketNatureForm = z.infer<typeof ticketNatureFormSchema>

type TicketNatureCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (nature: TicketNature) => void
}

function appendNatureToTicketNatureQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  nature: TicketNature,
) {
  queryClient.setQueriesData<AxiosResponse<TicketNature[]>>(
    { queryKey: ['ticket-natures'] },
    (current) => {
      if (!current?.data) return current
      if (current.data.some((item) => item.id === nature.id)) return current

      return {
        ...current,
        data: [...current.data, nature],
      }
    },
  )
}

export function TicketNatureCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: TicketNatureCreateDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketNatureForm>({
    resolver: zodResolver(ticketNatureFormSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (!open) {
      reset({ name: '' })
    }
  }, [open, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: createTicketNature,
    onSuccess: async (_result, variables) => {
      const trimmedName = variables.name.trim()
      let createdNature: TicketNature | undefined

      try {
        const response = await getTicketNatures({
          isActive: true,
          search: trimmedName,
        })
        const items = response.data ?? []
        createdNature = items.find(
          (item) =>
            item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
        )
      } catch {
        createdNature = undefined
      }

      if (createdNature) {
        appendNatureToTicketNatureQueries(queryClient, createdNature)
      }

      await queryClient.invalidateQueries({ queryKey: ['ticket-natures'] })

      toast.success(
        createdNature?.name
          ? `Natureza "${createdNature.name}" criada com sucesso.`
          : 'Natureza criada com sucesso.',
      )

      onOpenChange(false)

      if (createdNature) {
        onCreated?.(createdNature)
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const isLoading = isSubmitting || isPending

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset({ name: '' })
    }
    onOpenChange(nextOpen)
  }

  function handleSave(data: TicketNatureForm) {
    mutate({
      name: data.name.trim(),
      is_active: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.natureModal}>
        <DialogHeader className={styles.natureModalHeader}>
          <DialogTitle className={styles.natureModalTitle}>
            Nova natureza
          </DialogTitle>
        </DialogHeader>

        <form
          className={styles.natureModalForm}
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            handleSubmit(handleSave)(event).catch(() => {})
          }}
        >
          <div className={styles.natureModalField}>
            <div className={styles.natureModalFieldHeader}>
              <Label
                htmlFor="ticket-nature-name"
                className={styles.natureModalLabel}
              >
                Nome
              </Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input
              id="ticket-nature-name"
              {...register('name')}
              maxLength={120}
              disabled={isLoading}
              autoFocus
              className={styles.natureModalInput}
            />
          </div>

          <DialogFooter className={styles.natureModalFooter}>
            <Button
              type="button"
              variant="secondary"
              className={styles.natureModalCancelButton}
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={styles.natureModalSaveButton}
              disabled={isLoading}
              onClick={() => {
                handleSubmit(handleSave)().catch(() => {})
              }}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
