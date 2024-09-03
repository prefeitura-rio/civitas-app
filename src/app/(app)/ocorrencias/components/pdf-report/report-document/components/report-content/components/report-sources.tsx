import { Text, View } from '@react-pdf/renderer'

import { cellStyle, type CellStyleProps, styles } from '../../styles'

export function ReportSources() {
  const cellParams: CellStyleProps = {
    colSpan: 1,
    totalCols: 2,
    totalRows: 3,
  }

  const rows = [
    { key: 'Tipo de denúncia', value: 'Total de denúncias' },
    { key: 'DD', value: 40 },
    { key: '1746', value: 140 },
  ]

  return (
    <View style={styles.contentModuloContainer}>
      <Text style={styles.h3}>
        1. Mapeamento de Denúncias - georreferenciamneto de denúncias no período
        XX/XX/XXXX - XX/XX/XXXX
      </Text>
      {rows.map(({ key, value }, rowIndex) => (
        <View key={rowIndex} style={styles.tr}>
          <Text style={cellStyle({ ...cellParams, rowIndex, colIndex: 0 })}>
            {key}
          </Text>
          <Text style={cellStyle({ ...cellParams, rowIndex, colIndex: 1 })}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  )
}
