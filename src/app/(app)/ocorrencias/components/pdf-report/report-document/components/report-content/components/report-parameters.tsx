import { Text, View } from '@react-pdf/renderer'

import { cellStyle, type CellStyleProps, styles } from '../../styles'

export function ReportParameters() {
  const cellParams: CellStyleProps = {
    colSpan: 1,
    totalCols: 3,
    totalRows: 2,
  }

  const data = {
    Fonte: 'Disque Denúncia',
    Data: '01/01/1999 - 01/01/2000',
    'Busca semântica': 'Sequestro',
  }

  return (
    <View style={styles.contentModuloContainer}>
      <Text style={styles.h2}>Parâmetros da busca</Text>
      <View style={styles.tr}>
        {Object.keys(data).map((key, colIndex) => (
          <Text
            key={colIndex}
            style={cellStyle({ ...cellParams, rowIndex: 0, colIndex })}
          >
            {key}
          </Text>
        ))}
      </View>
      <View style={styles.tr}>
        {Object.values(data).map((value, colIndex) => (
          <Text
            key={colIndex}
            style={cellStyle({ ...cellParams, rowIndex: 1, colIndex })}
          >
            {value}
          </Text>
        ))}
      </View>
    </View>
  )
}
