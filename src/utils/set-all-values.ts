import { format } from 'date-fns'
import { UseFormSetValue } from 'react-hook-form'
import { z } from 'zod'

const zodAny = z.any()
export type ZodAnyType = z.infer<typeof zodAny>
type SetValueProps = UseFormSetValue<ZodAnyType>

function handleSetValue(
  key: string,
  value: unknown,
  {
    setValue,
  }: {
    setValue: SetValueProps
  },
) {
  const keyLowerCased = key.toLowerCase()

  if (
    keyLowerCased.includes('datainicioprevisto') ||
    keyLowerCased.includes('dataterminoprevisto')
  ) {
    if (value?.toString() ?? '') {
      setValue(key, format(new Date(`${value}`), 'yyyy-MM-dd HH:mm'), {
        shouldValidate: false,
      })
    }
  } else if (
    keyLowerCased.includes('data') ||
    keyLowerCased.includes('validade') ||
    key === 'inicioContrato' ||
    key === 'terminoContrato'
  ) {
    const valueAsString = String(value)

    if (valueAsString.split('-').length === 3 && !valueAsString.includes('T')) {
      setValue(key, valueAsString, { shouldValidate: false })
    } else if (!Number.isNaN(new Date(valueAsString).getTime())) {
      setValue(
        key,
        format(new Date(valueAsString.split('.000Z')[0]), 'yyyy-MM-dd'),
        { shouldValidate: false },
      )
    }
  } else {
    setValue(key, value, { shouldValidate: false })
  }
}

export const setAllValues = ({
  setValue,
  values,
  notContainsData = false,
  exclude = [],
}: {
  setValue: SetValueProps
  values: ZodAnyType
  notContainsData?: boolean
  exclude?: string[]
}) => {
  if (!values) return

  const objectToSet = notContainsData
    ? values
    : values?.data
      ? values.data
      : values

  Object.entries(objectToSet).forEach(
    ([key, value]: [key: string, value: unknown]) => {
      if (exclude.includes(key)) return

      if (typeof value === 'undefined' || value === null) {
        setValue(key, undefined)
        return
      }

      if (typeof value === 'object') {
        Object.entries(value).forEach((insideItem) => {
          handleSetValue(`${key}.${insideItem[0]}`, insideItem[1], {
            setValue,
          })
        })
      } else {
        handleSetValue(key, value, { setValue })
      }
    },
  )
}
