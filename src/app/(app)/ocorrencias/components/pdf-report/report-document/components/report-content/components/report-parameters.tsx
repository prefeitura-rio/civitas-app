import { Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import { cellStyle, type CellStyleProps, styles } from '../../styles'

interface ReportParametersProps {
  sourceIdContains?: string[]
  categoryContains?: string[]
  keywords?: string[]
  maxDate: string
  minDate: string
}

export function ReportParameters({
  sourceIdContains,
  categoryContains,
  keywords,
  maxDate,
  minDate,
}: ReportParametersProps) {
  const cellParams: CellStyleProps = {
    colSpan: 1,
    totalCols: 3,
    totalRows: 2,
  }

  const data = {
    Fonte: sourceIdContains?.join(', '),
    Data: `${formatDate(minDate, 'dd/MM/yyyy')} - ${formatDate(maxDate, 'dd/MM/yyyy')}`,
    'Busca semântica': keywords?.join(', '),
    Categorias: categoryContains?.join(', '),
  }

  return (
    <View style={styles.contentModuloContainer}>
      <Text style={styles.h2}>Parâmetros da busca</Text>
      <View style={styles.tr}>
        {Object.entries(data).map(([key, value], colIndex) => {
          if (value === '') return null
          return (
            <Text
              key={colIndex}
              style={cellStyle({ ...cellParams, rowIndex: 0, colIndex })}
            >
              {key}
            </Text>
          )
        })}
      </View>
      <View style={styles.tr}>
        {Object.values(data).map((value, colIndex) => {
          if (value === '') return null
          return (
            <Text
              key={colIndex}
              style={cellStyle({ ...cellParams, rowIndex: 1, colIndex })}
            >
              {value}
            </Text>
          )
        })}
      </View>
    </View>
  )
}
