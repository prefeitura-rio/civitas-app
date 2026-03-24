import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { generateDownloadUrl } from '@/http/gcs/generate-download-url'

import { getGcsErrorMessage } from '../utils/get-gcs-error-message'

const formSchema = z
  .object({
    file_name: z.string().min(1, { message: 'Nome do arquivo é obrigatório' }),
    expiration_value: z
      .number({
        required_error: 'Validade é obrigatória',
        invalid_type_error: 'Validade deve ser um número',
      })
      .min(1, { message: 'Valor deve ser maior que zero' }),
    expiration_unit: z.enum(['minutes', 'hours', 'days'], {
      required_error: 'Unidade de tempo é obrigatória',
    }),
  })
  .superRefine((data, ctx) => {
    const maxMinutes = 7 * 24 * 60 // 7 dias
    const expirationMinutes = convertToMinutes(
      data.expiration_value,
      data.expiration_unit,
    )

    if (expirationMinutes > maxMinutes) {
      ctx.addIssue({
        code: 'custom',
        message: 'A validade máxima permitida é de 7 dias',
        path: ['expiration_value'],
      })
    }
  })

export type GcsDownloadUrlFormValues = z.infer<typeof formSchema>

function convertToMinutes(
  value: number,
  unit: 'minutes' | 'hours' | 'days',
): number {
  if (unit === 'minutes') return value
  if (unit === 'hours') return value * 60
  return value * 24 * 60
}

interface UseDownloadUrlFormParams {
  bucketName: string
}

export function useDownloadUrlForm({ bucketName }: UseDownloadUrlFormParams) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GcsDownloadUrlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file_name: '',
      expiration_value: 60,
      expiration_unit: 'minutes',
    },
  })

  const { mutateAsync: generateUrlMutation, isPending } = useMutation({
    mutationFn: generateDownloadUrl,
  })

  const onSubmit = useCallback(
    async (data: GcsDownloadUrlFormValues) => {
      if (!bucketName) {
        toast.error('Configuração de bucket ausente no servidor')
        return
      }

      const expirationMinutes = convertToMinutes(
        data.expiration_value,
        data.expiration_unit,
      )

      try {
        const response = await generateUrlMutation({
          file_name: data.file_name,
          bucket_name: bucketName,
          expiration_minutes: expirationMinutes,
        })
        setDownloadUrl(response.data.download_url)
        toast.success('Link de download gerado com sucesso!')
      } catch (error) {
        const errorMessage = getGcsErrorMessage(error)
        toast.error(errorMessage)
      }
    },
    [bucketName, generateUrlMutation],
  )

  const handleCopyUrl = useCallback(async () => {
    if (!downloadUrl) return
    try {
      await navigator.clipboard.writeText(downloadUrl)
      toast.success('URL copiada para a área de transferência!')
    } catch (error) {
      toast.error('Não foi possível copiar a URL.')
    }
  }, [downloadUrl])

  const handleReset = useCallback(() => {
    reset()
    setDownloadUrl(null)
  }, [reset])

  return {
    register,
    control,
    errors,
    isPending,
    downloadUrl,
    handleSubmit,
    onSubmit,
    handleCopyUrl,
    handleReset,
  }
}
