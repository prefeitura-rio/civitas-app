'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Copy, ExternalLink, Link2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateDownloadUrl } from '@/http/gcs/generate-download-url'

import { getGcsErrorMessage } from '../utils/get-gcs-error-message'

const gcsDownloadUrlFormSchema = z
  .object({
    file_name: z.string().min(1, { message: 'Nome do arquivo é obrigatório' }),
    bucket_name: z.string().min(1, { message: 'Nome do bucket é obrigatório' }),
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
    const maxMinutes = 7 * 24 * 60 // 7 dias em minutos = 10080
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

type GcsDownloadUrlForm = z.infer<typeof gcsDownloadUrlFormSchema>

function convertToMinutes(
  value: number,
  unit: 'minutes' | 'hours' | 'days',
): number {
  switch (unit) {
    case 'minutes':
      return value
    case 'hours':
      return value * 60
    case 'days':
      return value * 24 * 60
    default:
      return value
  }
}

export function GcsDownloadUrlForm() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GcsDownloadUrlForm>({
    resolver: zodResolver(gcsDownloadUrlFormSchema),
    defaultValues: {
      file_name: '',
      bucket_name: '',
      expiration_value: 60,
      expiration_unit: 'minutes',
    },
  })

  const { mutateAsync: generateUrlMutation, isPending } = useMutation({
    mutationFn: generateDownloadUrl,
  })

  async function onSubmit(data: GcsDownloadUrlForm) {
    const expirationMinutes = convertToMinutes(
      data.expiration_value,
      data.expiration_unit,
    )

    try {
      const response = await generateUrlMutation({
        file_name: data.file_name,
        bucket_name: data.bucket_name,
        expiration_minutes: expirationMinutes,
      })
      setDownloadUrl(response.data.download_url)
      toast.success('Link de download gerado com sucesso!')
    } catch (error) {
      const errorMessage = getGcsErrorMessage(error)
      toast.error(errorMessage)
    }
  }

  async function handleCopyUrl() {
    if (downloadUrl) {
      try {
        await navigator.clipboard.writeText(downloadUrl)
        toast.success('URL copiada para a área de transferência!')
      } catch (error) {
        toast.error('Não foi possível copiar a URL.')
      }
    }
  }

  function handleReset() {
    reset()
    setDownloadUrl(null)
  }

  return (
    <div className="mx-auto w-full max-w-[700px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Criação de URL Temporária de Download</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="bucket_name">Nome do Bucket *</Label>
                <InputError message={errors.bucket_name?.message} />
              </div>
              <Input
                id="bucket_name"
                {...register('bucket_name')}
                type="text"
                placeholder="ex: meu-bucket"
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="file_name">Nome do Arquivo *</Label>
                <InputError message={errors.file_name?.message} />
              </div>
              <Input
                id="file_name"
                {...register('file_name')}
                type="text"
                placeholder="ex: arquivo.csv ou pasta1/arquivo2.csv ou pasta1/subpasta/arquivo3.csv"
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                Inclua o caminho completo com pastas, se necessário
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Label htmlFor="expiration_value">Validade *</Label>
                  <InputError message={errors.expiration_value?.message} />
                </div>
                <Input
                  id="expiration_value"
                  {...register('expiration_value', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={1}
                  placeholder="60"
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Label htmlFor="expiration_unit">Unidade *</Label>
                  <InputError message={errors.expiration_unit?.message} />
                </div>
                <Controller
                  control={control}
                  name="expiration_unit"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger id="expiration_unit">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>Gerar URL</span>
                  </>
                )}
              </Button>
              {downloadUrl && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Link Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="link"
                onClick={() => window.open(downloadUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir URL
              </Button>
              <Button type="button" variant="outline" onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar URL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
