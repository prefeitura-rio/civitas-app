'use client'

import { Copy, ExternalLink, Link2 } from 'lucide-react'
import { Controller } from 'react-hook-form'

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

import { useDownloadUrlForm } from '../hooks/use-download-url-form'

interface GcsDownloadUrlFormProps {
  bucketName: string
}

export function GcsDownloadUrlForm({ bucketName }: GcsDownloadUrlFormProps) {
  const {
    register,
    control,
    errors,
    isPending,
    downloadUrl,
    handleSubmit,
    onSubmit,
    handleCopyUrl,
    handleReset,
  } = useDownloadUrlForm({ bucketName })

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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                asChild
              >
                <a href={downloadUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir URL
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
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
