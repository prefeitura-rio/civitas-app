'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, RectangleEllipsis, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import MultipleSelector from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { dateRangeSchema, requiredPlateHintSchema } from '@/utils/zod-schemas'

import JointPlatesInCaseSetsReportDownloadProgressAlert from '../../busca-por-placa/veiculo/components/action-bar/components/download-report-dialog/components/joint-plates-in-case-sets-report-download-progress-alert'

export const wideSearchSchema = z
  .object({
    plate: z.array(requiredPlateHintSchema).nonempty(),
    date: z.array(dateRangeSchema).nonempty(),
    vehicleTypes: z.array(z.string()).optional(),
    beforeAfter: z.enum(['before', 'after', 'both']).default('after'),
  })
  .refine((data) => data.plate.length === data.date.length, {
    message: 'Plate and date arrays must have the same length',
  })

enum FileType {
  'PDF' = 'PDF',
}

export type WideSearchFormData = z.infer<typeof wideSearchSchema>

export function CorrelatedPlatesInCaseSetsForm() {
  const [rows, setRows] = useState([
    { id: Date.now() },
    { id: Date.now() + 1 },
    { id: Date.now() + 2 },
  ])
  const [nMinutes, setNMinutes] = useState(1)
  const [nPlates, setNPlates] = useState(5)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [fileType] = useState<FileType>(FileType.PDF)

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
      plate: rows.map(() => '') as [string, ...string[]], // Cast to tuple type
      date: rows.map(() => ({
        from: new Date(
          new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).setSeconds(0, 0),
        ),
        to: new Date(new Date().setSeconds(0, 0)),
      })) as [{ from: Date; to: Date }, ...Array<{ from: Date; to: Date }>],
      vehicleTypes: [],
      beforeAfter: 'before',
    },
  })
  const formData = watch()

  const onSubmit = (data: WideSearchFormData) => {
    console.log('Form submitted:', data)
    setShowDownloadDialog(true)
  }

  const addNewRow = () => {
    const newId = Date.now()
    setRows([...rows, { id: newId }])
    // get current values
    const currentPlates = getValues('plate')
    const currentDates = getValues('date')

    // add new values with type assertion
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
      // create new arrays without the removed item
      const newRows = rows.filter((_, i) => i !== index)

      // get current form values
      const currentPlates = getValues('plate')
      const currentDates = getValues('date')

      // remove the item at the specified index
      const newPlates = currentPlates.filter((_, i) => i !== index)
      const newDates = currentDates.filter((_, i) => i !== index)

      // ppdate form values with type assertions
      setValue('plate', newPlates as [string, ...string[]])
      setValue(
        'date',
        newDates as [
          { from: Date; to: Date },
          ...Array<{ from: Date; to: Date }>,
        ],
      )

      // update the rows state
      setRows(newRows)
    }
  }

  return (
    <Card className="w-full border-none bg-transparent p-0 pb-4 shadow-none">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Card className="p-4">
          <div className="flex flex-col gap-4 overflow-hidden">
            <Label>Placas demandadas:</Label>
            <span className="h"></span>
          </div>
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
                      value={field.value}
                      onChange={(newDate) => {
                        if (newDate) {
                          field.onChange(newDate)
                        }
                      }}
                      fromDate={new Date(2024, 5, 1)}
                      toDate={formData.date?.[index]?.to || new Date()}
                      className="w-full"
                      placeholder="Data início"
                    />
                  )}
                />
                {errors.date?.[index]?.from && (
                  <span className="text-xs text-red-500">
                    {errors.date[index].from.message}
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
                      value={field.value}
                      onChange={(newDate) => {
                        if (newDate) {
                          field.onChange(newDate)
                        }
                      }}
                      fromDate={
                        formData.date?.[index]?.from || new Date(2024, 5, 1)
                      }
                      toDate={new Date()}
                      className="w-full"
                      placeholder="Data fim"
                    />
                  )}
                />
                {errors.date?.[index]?.to && (
                  <span className="text-xs text-red-500">
                    {errors.date[index].to.message}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                {index > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="flex items-center bg-transparent p-0 text-red-500 hover:bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {(index === 1 || index === 0) && <span className="pl-4" />}
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={addNewRow}
              className="flex items-center bg-transparent p-0 text-muted-foreground hover:bg-transparent"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
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
                max={5}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 1 min</span>
                <span>Max: 5 min</span>
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
                max={50}
                min={5}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 5 placas</span>
                <span>Max: 50 placas</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Label>Detecções anteriores, posteriores ou ambas:</Label>
            <div className="w-full">
              <Controller
                control={control}
                name="beforeAfter"
                render={({ field }) => (
                  <RadioGroup
                    className="flex w-full justify-between"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="before" />
                      <Label className="cursor-pointer">
                        Detecções anteriores
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="after" />
                      <Label className="cursor-pointer">
                        Detecções posteriores
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" />
                      <Label className="cursor-pointer">Ambas</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Label>Tipos de Veículos:</Label>
            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name="vehicleTypes"
                render={({ field }) => (
                  <MultipleSelector
                    {...field}
                    value={field.value?.map((v) => ({ label: v, value: v }))}
                    onChange={(selected) =>
                      field.onChange(selected.map((option) => option.value))
                    }
                    defaultOptions={[
                      { label: 'Automóvel', value: 'automovel' },
                      { label: 'Caminhão', value: 'caminhao' },
                      {
                        label: 'Caminhão / Ônibus',
                        value: 'caminha_onibus',
                      },
                      { label: 'Ciclomotor', value: 'ciclomotor' },
                      { label: 'Indefinido', value: 'indefinido' },
                      { label: 'Moto', value: 'moto' },
                      { label: 'Ônibus', value: 'onibus' },
                    ]}
                    placeholder="Selecione os tipos de veículos"
                    emptyIndicator={<p>Nenhum resultado encontrado.</p>}
                  />
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
        vehicleTypes={formData.vehicleTypes || []}
        beforeAfter={formData.beforeAfter || 'after'}
        fileType={fileType}
        formData={formData}
      />
    </Card>
  )
}
