'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CirclePlus,
  FileSpreadsheet,
  FilterX,
  Info,
  RectangleEllipsis,
  Trash2,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Papa from 'papaparse'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { RetrievePDFReportResponse } from '@/http/cars/correlated-plates-in-case-sets/retrieve-pdf-report'
import { requiredPlateHintSchema } from '@/utils/zod-schemas'

import JointPlatesInCaseSetsReportDownloadProgressAlert from '../../busca-por-placa/veiculo/components/action-bar/components/download-report-dialog/components/joint-plates-in-case-sets-report-download-progress-alert'

interface CsvRow {
  plate: string
  from: string
  to: string
}

// dateRangeSchema to ensure start <= end
const dateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'A data de início não pode ser posterior à data de fim.',
    path: ['from'],
  })

export const wideSearchSchema = z
  .object({
    plate: z.array(requiredPlateHintSchema).nonempty(),
    date: z.array(dateRangeSchema).nonempty(),
    keep_buses: z.boolean().optional(),
    beforeAfter: z.enum(['before', 'after', 'both']).optional(),
  })
  .refine((data) => data.plate.length === data.date.length, {
    message: 'Plate and date arrays must have the same length',
  })

enum FileType {
  'PDF' = 'PDF',
}

export type WideSearchFormData = z.infer<typeof wideSearchSchema>

export function CorrelatedPlatesInCaseSetsForm() {
  const searchParams = useSearchParams()
  const stateParam = searchParams.get('state')
  const vehicleTypesParam = searchParams.get('vehicle_types')
  const isCsvDisabled = !!vehicleTypesParam
  const prefilledData: Partial<
    RetrievePDFReportResponse['report_history']['body']
  > = stateParam ? JSON.parse(stateParam) : {}

  // Ensure `requested_plates_data` is defined before mapping
  const initialRows = prefilledData.requested_plates_data
    ? prefilledData.requested_plates_data.map((_, index) => ({
        id: Date.now() + index,
      }))
    : [{ id: Date.now() }, { id: Date.now() + 1 }]

  const [rows, setRows] = useState<{ id: number }[]>(initialRows)
  const [nMinutes, setNMinutes] = useState<number>(prefilledData.n_minutes || 3)
  const [nPlates, setNPlates] = useState<number>(
    prefilledData.min_different_targets || 2,
  )
  const [showDownloadDialog, setShowDownloadDialog] = useState<boolean>(false)
  const [fileType] = useState<FileType>(FileType.PDF)

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<WideSearchFormData>({
    resolver: zodResolver(wideSearchSchema),
    defaultValues: {
      plate:
        prefilledData.requested_plates_data?.map((data) => data.plate) ||
        rows.map(() => ''),
      date:
        prefilledData.requested_plates_data?.map((data) => ({
          from: data.start
            ? (() => {
                const d = new Date(data.start)
                d.setHours(0, 0, 0, 0)
                return d
              })()
            : (() => {
                const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
                d.setHours(0, 0, 0, 0)
                return d
              })(),
          to: data.end
            ? (() => {
                const d = new Date(data.end)
                d.setHours(23, 59, 0, 0)
                return d
              })()
            : (() => {
                const d = new Date()
                d.setHours(23, 59, 0, 0)
                return d
              })(),
        })) ||
        rows.map(() => ({
          from: (() => {
            const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
            d.setHours(0, 0, 0, 0)
            return d
          })(),
          to: (() => {
            const d = new Date()
            d.setHours(23, 59, 0, 0)
            return d
          })(),
        })),
      keep_buses: prefilledData.keep_buses ?? false,
      beforeAfter: prefilledData.before_after || 'both',
    },
  })
  const formData = watch()

  const onSubmit = (data: WideSearchFormData) => {
    const apiData = {
      ...data,
      beforeAfter: data.beforeAfter === 'both' ? undefined : data.beforeAfter,
    }
    console.log('Form submitted:', apiData)
    setShowDownloadDialog(true)
  }

  const addNewRow = () => {
    const newId = Date.now()
    setRows([...rows, { id: newId }])
    const currentPlates = getValues('plate') || []
    const currentDates = getValues('date') || []

    setValue('plate', [...currentPlates, ''] as [string, ...string[]])
    setValue('date', [
      ...currentDates,
      {
        from: new Date(
          new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).setSeconds(0, 0),
        ),
        to: new Date(new Date().setSeconds(0, 0)),
      },
    ] as [{ from: Date; to: Date }, ...Array<{ from: Date; to: Date }>])
  }

  const removeRow = (id: number) => {
    const index = rows.findIndex((row) => row.id === id)
    if (index >= 0) {
      const newRows = rows.filter((_, i) => i !== index)
      const currentPlates = getValues('plate') || []
      const currentDates = getValues('date') || []

      const newPlates = currentPlates.filter((_, i) => i !== index)
      const newDates = currentDates.filter((_, i) => i !== index)

      setValue('plate', newPlates as [string, ...string[]])
      setValue(
        'date',
        newDates as [
          { from: Date; to: Date },
          ...Array<{ from: Date; to: Date }>,
        ],
      )
      setRows(newRows)
    }
  }

  const handleClearPlates = () => {
    setRows([{ id: Date.now() }, { id: Date.now() + 1 }])
    setValue('plate', ['', ''] as [string, ...string[]])
    setValue('date', [
      {
        from: (() => {
          const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
          d.setHours(0, 0, 0, 0)
          return d
        })(),
        to: (() => {
          const d = new Date()
          d.setHours(23, 59, 0, 0)
          return d
        })(),
      },
      {
        from: (() => {
          const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
          d.setHours(0, 0, 0, 0)
          return d
        })(),
        to: (() => {
          const d = new Date()
          d.setHours(23, 59, 0, 0)
          return d
        })(),
      },
    ] as [{ from: Date; to: Date }, { from: Date; to: Date }])
  }

  return (
    <Card className="w-full border-none bg-transparent p-0 pb-4 shadow-none">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 overflow-hidden pb-4">
            <Label>Placas demandadas:</Label>
            <div className="flex items-center gap-2">
              <Tooltip
                text="Limpar placas"
                className="bg-secondary"
                asChild
                side="left"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={handleClearPlates}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
          {/* scrollable input rows */}
          <div className="max-h-72 overflow-y-auto pr-1">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="mb-2 grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="flex w-full items-center gap-2">
                  <div className="relative w-full">
                    <RectangleEllipsis className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Controller
                      name={`plate.${index}`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          placeholder="Placa do Veículo"
                          className="w-full pl-10 pr-4 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    />
                  </div>
                  {errors.plate && (
                    <span className="text-xs text-red-500">
                      {errors.plate.message}
                    </span>
                  )}
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Controller
                    name={`date.${index}.from`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        type="datetime-local"
                        value={field.value || new Date()}
                        onChange={(newDate) => {
                          if (newDate) {
                            field.onChange(newDate)
                          }
                        }}
                        fromDate={undefined} // Allow any past date
                        toDate={formData.date?.[index]?.to || today}
                        className="w-full"
                        placeholder="Data início"
                      />
                    )}
                  />
                  {errors.date?.[index]?.from?.message && (
                    <span className="text-xs text-red-500">
                      {errors.date?.[index]?.from?.message}
                    </span>
                  )}
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Controller
                    name={`date.${index}.to`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        type="datetime-local"
                        value={field.value || new Date()}
                        onChange={(newDate) => {
                          if (newDate) {
                            field.onChange(newDate)
                          }
                        }}
                        fromDate={formData.date?.[index]?.from || undefined}
                        toDate={today}
                        className="w-full"
                        placeholder="Data fim"
                      />
                    )}
                  />
                  {errors.date?.[index]?.to && (
                    <span className="text-xs text-red-500">
                      {errors.date?.[index]?.to?.message}
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  {index > 0 && (
                    <Button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="flex items-center bg-transparent p-0 text-red-500 hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {index === 0 && <span className="pl-4" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Tooltip
              text="Adicionar nova linha"
              className="bg-secondary"
              asChild
              side="right"
            >
              <Button
                type="button"
                onClick={addNewRow}
                className="flex items-center bg-transparent p-0 text-muted-foreground hover:bg-transparent"
              >
                <CirclePlus className="h-6 w-6" />
              </Button>
            </Tooltip>
          </div>
          <div className="relative my-2 flex w-full items-center justify-center pb-1.5">
            <Separator className="max-w-[200px] flex-1 bg-secondary" />
            <span className="mx-4 select-none text-xs text-muted-foreground">
              ou
            </span>
            <Separator className="max-w-[200px] flex-1 bg-secondary" />
          </div>
          {/* CSV Upload Section */}
          <Card
            className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-800 p-4 transition-colors ${isCsvDisabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary'}`}
          >
            <label
              htmlFor="csv-upload"
              className={`flex w-full flex-col items-center ${isCsvDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                <FileSpreadsheet className="h-5 w-5 text-white" />
                Importar de CSV
              </span>
              <span className="mb-2 text-xs text-gray-500">
                Clique para importar um arquivo CSV com as placas demandadas.
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                disabled={isCsvDisabled}
                onChange={async (e) => {
                  if (isCsvDisabled) return
                  const file = e.target.files?.[0]
                  if (!file) return
                  Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results: Papa.ParseResult<CsvRow>) => {
                      // Expecting columns: plate, from, to
                      const data = results.data
                      if (!Array.isArray(data) || data.length === 0) {
                        toast.error('CSV vazio ou inválido.')
                        e.target.value = ''
                        return
                      }
                      // Validate and map
                      const plates: string[] = []
                      const dates: { from: Date; to: Date }[] = []
                      for (const row of data) {
                        if (!row.plate || !row.from || !row.to) {
                          toast.error(
                            'Cada linha deve conter as colunas: plate, from, to.',
                          )
                          e.target.value = ''
                          return
                        }
                        const fromDate = new Date(row.from)
                        const toDate = new Date(row.to)
                        if (
                          isNaN(fromDate.getTime()) ||
                          isNaN(toDate.getTime())
                        ) {
                          toast.error('Datas inválidas no CSV.')
                          e.target.value = ''
                          return
                        }
                        plates.push(row.plate.toUpperCase())
                        dates.push({ from: fromDate, to: toDate })
                      }
                      setRows(plates.map((_, i) => ({ id: Date.now() + i })))
                      setValue('plate', plates as [string, ...string[]])
                      setValue(
                        'date',
                        dates as [
                          { from: Date; to: Date },
                          ...Array<{ from: Date; to: Date }>,
                        ],
                      )
                      e.target.value = '' // Reset file input so same file can be uploaded again
                    },
                    error: () => {
                      toast.error('Erro ao processar o CSV.')
                      e.target.value = '' // Reset file input on error as well
                    },
                  })
                }}
              />
            </label>
          </Card>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Label>Intervalo de interesse ao redor das detecções:</Label>
            <div className="w-full space-y-2 pl-4 pr-2 pt-6">
              <Slider
                unity="min"
                value={[nMinutes]}
                onValueChange={(value) => {
                  setNMinutes(value[0])
                }}
                defaultValue={[nMinutes]}
                max={20}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 1 min</span>
                <span>Max: 20 min</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quantidade mínima de placas de interesse diferentes:</Label>
            <div className="w-full space-y-2 pl-4 pr-2 pt-6">
              <Slider
                unity="placas"
                value={[nPlates]}
                onValueChange={(value) => {
                  setNPlates(value[0])
                }}
                defaultValue={[nPlates]}
                max={100}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 1 placas</span>
                <span>Max: 100 placas</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Label>Detecções antes, depois ou ambas:</Label>
            <div className="w-full">
              <Controller
                control={control}
                name="beforeAfter"
                render={({ field }) => (
                  <RadioGroup
                    className="flex w-full justify-between"
                    value={field.value || 'both'}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" />
                      <Label className="cursor-pointer">
                        Detecções antes e depois
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="before" />
                      <Label className="cursor-pointer">Detecções antes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="after" />
                      <Label className="cursor-pointer">Detecções depois</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Manter ônibus municipais nos resultados?</Label>
              <Tooltip
                text="Filtra apenas os ônibus da prefeitura (base da smtr)"
                side="right"
              >
                <Info className="size-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name="keep_buses"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      id="keep_buses_switch"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                    <Label htmlFor="keep_buses_switch" className="text-xs">
                      {field.value ? 'Sim' : 'Não'}
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="flex items-center gap-2">
            Gerar Relatório
          </Button>
        </div>
      </form>

      <JointPlatesInCaseSetsReportDownloadProgressAlert
        open={showDownloadDialog}
        setOpen={setShowDownloadDialog}
        nMinutes={nMinutes}
        minDifferentTargets={nPlates}
        keepBuses={formData.keep_buses}
        beforeAfter={
          formData.beforeAfter === 'both' ? undefined : formData.beforeAfter
        }
        fileType={fileType}
        formData={formData || {}} // Ensure formData is not undefined
      />
    </Card>
  )
}
